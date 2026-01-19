import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full bg-white pt-10">
      {/* Newsletter Section */}
      <div className="max-w-7xl mx-auto px-4 mb-20 relative">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 relative overflow-hidden flex flex-col md:flex-row items-center justify-between">
          
          {/* Wave Background Decoration - Top Right */}
          <div className="absolute top-0 right-0 w-[60%] h-full bg-[#FFC72C] z-0 hidden md:block" 
               style={{ 
                 clipPath: "ellipse(80% 100% at 80% 0%)",
                 opacity: 0.9 
               }}>
          </div>
          
          {/* Mobile Wave Background */}
          <div className="absolute top-0 right-0 w-full h-[40%] bg-[#FFC72C] z-0 md:hidden" 
               style={{ 
                 clipPath: "ellipse(100% 80% at 100% 0%)",
                 opacity: 0.9 
               }}>
          </div>

          {/* Left Side: Text & Input */}
          <div className="relative z-10 w-full md:w-1/2 pr-0 md:pr-10 mb-8 md:mb-0">
            <h2 className="text-3xl font-bold text-[#E25C1D] mb-4">
              Special Offers & News
            </h2>
            <p className="text-gray-600 mb-8 max-w-md">
              Subscribe now for news, promotions and more delivered right to your inbox
            </p>
            
            <div className="flex flex-col gap-4 max-w-md">
              <input 
                type="email" 
                placeholder="Enter Email Address" 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
              />
              <button className="bg-[#FFC72C] text-black font-bold px-8 py-3 rounded-lg hover:bg-[#ffcf4b] transition-colors w-fit shadow-md uppercase text-sm">
                Subscribe
              </button>
            </div>
          </div>

          {/* Right Side: Graphic Text */}
          <div className="relative z-10 w-full md:w-1/2 flex flex-col items-center md:items-end text-center md:text-right mt-8 md:mt-0">
             <div className="relative">
                {/* 3D Megaphone Icon */}
                <div className="absolute -right-12 -top-24 transform rotate-[-15deg] hidden md:block z-20">
                   <img 
                      src="https://cdn-icons-png.flaticon.com/512/1160/1160358.png" 
                      alt="Megaphone"
                      className="w-32 h-32 object-contain drop-shadow-xl filter hue-rotate-15 brightness-110"
                   />
                </div>
                
                <h2 className="font-black leading-none tracking-tighter drop-shadow-sm flex flex-col items-center md:items-end">
                  <span className="text-4xl md:text-5xl text-[#FFC72C] md:text-white mb-2" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}>let's talk</span>
                  <span className="text-6xl md:text-8xl text-[#FFC72C] md:text-white">BURLAYS</span>
                </h2>
             </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-100 py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-4">
          
          <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
             <img src="/logo.png" alt="Burlays" className="h-6 w-auto opacity-50 grayscale" />
             <span>Burlays Copyright © 2026. All Rights Reserved.</span>
          </div>

          <div className="flex gap-4 text-xs font-bold text-gray-400 uppercase tracking-wide">
             <Link to="#" className="hover:text-[#E25C1D] transition-colors">Terms & Conditions</Link>
             <span>|</span>
             <Link to="#" className="hover:text-[#E25C1D] transition-colors">Privacy Policy</Link>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
