import React, { useState, useEffect } from 'react';
import { FaPaperPlane, FaSpinner, FaBriefcase } from 'react-icons/fa';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, getDocs, collectionGroup } from 'firebase/firestore';
import { toast } from 'react-toastify';

const JobOpportunities = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    message: '',
    city: '',
    branch: ''
  });

  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const querySnapshot = await getDocs(collectionGroup(db, 'branches'));
        const branchesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBranches(branchesData);
        
        // Extract unique cities
        const uniqueCities = [...new Set(branchesData.map(b => {
             // Try to extract city from location or use a city field if it exists
             // Assuming location string like "Address, City"
             if (b.location) {
                 const parts = b.location.split(',');
                 return parts.length > 1 ? parts[parts.length - 2].trim() : b.location;
             }
             return "Unknown City";
        }))].filter(Boolean).sort();
        
        setCities(uniqueCities);

      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    };

    fetchBranches();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.position || !formData.city || !formData.branch) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "job_applications"), {
        ...formData,
        createdAt: serverTimestamp()
      });
      
      toast.success("Application submitted successfully!");
      setFormData({
        name: '',
        email: '',
        phone: '',
        position: '',
        experience: '',
        message: '',
        city: '',
        branch: ''
      });
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter branches based on selected city
  const filteredBranches = formData.city 
    ? branches.filter(b => (b.location || '').includes(formData.city))
    : branches;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="mx-auto h-12 w-12 bg-[#FFC72C] rounded-full flex items-center justify-center mb-4">
            <FaBriefcase className="h-6 w-6 text-black" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Join Our Team</h2>
          <p className="mt-2 text-lg text-gray-600">
            We're looking for talented individuals to help us grow. Apply now!
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="px-8 py-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:ring-[#FFC72C] focus:border-[#FFC72C] transition-colors"
                    placeholder="John Doe"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:ring-[#FFC72C] focus:border-[#FFC72C] transition-colors"
                    placeholder="john@example.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:ring-[#FFC72C] focus:border-[#FFC72C] transition-colors"
                    placeholder="+92 300 1234567"
                  />
                </div>

                {/* Position */}
                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700">Position Applied For *</label>
                  <select
                    name="position"
                    id="position"
                    required
                    value={formData.position}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:ring-[#FFC72C] focus:border-[#FFC72C] bg-white transition-colors"
                  >
                    <option value="">Select Position</option>
                    <option value="manager">Manager</option>
                    <option value="chef">Chef / Cook</option>
                    <option value="server">Server / Waiter</option>
                    <option value="rider">Delivery Rider</option>
                    <option value="cashier">Cashier</option>
                    <option value="cleaner">Cleaner</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                 {/* Experience */}
                 <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700">Years of Experience</label>
                  <input
                    type="text"
                    name="experience"
                    id="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:ring-[#FFC72C] focus:border-[#FFC72C] transition-colors"
                    placeholder="e.g. 2 years"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* City Selection */}
                <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">City *</label>
                    <select
                        name="city"
                        id="city"
                        required
                        value={formData.city}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:ring-[#FFC72C] focus:border-[#FFC72C] bg-white transition-colors"
                    >
                        <option value="">Select City</option>
                        {cities.map((city, index) => (
                            <option key={index} value={city}>{city}</option>
                        ))}
                    </select>
                </div>

                {/* Branch Selection */}
                <div>
                    <label htmlFor="branch" className="block text-sm font-medium text-gray-700">Branch *</label>
                    <select
                        name="branch"
                        id="branch"
                        required
                        value={formData.branch}
                        onChange={handleChange}
                        disabled={!formData.city}
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:ring-[#FFC72C] focus:border-[#FFC72C] bg-white transition-colors disabled:bg-gray-100 disabled:text-gray-400"
                    >
                        <option value="">Select Branch</option>
                        {filteredBranches.map((branch) => (
                            <option key={branch.id} value={branch.name}>{branch.name}</option>
                        ))}
                    </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Cover Letter / Message</label>
                <textarea
                  name="message"
                  id="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:ring-[#FFC72C] focus:border-[#FFC72C] transition-colors"
                  placeholder="Tell us a bit about yourself..."
                ></textarea>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-black bg-[#FFC72C] hover:bg-[#ffcf4b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFC72C] transition-all disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="-ml-1 mr-3 h-4 w-4" />
                      Submit Application
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobOpportunities;