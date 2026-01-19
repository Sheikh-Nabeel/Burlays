import React, { useState } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { BRANCHES } from '../utils/constants';

const BranchLocatorPage = () => {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter branches based on city and search query
  const filteredBranches = BRANCHES.filter(branch => {
    // Extract city from address for demo purposes (simple check)
    const cityMatch = !selectedCity || branch.address.toLowerCase().includes(selectedCity.toLowerCase());
    const queryMatch = !searchQuery || 
      branch.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      branch.address.toLowerCase().includes(searchQuery.toLowerCase());
    return cityMatch && queryMatch;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Back Button */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-black">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Branch Locator</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Side - Controls & List */}
            <div className="w-full lg:w-1/3 space-y-6">
                {/* Controls */}
                <div className="flex gap-4">
                    <div className="w-1/2 relative">
                        <select 
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 appearance-none focus:outline-none focus:border-[#FFC72C] text-gray-500"
                        >
                            <option value="">Select City</option>
                            <option value="Islamabad">Islamabad</option>
                            <option value="Rawalpindi">Rawalpindi</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                        </div>
                    </div>
                    <div className="w-1/2">
                        <input 
                            type="text" 
                            placeholder="Search Branch" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#FFC72C] placeholder-gray-400"
                        />
                    </div>
                </div>

                {/* Branch List */}
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredBranches.map((branch) => (
                        <div key={branch.id} className="bg-gray-50 p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex gap-4 mb-4">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                                    <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">{branch.name}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{branch.address}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => navigate(`/branches/${branch.id}`)}
                                className="inline-block bg-[#FFC72C] text-black font-bold text-xs px-6 py-2.5 rounded-lg hover:bg-[#ffcf4b] transition-colors uppercase tracking-wide"
                            >
                                View Details
                            </button>
                        </div>
                    ))}
                    
                    {filteredBranches.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                            No branches found matching your criteria.
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side - Map */}
            <div className="w-full lg:w-2/3 h-[500px] lg:h-auto min-h-[600px] bg-[#F3F4F6] rounded-xl overflow-hidden relative border border-gray-200">
                {/* Simulated Map Background */}
                <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=33.5156,73.8560&zoom=10&size=800x600&maptype=roadmap&style=feature:poi|visibility:off&key=YOUR_API_KEY_HERE')] bg-cover bg-center opacity-50 grayscale-[20%]"></div>
                
                {/* Fallback Map Placeholder if image fails or for visual representation */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Google_Maps_Logo_2020.svg/1024px-Google_Maps_Logo_2020.svg.png" 
                        alt="Map" 
                        className="w-24 opacity-20"
                     />
                </div>

                {/* Simulated Map Markers */}
                {filteredBranches.map((branch, index) => (
                    <div 
                        key={branch.id}
                        className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer group"
                        style={{ 
                            top: `${30 + (index * 15)}%`, 
                            left: `${40 + (index * 10)}%` 
                        }}
                    >
                        <div className="w-10 h-10 bg-[#FFC72C] rounded-full flex items-center justify-center shadow-lg border-2 border-white transform transition-transform group-hover:scale-110">
                            <FaMapMarkerAlt className="text-black w-5 h-5" />
                        </div>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-white p-2 rounded shadow-lg text-xs hidden group-hover:block z-10 text-center">
                            <p className="font-bold">{branch.name}</p>
                        </div>
                    </div>
                ))}

                {/* Map Controls */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <button className="w-8 h-8 bg-white rounded shadow flex items-center justify-center hover:bg-gray-50 font-bold text-gray-600">+</button>
                    <button className="w-8 h-8 bg-white rounded shadow flex items-center justify-center hover:bg-gray-50 font-bold text-gray-600">−</button>
                </div>
                
                {/* Bottom Right Floating Button */}
                <button className="absolute bottom-6 right-6 bg-[#E25C1D] text-white font-bold px-6 py-2.5 rounded-lg shadow-lg hover:bg-[#c94e16] transition-colors text-sm uppercase">
                    Order Now
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default BranchLocatorPage;
