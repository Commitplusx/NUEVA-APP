import React from 'react';
import { FoodIcon, ShoppingIcon, DeliveryBoxIcon, MotorcycleIcon } from './icons';

interface HomeProps {
  onNavigate: () => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="p-6 flex flex-col h-full text-center">
      <div className="flex-grow">
        <MotorcycleIcon className="w-48 h-48 mx-auto text-gray-800" />
        <h1 className="text-3xl font-bold mt-4">Lo que necesites,</h1>
        <h2 className="text-3xl font-bold text-red-600">donde lo necesites.</h2>
        <p className="text-gray-600 mt-2">
          Tu servicio de delivery rápido y confiable en la ciudad.
        </p>

        <div className="mt-8 text-left">
          <h3 className="font-bold text-lg mb-3">Nuestros Servicios</h3>
          <div className="space-y-3">
            <ServiceCard
              icon={<FoodIcon className="w-8 h-8 text-red-600" />}
              title="Antojos y Comida"
              description="Pedimos tu comida favorita y te la llevamos caliente."
            />
            <ServiceCard
              icon={<ShoppingIcon className="w-8 h-8 text-red-600" />}
              title="Mandados y Súper"
              description="Hacemos las compras por ti, desde el súper hasta la farmacia."
            />
            <ServiceCard
              icon={<DeliveryBoxIcon className="w-8 h-8 text-red-600" />}
              title="Paquetería y Trámites"
              description="Recogemos y entregamos tus paquetes pequeños o documentos."
            />
          </div>
        </div>
      </div>

      <div>
        <button
          onClick={onNavigate}
          className="bg-red-600 text-white w-full py-4 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg"
        >
          SOLICITAR UN SERVICIO
        </button>
      </div>
    </div>
  );
};

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ icon, title, description }) => (
  <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
    <div className="mr-4">
      {icon}
    </div>
    <div>
      <h4 className="font-bold text-gray-800">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </div>
);