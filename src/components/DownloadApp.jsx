import React from 'react';
import { FaArrowRight } from "react-icons/fa";

const DownloadApp = () => {
  return (
    <div className="bg-white py-16 flex justify-center">
      <div className="max-w-6xl w-full mx-4 relative">
        {/* Yellow Background Card */}
        <div className="bg-[#FFD43B] rounded-[40px] p-8 md:p-12 lg:px-20 lg:py-16 flex flex-col md:flex-row items-center relative overflow-hidden shadow-sm">
           
           {/* Decorative Pizza Icon - Top Right */}
           <div className="absolute top-0 right-10 md:right-20 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-sm z-10">
              <img 
                 src="https://cdn-icons-png.flaticon.com/512/3595/3595458.png" 
                 alt="Pizza" 
                 className="w-12 h-12 md:w-16 md:h-16 object-contain"
              />
           </div>

           {/* Left Side - Phone Image */}
           <div className="relative w-full md:w-1/2 flex justify-center md:justify-start mb-10 md:mb-0 z-10">
              <div className="relative w-64 md:w-72 lg:w-80 -ml-4 md:-ml-12 lg:-ml-20 mt-4 md:-mt-12 lg:-mt-20 transform rotate-[-5deg] md:rotate-0">
                  <img 
                    src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&auto=format&fit=crop&q=60"
                    onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&auto=format&fit=crop&q=60" // Fallback mock image
                    }}
                    alt="Burlays App" 
                    className="w-full h-auto drop-shadow-2xl"
                  />
              </div>
           </div>

           {/* Right Side - Content */}
           <div className="w-full md:w-1/2 text-center md:text-left z-10 pl-0 md:pl-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                 Download Our Mobile App
              </h2>
              <p className="text-gray-800 text-lg mb-8 leading-relaxed">
                 Elevate your experience by downloading our mobile app for Seamless ordering experience.
              </p>

              {/* User Avatars & CTA */}
              <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                  <div className="flex -space-x-3">
                     {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                           <img 
                              src={`https://i.pravatar.cc/100?img=${i + 10}`} 
                              alt="User" 
                              className="w-full h-full object-cover"
                           />
                        </div>
                     ))}
                     <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border-2 border-[#FFD43B] text-[#E25C1D] shadow-sm z-10">
                        <FaArrowRight className="w-4 h-4 transform -rotate-45" />
                     </div>
                  </div>
              </div>

              {/* App Store Buttons */}
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                 <button className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors shadow-md">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="h-10" />
                 </button>
                 <button className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors shadow-md">
                     <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="h-10" />
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadApp;
