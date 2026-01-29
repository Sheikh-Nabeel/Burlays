import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaMapMarkerAlt, FaMotorcycle, FaUtensils, FaShoppingBag, FaSpinner } from 'react-icons/fa';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const libraries = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '500px',
  borderRadius: '1rem',
};

const options = {
  disableDefaultUI: true,
  zoomControl: true,
};

const BranchDetailsPage = () => {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const [branch, setBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyA17q-V4iN3cNO4EnhaYzc_bnRF-EsE3FM",
    libraries,
  });

  const onMapLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  useEffect(() => {
    const fetchBranch = async () => {
      try {
        const docRef = doc(db, 'branches', branchId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setBranch({ id: docSnap.id, ...docSnap.data() });
        } else {
          setBranch(null);
        }
      } catch (error) {
        console.error("Error fetching branch details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (branchId) {
      fetchBranch();
    }
  }, [branchId]);

  const handleOrderNow = () => {
    // Set this branch as the selected branch for the session
    localStorage.setItem('selectedBranch', JSON.stringify(branch));
    // Force a reload or update state if App.jsx listens to storage (it usually doesn't without help, but for now we can navigate)
    // Since App.jsx initializes state from localStorage, a full reload might be safest to switch context if the app architecture relies on that initial state
    // Or if we just navigate to /menu, the menu page reads from localStorage too (as we saw in MenuPage.jsx)
    
    // However, App.jsx has `const [selectedBranch, setSelectedBranch] = React.useState(...)`
    // It doesn't listen to localStorage changes.
    // So simply updating localStorage won't update the App's state if we are already inside the App.
    // But MenuPage reads from localStorage in its useEffect.
    
    navigate('/menu');
    window.location.reload(); // Simple way to ensure context switch for now
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <FaSpinner className="animate-spin text-4xl text-[#FFC72C]" />
      </div>
    );
  }

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

  const lat = parseFloat(branch.lat);
  const lng = parseFloat(branch.long);
  const mapUrl = (lat && lng) 
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` 
    : branch.mapsUrl || "#";

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
                            <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-100 overflow-hidden">
                                {branch.imageUrl ? (
                                    <img src={branch.imageUrl} alt={branch.name} className="w-full h-full object-cover" />
                                ) : (
                                    <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
                                )}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">{branch.name}</h2>
                                <p className="text-gray-500 text-sm leading-relaxed">{branch.location}</p>
                            </div>
                        </div>

                        {/* Get Direction Button - using Google Maps URL */}
                        <a 
                            href={mapUrl}
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
                {isLoaded ? (
                    <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        zoom={15}
                        center={{ lat: lat || 33.6844, lng: lng || 73.0479 }}
                        options={options}
                        onLoad={onMapLoad}
                        onUnmount={onUnmount}
                    >
                        <Marker 
                            position={{ lat: lat || 33.6844, lng: lng || 73.0479 }}
                            icon={{
                                url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                                scaledSize: new window.google.maps.Size(40, 40)
                            }}
                        />
                    </GoogleMap>
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <FaSpinner className="animate-spin text-3xl text-gray-400" />
                    </div>
                )}

                {/* Bottom Right Floating Button */}
                <button 
                    onClick={handleOrderNow}
                    className="absolute bottom-6 right-6 bg-[#E25C1D] text-white font-bold px-6 py-3 rounded-lg shadow-lg hover:bg-[#c94e16] transition-colors text-sm uppercase"
                >
                    Order Now
                </button>
            </div>

        </div>
      </div>
    </div>
  );
};

export default BranchDetailsPage;
