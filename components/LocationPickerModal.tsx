
import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { Spinner } from './Spinner';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { useAppContext } from '../context/AppContext';

const containerStyle = {
  width: '100%',
  height: '100%'
};

// Un centro inicial por defecto (Comitán de Domínguez, Chiapas)
const defaultCenter = {
  lat: 16.2519,
  lng: -92.1333
};

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  initialCenter?: { lat: number; lng: number };
}

const libraries: ('places' | 'maps')[] = ['places', 'maps'];

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  onLocationSelect,
  initialCenter
}) => {
  const { setBottomNavVisible } = useAppContext();
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'script-loader', // ID unificado para evitar conflicto
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: libraries // Usar la constante
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState(initialCenter || defaultCenter);

  useEffect(() => {
    if (initialCenter) {
      setCenter(initialCenter);
    }
  }, [initialCenter]);

  useEffect(() => {
    if (isOpen) {
      setBottomNavVisible(false);
    }
    // Cleanup function to restore visibility when the modal closes
    return () => {
      setBottomNavVisible(true);
    };
  }, [isOpen, setBottomNavVisible]);

  const onLoad = useCallback(function callback(mapInstance: google.maps.Map) {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  const handleConfirm = () => {
    if (map) {
      const newCenter = map.getCenter();
      if (newCenter) {
        onLocationSelect({ lat: newCenter.lat(), lng: newCenter.lng() });
        onClose();
      }
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        position: 'relative',
        width: '90%',
        height: '80%',
        maxWidth: '800px',
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        {loadError && <div>Error al cargar el mapa. Asegúrate de que la clave de API de Google Maps sea correcta.</div>}
        {!isLoaded && !loadError && <Spinner />}
        {isLoaded && (
          <>
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={15}
              onLoad={onLoad}
              onUnmount={onUnmount}
              options={{
                disableDefaultUI: true,
                zoomControl: true,
                gestureHandling: 'greedy', // Enable single-finger panning on mobile
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
              }}
            >
              {/* Marcador fijo en el centro */}
            </GoogleMap>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -100%)', // Ajusta para que la punta del marcador esté en el centro
              zIndex: 1
            }}>
              <FaMapMarkerAlt color="#f97316" size={50} />
            </div>
          </>
        )}
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: '1rem'
      }}>
        <button
          onClick={handleConfirm}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Confirmar Ubicación
        </button>
        <button
          onClick={onClose}
          style={{
            padding: '10px 20px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};
