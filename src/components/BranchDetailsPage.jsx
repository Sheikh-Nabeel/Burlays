import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BRANCHES } from '../utils/constants';
import { FaArrowLeft, FaMapMarkerAlt, FaMotorcycle, FaUtensils, FaShoppingBag } from 'react-icons/fa';

const BranchDetailsPage = () => {
  const { branchId } = useParams();
  const navigate = useNavigate();
  
  const branch = BRANCHES.find(b => b.id === parseInt(branchId));

  if (!branch) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Branch Not Found</h2>
          <button onClick={() => navigate('/branches')} className="text-[#E25C1D] hover:underline">
            Back to Locator
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
            <button 
                onClick={() => navigate(-1)} 
                className="p-2 hover:bg-gray-50 rounded-full transition-colors"
            >
                <FaArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                {branch.name}
            </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Side - Details Card */}
            <div className="w-full lg:w-1/2">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8">
                        {/* Branch Info Header */}
                        <div className="flex gap-4 mb-8">
                            <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-100">
                                <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">{branch.name}</h2>
                                <p className="text-gray-500 text-sm leading-relaxed">{branch.address}</p>
                            </div>
                        </div>

                        {/* Get Direction Button */}
                        <a 
                            href={branch.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-[#FFC72C] text-black font-bold text-sm px-8 py-3 rounded-lg hover:bg-[#ffcf4b] transition-colors shadow-sm mb-8"
                        >
                            GET DIRECTION
                        </a>

                        <hr className="border-gray-100 mb-8" />

                        {/* Services */}
                        <div className="mb-8">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                                Services Available Here :
                            </h3>
                            <div className="flex flex-wrap gap-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                <div className="flex items-center gap-2">
                                    <FaMotorcycle className="w-4 h-4 text-gray-400" />
                                    <span>Delivery</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaUtensils className="w-4 h-4 text-gray-400" />
                                    <span>Dine In</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaShoppingBag className="w-4 h-4 text-gray-400" />
                                    <span>Pick-Up</span>
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-100 mb-8" />

                        {/* Hours */}
                        <div>
                            <h3 className="font-bold text-gray-900 mb-4 text-sm">
                                Opening and Closing Hours :
                            </h3>
                            <div className="space-y-3 text-sm text-gray-600">
                                <div className="flex justify-between">
                                    <span>Monday - Thursday</span>
                                    <span className="font-medium">11:00AM to 03:00AM</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Friday</span>
                                    <span className="font-medium">11:00AM to 03:00AM</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Saturday - Sunday</span>
                                    <span className="font-medium">11:00AM to 03:00AM</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Map */}
            <div className="w-full lg:w-1/2 h-[400px] lg:h-auto min-h-[500px] bg-[#F3F4F6] rounded-2xl overflow-hidden relative border border-gray-200">
                {/* Simulated Map Background */}
                <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=33.5156,73.8560&zoom=14&size=800x600&maptype=roadmap&style=feature:poi|visibility:off&key=YOUR_API_KEY_HERE')] bg-cover bg-center opacity-60 grayscale-[10%]"></div>
                
                {/* Map Fallback */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Google_Maps_Logo_2020.svg/1024px-Google_Maps_Logo_2020.svg.png" 
                        alt="Map" 
                        className="w-24 opacity-20"
                     />
                </div>

                {/* Marker */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full">
                    <div className="relative">
                        <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white animate-bounce">
                            <FaMapMarkerAlt className="text-white w-6 h-6" />
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-1.5 bg-black/20 rounded-full blur-[2px]"></div>
                    </div>
                </div>

                {/* Bottom Right Floating Button */}
                <button className="absolute bottom-6 right-6 bg-[#E25C1D] text-white font-bold px-6 py-3 rounded-lg shadow-lg hover:bg-[#c94e16] transition-colors text-sm uppercase">
                    Order Now
                </button>
            </div>

        </div>
      </div>
    </div>
  );
};

export default BranchDetailsPage;
