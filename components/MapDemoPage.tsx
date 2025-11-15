import React from 'react';
import { MapWithMarkers } from './MapWithMarkers';

// Datos de ejemplo. En una aplicación real, estos vendrían de una API.
const mockRestaurants = [
  {
    id: 1,
    title: 'Taquería El Fogoncito',
    description: 'Los mejores tacos al pastor de la ciudad.',
    position: { lat: 16.2519, lng: -92.1383 }
  },
  {
    id: 2,
    title: 'Pizza Rústica',
    description: 'Pizza artesanal en horno de leña.',
    position: { lat: 16.2530, lng: -92.1350 }
  },
  {
    id: 3,
    title: 'Sushi Zen',
    description: 'El sabor tradicional de Japón.',
    position: { lat: 16.2495, lng: -92.1401 }
  }
];

// El centro del mapa, puedes ajustarlo como necesites.
const mapCenter = { lat: 16.2519, lng: -92.1383 };

export const MapDemoPage: React.FC = () => {
  return (
    <div className="w-full h-screen flex flex-col p-4 bg-gray-100">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Demostración del Mapa</h1>
        <p className="text-gray-600">Haz clic en los marcadores para ver la información.</p>
      </header>
      <div className="flex-grow rounded-lg overflow-hidden shadow-lg">
        <MapWithMarkers markers={mockRestaurants} center={mapCenter} />
      </div>
    </div>
  );
};
