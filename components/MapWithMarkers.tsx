import React, { useState } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { mapStyles } from './mapStyles';

interface MarkerData {
  id: string | number;
  position: google.maps.LatLngLiteral;
  title: string;
  description?: string;
}

interface MapWithMarkersProps {
  markers: MarkerData[];
  center: google.maps.LatLngLiteral;
}

export const MapWithMarkers: React.FC<MapWithMarkersProps> = ({ markers, center }) => {
  const [activeMarker, setActiveMarker] = useState<string | number | null>(null);

  const handleMarkerClick = (markerId: string | number) => {
    setActiveMarker(markerId);
  };

  const handleInfoWindowClose = () => {
    setActiveMarker(null);
  };

  return (
    <GoogleMap
      mapContainerClassName="w-full h-full"
      center={center}
      zoom={15}
      options={{
        styles: mapStyles,
        disableDefaultUI: true,
        zoomControl: true,
      }}
    >
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={marker.position}
          onClick={() => handleMarkerClick(marker.id)}
          icon={{
            url: '/icons/map-pin.svg',
            scaledSize: new window.google.maps.Size(40, 40),
            origin: new window.google.maps.Point(0, 0),
            anchor: new window.google.maps.Point(20, 40),
          }}
        >
          {activeMarker === marker.id && (
            <InfoWindow onCloseClick={handleInfoWindowClose}>
              <div>
                <h3 className="font-bold text-lg text-gray-800">{marker.title}</h3>
                {marker.description && <p className="text-gray-600">{marker.description}</p>}
              </div>
            </InfoWindow>
          )}
        </Marker>
      ))}
    </GoogleMap>
  );
};
