import React, { useState } from 'react';
import { FaPhoneAlt, FaUser, FaCommentDots, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  const [step, setStep] = useState('initial'); // 'initial' or 'phone'
  const [phoneNumber, setPhoneNumber] = useState('');

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Form */}
      <div className="w-full md:w-1/2 flex flex-col relative">
        {/* Header/Logo Area on Mobile */}
        <div className="p-6 md:hidden">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Burlays" className="h-8 w-auto" />
              <span className="font-extrabold text-xl tracking-tight text-[#1E1E1E]">Burlays</span>
            </Link>
        </div>

        {/* Back Button (only in phone step) */}
        {step === 'phone' && (
          <button 
            onClick={() => setStep('initial')}
            className="absolute top-6 left-6 text-gray-600 hover:text-black hidden md:block"
          >
            <FaArrowLeft className="w-5 h-5" />
          </button>
        )}

        <div className="flex-1 flex flex-col justify-center items-center px-6 md:px-20 lg:px-32">
            {/* Logo on Desktop (Top Left) */}
            <div className="absolute top-8 left-8 hidden md:block">
                <Link to="/" className="flex items-center gap-2">
                <img src="/logo.png" alt="Burlays" className="h-10 w-auto" />
                <span className="font-extrabold text-2xl tracking-tight text-[#1E1E1E]">Burlays</span>
                </Link>
            </div>

            {step === 'initial' ? (
                <div className="w-full max-w-md text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Hey there, feeling hungry?
                    </h1>
                    <p className="text-gray-500 mb-10">
                        Let's enjoy your food with Burlays!
                    </p>

                    <div className="space-y-4">
                        <button 
                            onClick={() => setStep('phone')}
                            className="w-full bg-[#FFC72C] hover:bg-[#ffcf4b] text-black font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-sm"
                        >
                            <div className="w-6 h-6 bg-black text-[#FFC72C] rounded-full flex items-center justify-center text-xs">
                                <FaPhoneAlt />
                            </div>
                            CONTINUE WITH PHONE
                        </button>

                        <button className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-colors">
                            <div className="w-6 h-6 bg-black text-white rounded flex items-center justify-center text-xs">
                                <span className="font-serif font-bold">As</span>
                            </div>
                            CONTINUE AS A GUEST
                        </button>
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-md text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Enter Your Phone Number
                    </h1>
                    <p className="text-gray-400 text-sm mb-10">
                        We will send you the code to confirm it..
                    </p>

                    <div className="flex items-center gap-3 mb-8">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-500 font-medium">
                            +92
                        </div>
                        <input 
                            type="tel" 
                            placeholder="301xxxxxxx" 
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FFC72C] placeholder-gray-300 font-medium"
                        />
                    </div>

                    <button 
                        className="w-full bg-[#FFC72C] hover:bg-[#ffcf4b] text-black font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-sm"
                    >
                        <FaCommentDots />
                        SEND OTP
                    </button>
                </div>
            )}
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div className="hidden md:flex w-1/2 bg-[#FFC72C] relative overflow-hidden items-center justify-center">
         {/* Background Pattern Effect */}
         <div className="absolute inset-0 opacity-10" style={{ 
             backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', 
             backgroundSize: '20px 20px' 
         }}></div>
         
         {/* Orange Wave Top Right */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-[#E25C1D] rounded-bl-[100%] z-0"></div>

         <div className="relative z-10 text-center">
             {/* Logo */}
             <div className="flex flex-col items-center mb-12">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg border-4 border-black">
                     <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
                </div>
                <h2 className="text-4xl font-extrabold text-[#5d4037]">Burlays<span className="text-xs align-top">®</span></h2>
             </div>

             {/* Scooter Illustration Placeholder */}
             <div className="relative">
                <img 
                    src="https://cdn-icons-png.flaticon.com/512/7541/7541900.png" 
                    alt="Delivery Scooter" 
                    className="w-96 h-auto drop-shadow-2xl object-contain filter sepia-[.3]"
                />
                {/* Speed lines decoration */}
                <div className="absolute bottom-0 left-0 w-full h-2 bg-black/10 rounded-full blur-sm"></div>
             </div>
         </div>
      </div>
    </div>
  );
};

export default LoginPage;
