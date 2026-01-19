import React, { useState } from 'react';
import { FaMapMarkerAlt, FaClock, FaPhoneAlt } from 'react-icons/fa';
import { BRANCHES } from '../utils/constants';
import { useNavigate } from 'react-router-dom';

const BranchesSection = () => {
  const navigate = useNavigate();
  const [selectedBranchId, setSelectedBranchId] = useState(BRANCHES[0].id);
  const selectedBranch = BRANCHES.find(b => b.id === selectedBranchId) || BRANCHES[0];

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
            <div className="space-y-4">
              {BRANCHES.map((branch) => (
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
              ))}
            </div>
          </div>

          {/* Right Column: Branch Details */}
          <div>
            <div className="bg-[#1E1E1E] rounded-xl overflow-hidden h-full flex flex-col">
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
              <div className="h-64 w-full">
                <img 
                  src={selectedBranch.image} 
                  alt={selectedBranch.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BranchesSection;
