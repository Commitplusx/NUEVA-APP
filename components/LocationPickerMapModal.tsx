
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GoogleMap } from '@react-google-maps/api';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import * as Icons from './icons';
import { useAppContext } from '../context/AppContext';
import { NativeMap } from 'capacitor-native-map';
import { geocodeAddress, reverseGeocode } from '../services/api';
import { Spinner } from './Spinner';

interface LocationPickerPageProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (address: string, lat: number, lng: number) => void;
  initialLocation?: { lat: number; lng: number };
  title: string;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 16.25, // Default to Comitán
  lng: -92.13,
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [
    // (Map styles are unchanged)
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

const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

export const LocationPickerMapModal: React.FC<LocationPickerPageProps> = ({
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
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const idleTimeout = useRef<NodeJS.Timeout | null>(null);
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (isOpen && isNative) {
      const openNativePicker = async () => {
        try {
          const result = await NativeMap.pickLocation({
            initialPosition: initialLocation ? { latitude: initialLocation.lat, longitude: initialLocation.lng } : undefined
          });
          if (result && result.latitude && result.longitude) {
            onConfirm(result.address, result.latitude, result.longitude);
          }
        } catch (e: any) {
          if (e.message !== "pickLocation canceled.") {
            console.error('Error picking location', e);
            showToast('No se pudo abrir el selector de mapa.', 'error');
          }
        } finally {
          onClose();
        }
      };
      openNativePicker();
    }
  }, [isOpen, isNative, initialLocation, onConfirm, onClose, showToast]);


  useEffect(() => {
    if (isOpen && !isNative && initialLocation) {
      setSelectedPosition(initialLocation);
      const fetchAddress = async () => {
        setIsGeocoding(true);
        try {
          const address = await reverseGeocode(initialLocation.lat, initialLocation.lng);
          setSelectedAddress(address);
        } catch (error) {
          console.error("Error reverse geocoding initial location:", error);
          setSelectedAddress("Ubicación seleccionada");
        } finally {
          setIsGeocoding(false);
        }
      };
      fetchAddress();
    } else if (isOpen && !isNative && !initialLocation) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const currentLoc = { lat: latitude, lng: longitude };
            setSelectedPosition(currentLoc);
            mapRef.current?.panTo(currentLoc);
            mapRef.current?.setZoom(16);
          },
          (error) => {
            console.error("Error getting current location:", error);
            showToast("No se pudo obtener tu ubicación actual.", "error");
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
  }, [isOpen, isNative, initialLocation, showToast]);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const setStatusBarStyle = async () => {
        if (isOpen) {
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#ffffff' });
        }
      };
      setStatusBarStyle();

      // Return a cleanup function to restore the style when the modal closes
      return () => {
        StatusBar.setStyle({ style: Style.Light });
        StatusBar.setBackgroundColor({ color: '#000000' });
      };
    }
  }, [isOpen]);

  const handleMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    if (selectedPosition) {
      map.panTo(selectedPosition);
      map.setZoom(16);
    }
  }, [selectedPosition]);

  const handleMapIdle = useCallback(() => {
    if (idleTimeout.current) {
      clearTimeout(idleTimeout.current);
    }

    idleTimeout.current = setTimeout(async () => {
      if (mapRef.current) {
        const center = mapRef.current.getCenter();
        if (center) {
          const lat = center.lat();
          const lng = center.lng();

          if (selectedPosition && haversineDistance(lat, lng, selectedPosition.lat, selectedPosition.lng) < 0.01) {
            return;
          }
          
          setIsGeocoding(true);
          setSelectedPosition({ lat, lng });

          try {
            const address = await reverseGeocode(lat, lng);
            setSelectedAddress(address);
          } catch (error) {
            console.error("Error reverse geocoding on idle:", error);
            setSelectedAddress("No se pudo obtener la dirección");
          } finally {
            setIsGeocoding(false);
          }
        }
      }
    }, 500); // Debounce time
  }, [selectedPosition]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const coords = await geocodeAddress(searchQuery);
      if (coords) {
        mapRef.current?.panTo(coords);
        mapRef.current?.setZoom(17);
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

  if (isNative) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner className="animate-spin w-8 h-8 text-orange-500 mx-auto" />
          <p className="mt-2 text-gray-600">Abriendo mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="fixed inset-0 bg-white z-50"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 400, damping: 40 }}
    >
      <div className="w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <Icons.ChevronLeftIcon className="w-6 h-6 text-gray-700" />
          </button>
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          <div className="w-8"></div> {/* Spacer to balance the header */}
        </div>

        {/* Search Section */}
        <div className="p-4 flex-shrink-0 bg-white z-10 shadow-sm">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Buscar una calle, colonia o lugar..."
              className="w-full py-3 px-4 pl-12 bg-gray-50 border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => { if (e.key === 'Enter') handleSearch(); }}
            />
            <Icons.SearchIcon className="absolute left-4 w-5 h-5 text-gray-400" />
            {isSearching && <Spinner className="absolute right-4 animate-spin w-5 h-5 text-orange-500" />}
          </div>
        </div>

        {/* Map and Confirmation */}
        <div className="flex-grow relative">
          {!isMapsLoaded ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <Spinner className="animate-spin w-8 h-8 text-orange-500 mx-auto" />
                <p className="mt-2 text-gray-600">Cargando mapa...</p>
              </div>
            </div>
          ) : (
            <>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={selectedPosition || defaultCenter}
                zoom={16}
                options={mapOptions}
                onLoad={handleMapLoad}
                onIdle={handleMapIdle}
              >
                {/* No marker, the center of the map is the selection point */}
              </GoogleMap>
              
              {/* Center crosshair */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <Icons.MapPinIcon className="w-10 h-10 text-orange-500 drop-shadow-lg" />
              </div>

              {/* Bottom Confirmation Section */}
              <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm p-4 border-t border-gray-200 shadow-top">
                <div className="max-w-4xl mx-auto">
                  <div className="mb-3 min-h-[40px] flex flex-col justify-center">
                    <p className="text-xs font-bold text-gray-500 uppercase">UBICACIÓN SELECCIONADA</p>
                    {isGeocoding ? (
                      <div className="flex items-center gap-2">
                        <Spinner className="animate-spin w-4 h-4 text-gray-500" />
                        <p className="text-gray-600 text-sm">Obteniendo dirección...</p>
                      </div>
                    ) : (
                      <p className="text-gray-800 font-semibold truncate">
                        {selectedAddress || 'Mueve el mapa para seleccionar una dirección'}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleConfirmClick}
                    className="w-full py-3 bg-green-500 text-white rounded-lg font-bold text-lg hover:bg-green-600 transition-colors shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    disabled={!selectedPosition || !selectedAddress || isGeocoding}
                  >
                    <Icons.CheckCircleIcon className="w-6 h-6" />
                    Confirmar Ubicación
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
