import React from 'react';
import { motion } from 'framer-motion';
import { Restaurant } from '../types';
import { StarIcon, ClockIcon } from './icons';
import { getTransformedImageUrl } from '../services/image';

import { useAppContext } from '../context/AppContext';

export const RestaurantCard: React.FC<{ restaurant: Restaurant; onSelect: () => void; }> = ({ restaurant, onSelect }) => {
  const { baseFee } = useAppContext();
  const optimizedImageUrl = getTransformedImageUrl(restaurant.imageUrl || '', 400, 300);
  const displayDeliveryFee = Math.max(restaurant.deliveryFee, baseFee);

  return (
    <motion.button 
      onClick={onSelect} 
      className="w-full text-left bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 transition-all duration-300 ease-in-out"
      whileHover={{ scale: 1.03, y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      <div className="relative w-full h-40 bg-gray-200">
        {optimizedImageUrl ? (
          <img src={optimizedImageUrl} alt={restaurant.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
        )}
        <div className="absolute top-2 right-2 bg-yellow-400 text-white text-sm font-bold px-3 py-1 rounded-full flex items-center shadow-md">
          <StarIcon className="w-4 h-4 text-white mr-1" />
          {restaurant.rating}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-1">{restaurant.name}</h3>
        <div className="flex flex-wrap gap-2 mb-2">
          {restaurant.categories?.map(c => (
            <span key={c.name} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {c.name}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between text-sm text-gray-700 mt-3">
          <div className="flex items-center gap-1">
            <span className="font-bold text-green-600">${displayDeliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-1">
            <ClockIcon className="w-4 h-4 text-gray-500" />
            <span className="font-semibold">{restaurant.deliveryTime}</span>
          </div>
        </div>
      </div>
    </motion.button>
  );
};