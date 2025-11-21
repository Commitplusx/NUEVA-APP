import * as React from 'react';
import Map, { Marker, NavigationControl, FullscreenControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { FaMapMarkerAlt } from 'react-icons/fa';

// Token de Mapbox - Debería estar en variables de entorno .env
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZGVpZmYiLCJhIjoiY21pODc2ZGcwMDh2bTJscHpucWc1MDIybSJ9.rTZ1DZKFsbw-IH-t-wDlCA';

interface MapboxMapProps {
  initialViewState?: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
  markers?: Array<{ lat: number; lng: number; label?: string }>;
}

const MapboxMap: React.FC<MapboxMapProps> = ({ 
  initialViewState = {
    longitude: -92.13,
    latitude: 16.25,
    zoom: 13
  },
  onLocationSelect,
  markers = []
}) => {
  
  const [viewState, setViewState] = React.useState(initialViewState);

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '400px', borderRadius: '12px', overflow: 'hidden' }}>
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{width: '100%', height: '100%'}}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        onClick={(e) => {
            if (onLocationSelect) {
                onLocationSelect({ lat: e.lngLat.lat, lng: e.lngLat.lng });
            }
        }}
      >
        <FullscreenControl position="top-right" />
        <NavigationControl position="top-right" />

        {/* Marcadores pasados como props */}
        {markers.map((marker, index) => (
          <Marker 
            key={index} 
            longitude={marker.lng} 
            latitude={marker.lat} 
            anchor="bottom"
          >
             <div style={{ color: '#2E3192', fontSize: '24px' }}>
               <FaMapMarkerAlt />
               {marker.label && <span style={{background: 'white', padding: '2px 4px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold'}}>{marker.label}</span>}
             </div>
          </Marker>
        ))}

        {/* Marcador de selección al hacer clic */}
        {onLocationSelect && (
             /* Aquí podrías agregar lógica para mostrar un marcador temporal donde el usuario hizo clic */
             <></>
        )}

      </Map>
    </div>
  );
}

export default MapboxMap;
