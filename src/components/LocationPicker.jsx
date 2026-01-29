import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';
import { FaSearch, FaMapMarkerAlt, FaLocationArrow } from 'react-icons/fa';

const libraries = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.75rem',
};

const center = {
  lat: 33.6844, // Default to Islamabad
  lng: 73.0479,
};

const options = {
  disableDefaultUI: true,
  zoomControl: true,
};

const LocationPicker = ({ onLocationSelect, initialAddress }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyA17q-V4iN3cNO4EnhaYzc_bnRF-EsE3FM", // Replace with your actual key
    libraries,
  });

  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(center);
  const [address, setAddress] = useState(initialAddress || "");
  const [searchValue, setSearchValue] = useState("");
  const autocompleteRef = useRef(null);

  const onMapLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const getAddressFromCoords = async (lat, lng) => {
    try {
      const geocoder = new window.google.maps.Geocoder();
      const response = await geocoder.geocode({ location: { lat, lng } });
      if (response.results[0]) {
        const formattedAddress = response.results[0].formatted_address;
        setAddress(formattedAddress);
        setSearchValue(formattedAddress);
        onLocationSelect(formattedAddress);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }
  };

  const onMapClick = useCallback((event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setMarker({ lat, lng });
    getAddressFromCoords(lat, lng);
  }, [onLocationSelect]);

  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setMarker({ lat, lng });
        map.panTo({ lat, lng });
        map.setZoom(15);
        
        const formattedAddress = place.formatted_address;
        setAddress(formattedAddress);
        setSearchValue(formattedAddress);
        onLocationSelect(formattedAddress);
      }
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setMarker({ lat, lng });
          map.panTo({ lat, lng });
          map.setZoom(15);
          getAddressFromCoords(lat, lng);
        },
        () => {
          alert("Error fetching your location.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  if (loadError) return <div className="p-4 text-red-500 bg-red-50 rounded-lg">Error loading maps</div>;
  if (!isLoaded) return <div className="h-[400px] bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400">Loading Maps...</div>;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Autocomplete
          onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
          onPlaceChanged={onPlaceChanged}
        >
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for your location..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full bg-white text-gray-900 pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#FFC72C] focus:ring-1 focus:ring-[#FFC72C] outline-none shadow-sm"
            />
          </div>
        </Autocomplete>
        <button
            onClick={handleCurrentLocation}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#E25C1D] hover:bg-gray-50 rounded-lg transition-colors"
            title="Use Current Location"
        >
            <FaLocationArrow />
        </button>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={13}
          center={center}
          onLoad={onMapLoad}
          onUnmount={onUnmount}
          onClick={onMapClick}
          options={options}
        >
          <Marker position={marker} />
        </GoogleMap>
        
        {/* Overlay Instructions */}
        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg text-xs text-gray-600 shadow-lg border border-gray-100 flex items-start gap-2">
            <FaMapMarkerAlt className="text-[#E25C1D] flex-shrink-0 mt-0.5" />
            <span>Click on the map to pinpoint your exact delivery location.</span>
        </div>
      </div>

      {address && (
        <div className="bg-[#FFC72C]/10 border border-[#FFC72C] p-3 rounded-lg">
            <p className="text-xs text-gray-500 font-bold mb-1">Selected Address:</p>
            <p className="text-sm text-gray-800">{address}</p>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
