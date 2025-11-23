
import React, { useState, useEffect, useRef } from 'react';
import Map, { MapRef } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
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


export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  onLocationSelect,
  initialCenter
}) => {
  const { setBottomNavVisible } = useAppContext();
  const mapRef = useRef<MapRef>(null);

  const [viewState, setViewState] = useState({
    latitude: initialCenter?.lat || defaultCenter.lat,
    longitude: initialCenter?.lng || defaultCenter.lng,
    zoom: 15
  });

  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    if (initialCenter) {
      setViewState(prev => ({
        ...prev,
        latitude: initialCenter.lat,
        longitude: initialCenter.lng
      }));
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

  const handleConfirm = () => {
    if (mapRef.current) {
      const { lng, lat } = mapRef.current.getCenter();
      onLocationSelect({ lat, lng });
      onClose();
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
        {!import.meta.env.VITE_MAPBOX_TOKEN && <div>Error: Mapbox token not found.</div>}
        {import.meta.env.VITE_MAPBOX_TOKEN && (
          <>
            {!isMapLoaded && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}><Spinner /></div>}
            <Map
              ref={mapRef}
              {...viewState}
              onMove={evt => setViewState(evt.viewState)}
              onLoad={() => setIsMapLoaded(true)}
              style={{ width: '100%', height: '100%', visibility: isMapLoaded ? 'visible' : 'hidden' }}
              mapStyle="mapbox://styles/mapbox/streets-v12"
              mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
            />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -100%)', // Adjust to place the marker's tip at the center
              zIndex: 1,
              display: isMapLoaded ? 'block' : 'none'
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
