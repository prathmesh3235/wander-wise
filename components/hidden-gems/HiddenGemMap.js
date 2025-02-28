import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from 'next/link';

// Fix Leaflet marker icon issue in Next.js
const fixLeafletIcon = () => {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/images/map/marker-icon-2x.png',
    iconUrl: '/images/map/marker-icon.png',
    shadowUrl: '/images/map/marker-shadow.png',
  });
};

export default function HiddenGemMap({ gems, initialPosition }) {
  const [map, setMap] = useState(null);
  const [position, setPosition] = useState(initialPosition || [51.505, -0.09]);
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const popupRef = useRef({});
  const router = useRouter();

  useEffect(() => {
    fixLeafletIcon();
  }, []);

  // Update map view when position changes
  useEffect(() => {
    if (map) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);

  // Get user location
  const getUserLocation = () => {
    setIsLocating(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setPosition([latitude, longitude]);
          setIsLocating(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLocating(false);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser');
      setIsLocating(false);
    }
  };

  // Create custom gem marker icon
  const createGemIcon = (category) => {
    let iconUrl = '/images/map/gem-marker.png';
    
    // You can customize markers based on gem category
    switch (category) {
      case 'Food':
        iconUrl = '/images/map/food-marker.png';
        break;
      case 'Nature':
        iconUrl = '/images/map/nature-marker.png';
        break;
      case 'Historical':
        iconUrl = '/images/map/historical-marker.png';
        break;
      // ... more categories
    }
    
    return L.icon({
      iconUrl,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });
  };

  // Handle clicking on marker
  const handleMarkerClick = (gemId) => {
    if (popupRef.current[gemId]) {
      popupRef.current[gemId].openPopup();
    }
  };

  return (
    <div className="relative w-full h-full">
      <MapContainer 
        center={position} 
        zoom={13} 
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
        whenCreated={setMap}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {gems.map((gem) => (
          <Marker
            key={gem._id}
            position={[gem.location.coordinates.lat, gem.location.coordinates.lng]}
            icon={createGemIcon(gem.category)}
            eventHandlers={{
              click: () => handleMarkerClick(gem._id)
            }}
            ref={(ref) => {
              if (ref) {
                popupRef.current[gem._id] = ref;
              }
            }}
          >
            <Popup>
              <div className="text-center">
                <h3 className="font-medium text-gray-900">{gem.name}</h3>
                <p className="text-xs text-gray-600 mb-2">{gem.category}</p>
                <p className="text-sm text-gray-800 mb-3 line-clamp-2">{gem.description}</p>
                <Link href={`/hidden-gems/${gem._id}`} className="text-sm text-teal-600 hover:text-teal-800">
                  View Details
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {userLocation && (
          <Marker
            position={userLocation}
            icon={L.icon({
              iconUrl: '/images/map/user-marker.png',
              iconSize: [32, 32],
              iconAnchor: [16, 16]
            })}
          >
            <Popup>Your location</Popup>
          </Marker>
        )}
      </MapContainer>
      
      <div className="absolute top-4 right-4 z-1000">
        <button
          onClick={getUserLocation}
          disabled={isLocating}
          className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
        >
          {isLocating ? (
            <svg className="h-6 w-6 text-gray-400 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
