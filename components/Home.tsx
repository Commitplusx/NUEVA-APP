import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FoodIcon, ShoppingIcon, DeliveryBoxIcon, UserCircleIcon, ArrowRightIcon } from './icons';
import { useAppContext } from '../context/AppContext';
import { ServiceCard } from './ServiceCard';

// Define the type for our service objects, including the navigation path
interface ServiceData {
  icon: React.ReactElement;
  title: string;
  description: string;
  color: string;
  path: string;
}

const services: ServiceData[] = [
  {
    icon: <FoodIcon />,
    title: "Antojos y Comida",
    description: "Tu comida favorita, caliente y a tiempo.",
    color: "bg-orange-500",
    path: "/restaurants",
  },
  {
    icon: <ShoppingIcon />,
    title: "Mandados y Súper",
    description: "Hacemos las compras por ti, de la A a la Z.",
    color: "bg-blue-500",
    path: "/coming-soon",
  },
  {
    icon: <DeliveryBoxIcon />,
    title: "Paquetería y Trámites",
    description: "Recogemos y entregamos tus paquetes.",
    color: "bg-indigo-600",
    path: "/coming-soon",
  }
];

export const Home: React.FC = () => {
  const { user: username } = useAppContext();
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50">
      {/* Services List */}
      <div className="p-6">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">¿Qué podemos hacer por ti?</h2>
        <div className="space-y-4">
          {services.map((service) => (
            <ServiceCard
              key={service.title}
              icon={service.icon}
              title={service.title}
              description={service.description}
              color={service.color}
              onClick={() => navigate(service.path)}
            />
          ))}
        </div>
      </div>

      {/* CTA Button Section */}
      <div className="px-6 pb-6">
        <motion.button
          onClick={() => navigate('/restaurants')}
          className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 group hover:bg-gray-800 transition-colors shadow-lg"
          whileTap={{ scale: 0.95 }}
        >
          <span>Explorar Comercios</span>
          <ArrowRightIcon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
        </motion.button>
      </div>
    </div>
  );
};
