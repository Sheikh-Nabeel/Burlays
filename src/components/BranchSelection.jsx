import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaSpinner } from 'react-icons/fa';

const BranchSelection = ({ onSelectBranch }) => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState(null);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'branches'));
        const branchesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBranches(branchesData);
      } catch (error) {
        console.error("Error fetching branches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  const handleSelect = (branch) => {
    setSelectedBranch(branch);
    localStorage.setItem('selectedBranch', JSON.stringify(branch));
    onSelectBranch(branch);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <FaSpinner className="animate-spin text-4xl text-[#FFC72C]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="text-center mb-10">
        <img src="/logo.png" alt="Burlays" className="h-20 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Select Your Branch</h1>
        <p className="text-gray-500 mt-2">Choose a branch to see the menu and offers near you.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full">
        {branches.map((branch) => (
          <button
            key={branch.id}
            onClick={() => handleSelect(branch)}
            className="flex flex-col items-center p-6 rounded-2xl border-2 border-gray-100 hover:border-[#FFC72C] hover:bg-[#FFF9E5] transition-all group text-left w-full bg-gray-50 overflow-hidden"
          >
            <div className="w-full h-32 bg-gray-200 rounded-xl mb-4 overflow-hidden relative">
               {branch.imageUrl ? (
                 <img 
                   src={branch.imageUrl} 
                   alt={branch.name} 
                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                 />
               ) : (
                 <div className="w-full h-full flex items-center justify-center">
                    <FaMapMarkerAlt className="text-[#E25C1D] text-3xl" />
                 </div>
               )}
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-1">{branch.name}</h3>
            <p className="text-sm text-gray-500 text-center">{branch.location}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BranchSelection;
