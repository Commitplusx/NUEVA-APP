import React from 'react';
import { ArrowRightIcon } from './icons';

export interface ServiceCardProps {
  icon: React.ReactElement;
  title: string;
  description: string;
  color: string;
  onClick?: () => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ icon, title, description, color, onClick }) => (
  <div
    onClick={onClick}
    className="group relative p-5 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 cursor-pointer flex items-center space-x-4"
  >
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
