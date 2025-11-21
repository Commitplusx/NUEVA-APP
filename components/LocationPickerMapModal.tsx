
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import * as Icons from './icons';
import { useAppContext } from '../context/AppContext';
import { geocodeAddress, reverseGeocode } from '../services/api';
import { Spinner } from './Spinner';
import Map, { MapRef, ViewState } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface NativeMapPlugin {
  pickLocation(options: { initialPosition?: { latitude: number; longitude: number } }): Promise<{ latitude: number; longitude: number; address: string }>;
}

// La importación de Mapbox se movió a la lógica nativa para evitar errores en web.

interface LocationPickerPageProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (address: string, lat: number, lng: number) => void;
  initialLocation?: { lat: number; lng: number };
  title: string;
}

const defaultCenter = {
  latitude: 16.25, // Default to Comitán
  longitude: -92.13,
  zoom: 13
};

export const LocationPickerMapModal: React.FC<LocationPickerPageProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialLocation,
  title,
}) => {
  const { showToast } = useAppContext();
  const mapRef = useRef<MapRef | null>(null);
  const [viewState, setViewState] = useState<Partial<ViewState>>(initialLocation ? { latitude: initialLocation.lat, longitude: initialLocation.lng, zoom: 16 } : defaultCenter);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const idleTimeout = useRef<NodeJS.Timeout | null>(null);
  const isNative = Capacitor.getPlatform() !== 'web';

  // --- Native Logic ---
  useEffect(() => {
    if (isOpen && isNative) {
      const openNativePicker = async () => {
        try {
          const NativeMap = ((Capacitor as any).Plugins.NativeMap as NativeMapPlugin);
          const result = await NativeMap.pickLocation({
            initialPosition: initialLocation ? { latitude: initialLocation.lat, longitude: initialLocation.lng } : undefined
          });
          if (result && result.latitude && result.longitude) {
            onConfirm(result.address, result.latitude, result.longitude);
          }
        } catch (e: any) {
          if (e.message !== "pickLocation canceled." && e.message !== "Action canceled by user.") {
            showToast('No se pudo abrir el selector de mapa.', 'error');
          }
        } finally {
          onClose();
        }
      };
      openNativePicker();
    }
  }, [isOpen, isNative, initialLocation, onConfirm, onClose, showToast]);

  // --- Web Logic ---
  const handleMapMove = useCallback((evt: any) => {
    setViewState(evt.viewState);
    if (idleTimeout.current) clearTimeout(idleTimeout.current);

    idleTimeout.current = setTimeout(async () => {
      setIsGeocoding(true);
      try {
        const { latitude, longitude } = evt.viewState;
        const address = await reverseGeocode(latitude, longitude);
        setSelectedAddress(address || 'Ubicación no encontrada');
      } catch (error) {
        setSelectedAddress('Error al obtener dirección');
      } finally {
        setIsGeocoding(false);
      }
    }, 500);
  }, []);

  const handleSearch = useCallback(async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const coords = await geocodeAddress(searchQuery);
      if (coords) {
        mapRef.current?.flyTo({ center: [coords.lng, coords.lat], zoom: 17 });
      } else {
        showToast("No se encontró la dirección. Intenta ser más específico.", "error");
      }
    } catch (error) {
      showToast("Error al buscar la dirección.", "error");
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, showToast]);

  const handleConfirmClick = () => {
    if (viewState.latitude && viewState.longitude && selectedAddress) {
      onConfirm(selectedAddress, viewState.latitude, viewState.longitude);
      onClose();
    } else {
      showToast("Por favor, selecciona una ubicación en el mapa.", "error");
    }
  };

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const setStatusBarStyle = async () => {
        if (isOpen) {
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#ffffff' });
        }
      };
      setStatusBarStyle();
      return () => {
        StatusBar.setStyle({ style: Style.Light });
        StatusBar.setBackgroundColor({ color: '#000000' });
      };
    }
  }, [isOpen]);

  if (isNative) {
    return isOpen ? (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner className="animate-spin w-8 h-8 text-orange-500 mx-auto" />
          <p className="mt-2 text-gray-600">Abriendo mapa...</p>
        </div>
      </div>
    ) : null;
  }

  return (
    <motion.div
      className="fixed inset-0 bg-white z-50"
      initial={{ y: '100%' }}
      animate={{ y: isOpen ? 0 : '100%' }}
      transition={{ type: 'spring', stiffness: 400, damping: 40 }}
    >
      <div className="w-full h-full flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <Icons.ChevronLeftIcon className="w-6 h-6 text-gray-700" />
          </button>
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          <div className="w-8"></div>
        </div>

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

        <div className="flex-grow relative">
          <Map
            ref={mapRef}
            {...viewState}
            onMove={handleMapMove}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/streets-v11"
            mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
          >
          </Map>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <Icons.MapPinIcon className="w-10 h-10 text-orange-500 drop-shadow-lg" />
          </div>

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
                disabled={!viewState.latitude || !selectedAddress || isGeocoding}
              >
                <Icons.CheckCircleIcon className="w-6 h-6" />
                Confirmar Ubicación
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
