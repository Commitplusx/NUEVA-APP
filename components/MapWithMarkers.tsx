import React, { useState } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// --- INTERFACES ACTUALIZADAS PARA MAPBOX ---
// Nota: Mapbox usa 'longitude' y 'latitude' en lugar de 'lng' y 'lat'.
interface MarkerData {
  id: string | number;
  position: { longitude: number; latitude: number; };
  title: string;
  description?: string;
}

interface MapWithMarkersProps {
  markers: MarkerData[];
  center: { longitude: number; latitude: number; };
}

// --- TOKEN DE MAPBOX ---
// ¡IMPORTANTE! Reemplaza esto con tu token de acceso de Mapbox.
// Es recomendable usar variables de entorno: import.meta.env.VITE_MAPBOX_TOKEN
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZGVpZmYiLCJhIjoiY21pODc2ZGcwMDh2bTJscHpucWc1MDIybSJ9';

export const MapWithMarkers: React.FC<MapWithMarkersProps> = ({ markers, center }) => {
  const [activePopup, setActivePopup] = useState<MarkerData | null>(null);

  return (
    <Map
      initialViewState={{
        longitude: center.longitude,
        latitude: center.latitude,
        zoom: 14
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/streets-v11"
      mapboxAccessToken={MAPBOX_TOKEN}
    >
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          longitude={marker.position.longitude}
          latitude={marker.position.latitude}
          anchor="bottom"
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            setActivePopup(marker);
          }}
        >
          {/* Usamos un <img> para el ícono del marcador. Asegúrate de que la ruta sea correcta. */}
          <img src="/icons/map-pin.svg" style={{ width: 40, height: 40, cursor: 'pointer' }} />
        </Marker>
      ))}

      {activePopup && (
        <Popup
          longitude={activePopup.position.longitude}
          latitude={activePopup.position.latitude}
          onClose={() => setActivePopup(null)}
          anchor="top"
          closeOnClick={false}
        >
          <div>
            <h3 className="font-bold text-lg text-gray-800">{activePopup.title}</h3>
            {activePopup.description && <p className="text-gray-600">{activePopup.description}</p>}
          </div>
        </Popup>
      )}
    </Map>
  );
};