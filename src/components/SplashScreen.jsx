import React from 'react'

const SplashScreen = () => {
  return (
    <div className="min-h-screen bg-white text-darkSecondary flex flex-col justify-between items-center py-20">
      <div></div>
      <div className="text-center">
        <img 
          src="/logo.png" 
          alt="Riaz Bakers Logo" 
          className="h-24 mx-auto mb-8"
        />
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 rounded-full loading-pulse" style={{backgroundColor: '#FFC72C', animationDelay: '0s'}}></div>
          <div className="w-3 h-3 rounded-full loading-pulse" style={{backgroundColor: '#FFC72C', animationDelay: '0.2s'}}></div>
          <div className="w-3 h-3 rounded-full loading-pulse" style={{backgroundColor: '#FFC72C', animationDelay: '0.4s'}}></div>
        </div>
      </div>
      <p className="text-sm text-gray-500">Designed & Developed by ALI AQDAS</p>
    </div>
  )
}

export default SplashScreen
