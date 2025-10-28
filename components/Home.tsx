import React from 'react';
import { FoodIcon, ShoppingIcon, DeliveryBoxIcon, ArrowRightIcon, UserCircleIcon, MotorcycleIcon } from './icons';

interface HomeProps {
  onNavigate: () => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="p-6 flex flex-col h-full bg-gray-50 justify-between">
      {/* Top section wrapper */}
      <div>
        {/* Header */}
        <div className="flex-shrink-0 mb-8">
          <div className="flex justify-between items-center">
              <div>
                  <h1 className="text-3xl font-bold text-gray-900">Hola, bienvenido</h1>
                  <p className="text-base text-gray-500 mt-1">¿Listo para tu mandado?</p>
              </div>
              <div className="p-2 bg-white rounded-full shadow-sm border border-gray-200">
                  <UserCircleIcon className="w-10 h-10 text-gray-400" />
              </div>
          </div>
        </div>

        {/* Services List */}
        <div>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Nuestros Servicios</h2>
          <div className="space-y-4">
              <ServiceCard
                icon={<FoodIcon />}
                title="Antojos y Comida"
                description="Tu comida favorita, caliente y a tiempo."
                color="bg-orange-500"
              />
              <ServiceCard
                icon={<ShoppingIcon />}
                title="Mandados y Súper"
                description="Hacemos las compras por ti, de la A a la Z."
                color="bg-blue-500"
              />
              <ServiceCard
                icon={<DeliveryBoxIcon />}
                title="Paquetería y Trámites"
                description="Recogemos y entregamos tus paquetes."
                color="bg-indigo-600"
              />
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="flex-shrink-0">
        <button
          onClick={onNavigate}
          className="bg-red-600 text-white w-full py-5 rounded-full font-bold hover:bg-red-700 transition-all duration-300 shadow-lg flex items-center justify-center gap-3 transform hover:scale-[1.02]"
        >
          <MotorcycleIcon className="w-7 h-7" />
          <span className="text-base">SOLICITAR UN SERVICIO</span>
        </button>
      </div>
    </div>
  );
};

interface ServiceCardProps {
  icon: React.ReactElement;
  title: string;
  description: string;
  color: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ icon, title, description, color }) => (
  <div className="group relative p-5 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 cursor-pointer flex items-center space-x-4">
      <div className={`flex-shrink-0 h-14 w-14 rounded-lg flex items-center justify-center ${color}`}>
        {React.cloneElement(icon, { className: "w-7 h-7 text-white" })}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-lg text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600 mt-0.5 pr-8">{description}</p>
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 right-4 h-9 w-9 rounded-full flex items-center justify-center bg-gray-100 group-hover:bg-gray-900 transition-colors duration-300">
        <ArrowRightIcon className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors duration-300" />
      </div>
  </div>
);