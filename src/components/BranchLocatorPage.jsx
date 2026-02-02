import React, { useState, useEffect, useCallback } from 'react';
import { FaMapMarkerAlt, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, collectionGroup } from 'firebase/firestore';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

const libraries = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '600px',
  borderRadius: '0.75rem',
};

const defaultCenter = {
  lat: 33.6844, // Default to Islamabad
  lng: 73.0479,
};

const options = {
  disableDefaultUI: true,
  zoomControl: true,
};

const BranchLocatorPage = () => {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState(null);
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
    const fetchBranches = async () => {
      try {
        // Use collectionGroup to query all 'branches' subcollections across all cities
        const querySnapshot = await getDocs(collectionGroup(db, 'branches'));
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

  // Extract unique cities for the filter
  const uniqueCities = [...new Set(branches.map(branch => {
      // Assuming location might be "Street, City, Country" or just "City"
      // This is a simple heuristic; you might need better parsing depending on your data
      const parts = (branch.location || '').split(',');
      const city = parts.length > 1 ? parts[parts.length - 2].trim() : (branch.location || '');
      // Or just return the whole location string if it's just the city name in your DB
      // For now, let's assume the user might want to filter by the exact string if it's short, 
      // or we can just use the whole location string as "City/Area"
      return branch.location || '';
  }))].filter(Boolean);

  // Filter branches based on city and search query
  const filteredBranches = branches.filter(branch => {
    const branchName = branch.name || '';
    const branchLocation = branch.location || ''; // Changed from address to location based on Firestore schema

    // Extract city from address for demo purposes (simple check)
    const cityMatch = !selectedCity || branchLocation.toLowerCase().includes(selectedCity.toLowerCase());
    const queryMatch = !searchQuery || 
      branchName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      branchLocation.toLowerCase().includes(searchQuery.toLowerCase());
    return cityMatch && queryMatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <FaSpinner className="animate-spin text-4xl text-[#FFC72C]" />
      </div>
    );
  }

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
                            <option value="">Select City/Location</option>
                            {uniqueCities.map((city, index) => (
                                <option key={index} value={city}>{city}</option>
                            ))}
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
                                    <p className="text-sm text-gray-500 leading-relaxed">{branch.location}</p>
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
            {/* <div className="w-full lg:w-2/3 h-[500px] lg:h-auto min-h-[600px] bg-[#F3F4F6] rounded-xl overflow-hidden relative border border-gray-200">
                {isLoaded ? (
                    <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        zoom={11}
                        center={defaultCenter}
                        options={options}
                        onLoad={onMapLoad}
                        onUnmount={onUnmount}
                    >
                        {filteredBranches.map((branch) => {
                             // Ensure lat/long exist and are numbers
                             const lat = parseFloat(branch.lat);
                             const lng = parseFloat(branch.long);
                             
                             if (isNaN(lat) || isNaN(lng)) return null;

                             return (
                                <Marker
                                    key={branch.id}
                                    position={{ lat, lng }}
                                    onClick={() => setSelectedMarker(branch)}
                                    icon={{
                                        url: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png", // Yellow marker to match theme
                                        scaledSize: new window.google.maps.Size(40, 40)
                                    }}
                                />
                             );
                        })}

                        {selectedMarker && (
                            <InfoWindow
                                position={{ 
                                    lat: parseFloat(selectedMarker.lat), 
                                    lng: parseFloat(selectedMarker.long) 
                                }}
                                onCloseClick={() => setSelectedMarker(null)}
                            >
                                <div className="p-2 min-w-[200px]">
                                    <h3 className="font-bold text-gray-900 mb-1">{selectedMarker.name}</h3>
                                    <p className="text-xs text-gray-500 mb-2">{selectedMarker.location}</p>
                                    <button 
                                        onClick={() => navigate(`/branches/${selectedMarker.id}`)}
                                        className="w-full bg-[#FFC72C] text-black text-xs font-bold py-2 rounded hover:bg-[#ffcf4b] transition-colors"
                                    >
                                        View Menu
                                    </button>
                                </div>
                            </InfoWindow>
                        )}
                    </GoogleMap>
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <FaSpinner className="animate-spin text-3xl text-gray-400" />
                    </div>
                )}
            </div> */}
        </div>
      </div>
    </div>
  );
};

export default BranchLocatorPage;
