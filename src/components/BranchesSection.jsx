import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaClock, FaPhoneAlt, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const BranchesSection = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch branches from Firestore (Nested structure: cities -> branches)
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const citiesRef = collection(db, 'cities');
        const citiesSnapshot = await getDocs(citiesRef);
        
        const allBranches = [];
        
        await Promise.all(citiesSnapshot.docs.map(async (cityDoc) => {
            // Check for inactive cities if needed
            const cityData = cityDoc.data();
            if (cityData.status === false) return;

            const branchesRef = collection(db, `cities/${cityDoc.id}/branches`);
            const branchesSnapshot = await getDocs(branchesRef);
            
            branchesSnapshot.docs.forEach(branchDoc => {
                const branchData = branchDoc.data();
                if (branchData.status !== false) { // Only active branches
                    allBranches.push({
                        id: branchDoc.id,
                        cityId: cityDoc.id,
                        name: branchData.name,
                        address: branchData.location || branchData.address || "Address not available",
                        phone: branchData.phone || "N/A",
                        timing: branchData.timing || "11:00 AM - 12:00 AM", // Default fallback or fetch if available
                        image: branchData.imageUrl || branchData.image || "https://via.placeholder.com/400x300",
                        lat: branchData.lat,
                        lng: branchData.lng
                    });
                }
            });
        }));

        setBranches(allBranches);
        if (allBranches.length > 0) {
            setSelectedBranchId(allBranches[0].id);
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  const selectedBranch = branches.find(b => b.id === selectedBranchId) || branches[0];

  if (loading) {
      return (
          <div className="bg-black py-16 text-white min-h-[400px] flex items-center justify-center">
              <FaSpinner className="animate-spin text-4xl text-[#FFC72C]" />
          </div>
      );
  }

  return (
    <div className="bg-black py-16 text-white">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Navigation Tabs */}
        <div className="flex justify-center gap-8 mb-12 text-lg font-semibold border-b border-gray-800 pb-4">
          <button 
            onClick={() => navigate('/branches')}
            className="text-white border-b-2 border-[#FFC72C] pb-4 -mb-4.5"
          >
            Branches Location
          </button>
          <button className="text-gray-500 hover:text-white transition-colors pb-4">
            Download App
          </button>
          <button className="text-gray-500 hover:text-white transition-colors pb-4">
            Brand Story
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Branch List */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Our Branches</h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700">
              {branches.length === 0 ? (
                  <p className="text-gray-400">No branches found.</p>
              ) : (
                  branches.map((branch) => (
                    <button
                      key={branch.id}
                      onClick={() => setSelectedBranchId(branch.id)}
                      className={`w-full text-left p-6 rounded-lg flex items-start gap-4 transition-all ${
                        selectedBranchId === branch.id
                          ? 'bg-[#FFC72C] text-black' // Active state
                          : 'bg-[#1E1E1E] text-white hover:bg-gray-800' // Inactive state
                      }`}
                    >
                      <FaMapMarkerAlt className={`mt-1 flex-shrink-0 ${
                        selectedBranchId === branch.id ? 'text-black' : 'text-white'
                      }`} />
                      <div>
                        <h3 className="font-bold text-lg leading-tight mb-1">{branch.name}</h3>
                        <p className={`text-sm opacity-80 ${
                            selectedBranchId === branch.id ? 'text-black' : 'text-gray-400'
                        }`}>
                            {branch.address}
                        </p>
                      </div>
                    </button>
                  ))
              )}
            </div>
          </div>

          {/* Right Column: Branch Details */}
          <div>
            {selectedBranch && (
                <div className="bg-[#1E1E1E] rounded-xl overflow-hidden h-full flex flex-col sticky top-4">
                <div className="p-8 flex-1">
                    <h2 className="text-2xl font-bold text-[#FFC72C] mb-6 leading-tight">
                    {selectedBranch.name}
                    </h2>
                    
                    <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3">
                        <FaClock className="text-gray-400" />
                        <span>Timing: {selectedBranch.timing}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <FaPhoneAlt className="text-gray-400" />
                        <span>{selectedBranch.phone}</span>
                    </div>
                    <div className="flex items-start gap-3">
                        <FaMapMarkerAlt className="text-gray-400 mt-1" />
                        <span className="leading-relaxed">{selectedBranch.address}</span>
                    </div>
                    </div>
                </div>

                {/* Branch Image */}
                <div className="w-full aspect-square">
                    <img 
                    src={selectedBranch.image} 
                    alt={selectedBranch.name} 
                    className="w-full h-full object-cover"
                    />
                </div>
                </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default BranchesSection;
