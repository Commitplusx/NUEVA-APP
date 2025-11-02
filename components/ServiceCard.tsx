import React from 'react';
import { motion } from 'framer-motion';

export interface ServiceCardProps {
  icon: React.ReactElement;
  title: string;
  description: string;
  onClick?: () => void;
  selected?: boolean;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ icon, title, description, onClick, selected }) => (
  <motion.div
    layout
    onClick={onClick}
    className={`group relative p-4 md:p-6 bg-gray-50 rounded-2xl border shadow-sm overflow-hidden transition-all duration-300 ease-in-out cursor-pointer text-center ${
      selected ? 'border-orange-500 shadow-lg' : 'border-gray-200'
    }`}
    animate={{ scale: selected ? 1.05 : 1 }}
  >
    <div className="flex justify-center mb-3">
      {React.cloneElement(icon, { className: "w-10 h-10 md:w-12 md:h-12 text-orange-500" })}
    </div>
    <h4 className="font-semibold text-base md:text-lg text-gray-800">{title}</h4>
    <p className="text-xs md:text-sm text-gray-600 mt-1">{description}</p>
  </motion.div>
);