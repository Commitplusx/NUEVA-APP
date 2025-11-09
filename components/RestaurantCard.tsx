import React from 'react';
import { motion } from 'framer-motion';
import { Restaurant } from '../types';
import { StarIcon, ClockIcon, TruckIcon } from './icons';
import { getTransformedImageUrl } from '../services/image';
import { useAppContext } from '../context/AppContext';

export const RestaurantCard: React.FC<{ restaurant: Restaurant; onSelect: () => void; }> = ({ restaurant, onSelect }) => {
  const { baseFee } = useAppContext();
  const optimizedImageUrl = getTransformedImageUrl(restaurant.imageUrl || '', 400, 300);
  const displayDeliveryFee = Math.max(restaurant.deliveryFee, baseFee);

  return (
    <motion.button 
      onClick={onSelect} 
      className="w-full text-left bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out"
      whileHover={{ scale: 1.03, y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="relative w-full h-48 bg-gray-200">
        {optimizedImageUrl ? (
          <img src={optimizedImageUrl} alt={restaurant.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-xl text-gray-900 mb-2 truncate">{restaurant.name}</h3>
        <p className="text-sm text-gray-600 mb-3">{restaurant.categories?.map(c => c.name).join(' - ')}</p>

        <div className="flex items-center justify-start text-sm text-gray-700 space-x-4">
          <div className="flex items-center gap-1">
            <StarIcon className="w-5 h-5 text-yellow-500" />
            <span className="font-bold text-gray-800">{restaurant.rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <TruckIcon className="w-5 h-5 text-gray-500" />
            <span className="font-semibold">
              {displayDeliveryFee > 0 ? `$${displayDeliveryFee.toFixed(2)}` : 'Free'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <ClockIcon className="w-5 h-5 text-gray-500" />
            <span className="font-semibold">{restaurant.deliveryTime} min</span>
          </div>
        </div>
      </div>
    </motion.button>
  );
};
