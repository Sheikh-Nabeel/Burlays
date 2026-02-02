import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { FaMapMarkerAlt, FaSpinner, FaMotorcycle, FaTimes } from 'react-icons/fa';

const BranchSelection = ({ onSelectBranch }) => {
  const [cities, setCities] = useState([]);
  const [tradeAreas, setTradeAreas] = useState([]);
  
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedTradeArea, setSelectedTradeArea] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch Cities on Mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'cities'));
        const citiesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).filter(city => city.status); // Only show active cities
        setCities(citiesData);
      } catch (error) {
        console.error("Error fetching cities:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchCities();
  }, []);

  // Fetch Trade Areas when City changes
  useEffect(() => {
    const fetchTradeAreas = async () => {
      if (!selectedCity) {
        setTradeAreas([]);
        return;
      }
      
      setLoading(true);
      try {
        // Correctly reference the sub-collection within the city document
        const cityRef = doc(db, 'cities', selectedCity);
        const tradeAreasRef = collection(cityRef, 'trade_areas');
        
        const querySnapshot = await getDocs(tradeAreasRef);
        const areasData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTradeAreas(areasData);
        setSelectedTradeArea(''); // Reset trade area selection
      } catch (error) {
        console.error("Error fetching trade areas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTradeAreas();
  }, [selectedCity]);

  const handleSubmit = async () => {
    if (!selectedTradeArea) return;

    setLoading(true);
    try {
      // Find the selected trade area object to get the branchId
      const area = tradeAreas.find(a => a.id === selectedTradeArea);
      
      // Check for both 'branchId' (standard camelCase) and 'branch_id' (common Firestore snake_case)
      const targetBranchId = area?.branchId || area?.branch_id;

      if (!area || !targetBranchId) {
        console.error("No branch assigned to this area. Area Data:", area);
        alert("Sorry, no branch is currently assigned to this area.");
        return;
      }

      // Access the sub-collection 'branches' inside the city document
      // Assuming the structure is: cities -> [cityId] -> branches -> [branchId]
      // Or if it's a global branches collection: branches -> [branchId]
      
      // Based on user input: "the branch exist but in that cicties collection it is not new collection it is within that cicties collection"
      // This implies: cities -> [cityId] -> branches -> [branchId]
      
      const cityRef = doc(db, 'cities', selectedCity);
      const branchRef = doc(cityRef, 'branches', targetBranchId);
      
      const branchSnap = await getDoc(branchRef);

      if (branchSnap.exists()) {
        const branchData = { id: branchSnap.id, ...branchSnap.data() };
        
        // Save to localStorage and notify App
        localStorage.setItem('selectedBranch', JSON.stringify(branchData));
        onSelectBranch(branchData);
      } else {
        // Fallback: Check global 'branches' collection just in case
        console.warn("Branch not found in city sub-collection, checking global...");
        const globalBranchRef = doc(db, 'branches', targetBranchId);
        const globalBranchSnap = await getDoc(globalBranchRef);
        
        if (globalBranchSnap.exists()) {
             const branchData = { id: globalBranchSnap.id, ...globalBranchSnap.data() };
             localStorage.setItem('selectedBranch', JSON.stringify(branchData));
             onSelectBranch(branchData);
        } else {
            console.error("Branch not found in database:", targetBranchId);
            alert("The assigned branch could not be found. Please contact support.");
        }
      }
    } catch (error) {
      console.error("Error selecting branch:", error);
      alert("An error occurred while selecting the branch.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <FaSpinner className="animate-spin text-4xl text-[#FFC72C]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/hero-bg.jpg')", backgroundColor: '#1a1a1a' }}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden mx-4 animate-fadeIn">
        
        {/* Header */}
        <div className="p-6 text-center border-b border-gray-100">
          <img src="/logo.png" alt="Logo" className="h-16 mx-auto mb-4 object-contain" />
          <h2 className="text-xl font-bold text-gray-800">Select your order type</h2>
          
          <div className="mt-4 flex justify-center">
            <button className="bg-[#28a745] text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-md transform scale-105">
                <FaMotorcycle /> DELIVERY
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 bg-gray-50">
            <h3 className="text-center font-bold text-gray-700 mb-4 flex items-center justify-center gap-2">
                <FaMapMarkerAlt className="text-[#E25C1D]" /> Please select your location
            </h3>

            <div className="space-y-4">
                {/* City Select */}
                <div className="relative">
                    <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full p-3 rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FFC72C] appearance-none"
                    >
                        <option value="">Select City</option>
                        {cities.map(city => (
                            <option key={city.id} value={city.id}>{city.name}</option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        ▼
                    </div>
                </div>

                {/* Trade Area Select */}
                <div className="relative">
                    <select
                        value={selectedTradeArea}
                        onChange={(e) => setSelectedTradeArea(e.target.value)}
                        disabled={!selectedCity || loading}
                        className="w-full p-3 rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FFC72C] appearance-none disabled:bg-gray-100 disabled:text-gray-400"
                    >
                        <option value="">
                            {loading ? "Loading areas..." : "Select Area"}
                        </option>
                        {tradeAreas.map(area => (
                            <option key={area.id} value={area.id}>{area.name}</option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        ▼
                    </div>
                </div>
            </div>

            <button
                onClick={handleSubmit}
                disabled={!selectedTradeArea || loading}
                className="w-full mt-6 bg-[#E25C1D] text-white font-bold py-3 rounded-xl shadow-lg hover:bg-[#c94e16] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {loading && <FaSpinner className="animate-spin" />}
                Select
            </button>
        </div>
      </div>
    </div>
  );
};

export default BranchSelection;
