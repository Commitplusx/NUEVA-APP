
import React from 'react';

interface TariffCardProps {
  icon: React.ReactNode;
  title: string;
  price: number;
  isSelected: boolean;
  onClick: () => void;
}

export const TariffCard: React.FC<TariffCardProps> = ({ icon, title, price, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`p-3 border rounded-lg text-center transition-all duration-200 ${
        isSelected
          ? 'bg-gray-900 text-white shadow-lg'
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
      }`}
    >
      {icon}
      <p className="text-xs font-semibold uppercase">{title}</p>
      <p className="text-lg font-bold">${price}</p>
    </button>
  );
};
