
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleMap, MarkerF } from '@react-google-maps/api';
import * as Icons from './icons';
import { useAppContext } from '../context/AppContext';
import { geocodeAddress, reverseGeocode } from '../services/api';
import { Spinner } from './Spinner'; // Import Spinner directly

interface LocationPickerMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (address: string, lat: number, lng: number) => void;
  initialLocation?: { lat: number; lng: number };
  title: string;
}

const mapContainerStyle = {
  width: '100%',
  height: 'calc(100vh - 120px)', // Adjust height as needed
};

const defaultCenter = {
  lat: 16.25, // Default to Comitán
  lng: -92.13,
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [
    {
      "elementType": "geometry",
      "stylers": [
        { "color": "#f5f5f5" }
      ]
    },
    {
      "elementType": "labels.icon",
      "stylers": [
        { "visibility": "off" }
      ]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [
        { "color": "#616161" }
      ]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [
        { "color": "#f5f5f5" }
      ]
    },
    {
      "featureType": "administrative.land_parcel",
      "elementType": "labels.text.fill",
      "stylers": [
        { "color": "#bdbdbd" }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [
        { "color": "#eeeeee" }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [
        { "color": "#757575" }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [
        { "color": "#e5e5e5" }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.fill",
      "stylers": [
        { "color": "#9e9e9e" }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [
        { "color": "#ffffff" }
      ]
    },
    {
      "featureType": "road.arterial",
      "elementType": "labels.text.fill",
      "stylers": [
        { "color": "#757575" }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [
        { "color": "#dadada" }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "labels.text.fill",
      "stylers": [
        { "color": "#616161" }
      ]
    },
    {
      "featureType": "road.local",
      "elementType": "labels.text.fill",
      "stylers": [
        { "color": "#9e9e9e" }
      ]
    },
    {
      "featureType": "transit.line",
      "elementType": "geometry",
      "stylers": [
        { "color": "#e5e5e5" }
      ]
    },
    {
      "featureType": "transit.station",
      "elementType": "geometry",
      "stylers": [
        { "color": "#eeeeee" }
      ]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [
        { "color": "#c9c9c9" }
      ]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [
        { "color": "#9e9e9e" }
      ]
    }
  ]
};

export const LocationPickerMapModal: React.FC<LocationPickerMapModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialLocation,
  title,
}) => {
  const { isMapsLoaded, showToast } = useAppContext();
  const mapRef = useRef<google.maps.Map | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(initialLocation || null);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && initialLocation) {
      setSelectedPosition(initialLocation);
      // Reverse geocode initial location to display address
      const fetchAddress = async () => {
        try {
          const address = await reverseGeocode(initialLocation.lat, initialLocation.lng);
          setSelectedAddress(address);
        } catch (error) {
          console.error("Error reverse geocoding initial location:", error);
          setSelectedAddress("Ubicación seleccionada");
        }
      };
      fetchAddress();
    } else if (isOpen && !initialLocation) {
      // If no initial location, try to get current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const currentLoc = { lat: latitude, lng: longitude };
            setSelectedPosition(currentLoc);
            mapRef.current?.panTo(currentLoc);
            mapRef.current?.setZoom(15);
            const fetchAddress = async () => {
              try {
                const address = await reverseGeocode(latitude, longitude);
                setSelectedAddress(address);
              } catch (error) {
                console.error("Error reverse geocoding current location:", error);
                setSelectedAddress("Ubicación actual");
              }
            };
            fetchAddress();
          },
          (error) => {
            console.error("Error getting current location:", error);
            showToast("No se pudo obtener tu ubicación actual. Por favor, selecciona manualmente.", "error");
            setSelectedPosition(defaultCenter);
            mapRef.current?.panTo(defaultCenter);
            mapRef.current?.setZoom(13);
          }
        );
      } else {
        setSelectedPosition(defaultCenter);
        mapRef.current?.panTo(defaultCenter);
        mapRef.current?.setZoom(13);
      }
    }
  }, [isOpen, initialLocation, showToast]);

  const handleMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    if (selectedPosition) {
      map.panTo(selectedPosition);
      map.setZoom(15);
    }
  }, [selectedPosition]);

  const handleMapClick = useCallback(async (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setSelectedPosition({ lat, lng });
      try {
        const address = await reverseGeocode(lat, lng);
        setSelectedAddress(address);
      } catch (error) {
        console.error("Error reverse geocoding on map click:", error);
        setSelectedAddress("Ubicación seleccionada");
      }
    }
  }, []);

  const handleMarkerDragEnd = useCallback(async (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setSelectedPosition({ lat, lng });
      try {
        const address = await reverseGeocode(lat, lng);
        setSelectedAddress(address);
      } catch (error) {
        console.error("Error reverse geocoding on marker drag:", error);
        setSelectedAddress("Ubicación seleccionada");
      }
    }
  }, []);

  const handleSearch = useCallback(async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const coords = await geocodeAddress(searchQuery);
      if (coords) {
        setSelectedPosition(coords);
        mapRef.current?.panTo(coords);
        mapRef.current?.setZoom(15);
        const address = await reverseGeocode(coords.lat, coords.lng);
        setSelectedAddress(address);
      } else {
        showToast("No se encontró la dirección. Intenta ser más específico.", "error");
      }
    } catch (error) {
      console.error("Error searching address:", error);
      showToast("Error al buscar la dirección.", "error");
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, showToast]);

  const handleConfirmClick = () => {
    if (selectedPosition && selectedAddress) {
      onConfirm(selectedAddress, selectedPosition.lat, selectedPosition.lng);
      onClose();
    } else {
      showToast("Por favor, selecciona una ubicación en el mapa.", "error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <Icons.XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 flex-shrink-0">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Buscar dirección..."
              className="w-full py-2 px-3 pl-10 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => { if (e.key === 'Enter') handleSearch(); }}
            />
            <Icons.SearchIcon className="absolute left-3 w-5 h-5 text-gray-400" />
            <button
              onClick={handleSearch}
              className="ml-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center gap-1"
              disabled={isSearching}
            >
              {isSearching ? <Spinner className="animate-spin w-5 h-5" /> : <Icons.SearchIcon className="w-5 h-5" />}
              Buscar
            </button>
          </div>
          {selectedAddress && (
            <p className="mt-2 text-sm text-gray-700 flex items-center gap-2">
              <Icons.MapPinIcon className="w-4 h-4 text-orange-500" />
              Dirección seleccionada: <span className="font-semibold">{selectedAddress}</span>
            </p>
          )}
        </div>

        <div className="flex-grow relative">
          {!isMapsLoaded ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <Spinner className="animate-spin w-8 h-8 text-orange-500" />
            </div>
          ) : (
            <>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={selectedPosition || defaultCenter}
                zoom={selectedPosition ? 15 : 13}
                options={mapOptions}
                onLoad={handleMapLoad}
                onClick={handleMapClick}
              >
                {selectedPosition && (
                  <MarkerF
                    position={selectedPosition}
                    draggable={true}
                    onDragEnd={handleMarkerDragEnd}
                  />
                )}
              </GoogleMap>
              <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] md:max-w-sm mx-auto bg-white/80 backdrop-blur-sm shadow-lg rounded-full border border-gray-200/80 p-2 flex justify-around items-center h-16 z-50">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-full font-bold hover:bg-gray-300 transition-colors flex items-center gap-2 text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmClick}
                  className="px-4 py-2 bg-green-500 text-white rounded-full font-bold hover:bg-green-600 transition-colors flex items-center gap-2 text-sm"
                  disabled={!selectedPosition || !selectedAddress}
                >
                  <Icons.CheckCircleIcon className="w-5 h-5" />
                  Confirmar Ubicación
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
