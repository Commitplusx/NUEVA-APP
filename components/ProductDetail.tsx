import React from 'react';
import { Restaurant, MenuItem } from '../types';
import { useThemeColor } from '../hooks/useThemeColor';
import * as Icons from './icons';
import { getTransformedImageUrl } from '../services/image';
import IngredientIcon from './IngredientIcon';

interface ProductDetailProps {
  item: MenuItem;
  restaurant: Restaurant;
  onBack: () => void;
  onAddToCart?: (menuItem: MenuItem, quantity: number, selectedIngredients: string[]) => void;
  selectedIngredients: string[];
  onToggleIngredient: (name: string) => void;
  hideAddToCartBar?: boolean;
  quantity: number;
  onQuantityChange: (qty: number) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  item,
  restaurant,
  onBack,
  onAddToCart,
  selectedIngredients,
  onToggleIngredient,
  hideAddToCartBar = false,
  quantity,
  onQuantityChange
}) => {
  useThemeColor('#f0fdf4'); // Light green background for the top part

  const handleAddToCartClick = () => {
    if (onAddToCart) {
      onAddToCart(item, quantity, selectedIngredients);
    }
  };

  return (
    <div className="bg-white md:h-full md:flex md:overflow-hidden h-full flex flex-col">
      {/* Image Section with Circular Background */}
      <div className="relative w-full bg-green-50 md:w-1/2 md:h-full flex-shrink-0 overflow-hidden rounded-b-[3rem] md:rounded-none md:rounded-r-[3rem]">
        {/* Decorative Circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] aspect-square bg-white/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8 pt-16">
          <motion.img
            src={getTransformedImageUrl(item.imageUrl || restaurant.imageUrl || '', 600, 600)}
            alt={item.name}
            className="w-64 h-64 md:w-96 md:h-96 object-cover rounded-full shadow-2xl shadow-green-900/20"
            initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 20 }}
          />
        </div>

        {/* Header Icons */}
        <div className="absolute top-4 left-0 right-0 px-4 flex justify-between items-center z-20">
          <button onClick={onBack} className="bg-white/80 backdrop-blur-md rounded-full p-3 shadow-sm hover:bg-white transition-transform active:scale-90">
            <Icons.ChevronLeftIcon className="w-6 h-6 text-gray-800" />
          </button>
          <button className="bg-white/80 backdrop-blur-md rounded-full p-3 shadow-sm hover:bg-white transition-transform active:scale-90">
            <Icons.HeartIcon className="w-6 h-6 text-gray-800" />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-grow flex flex-col p-6 md:p-10 md:w-1/2 md:overflow-y-auto">
        <div className="flex flex-col items-center text-center mb-8">
          {/* Quantity Selector - Centered Pill */}
          <div className="flex items-center gap-6 bg-yellow-400 rounded-full px-6 py-3 mb-6 shadow-lg shadow-yellow-400/30">
            <button
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              className="text-black disabled:opacity-50 active:scale-90 transition-transform"
              disabled={quantity <= 1}
            >
              <Icons.MinusIcon className="w-5 h-5 font-bold" />
            </button>
            <span className="text-xl font-bold text-black min-w-[1.5rem]">{quantity}</span>
            <button
              onClick={() => onQuantityChange(quantity + 1)}
              className="text-black active:scale-90 transition-transform"
            >
              <Icons.PlusIcon className="w-5 h-5 font-bold" />
            </button>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{item.name}</h1>
          <p className="text-3xl font-bold text-green-600">${item.price.toFixed(2)}</p>

          <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm font-medium">
            <Icons.ClockIcon className="w-4 h-4" />
            <span>Delivery in {restaurant.delivery_time} min</span>
          </div>
        </div>

        {/* Ingredients */}
        {item.ingredients && item.ingredients.length > 0 && (
          <div className="mb-8 w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Ingredients</h3>
            <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
              {item.ingredients.map(ingredientName => {
                const isSelected = selectedIngredients.includes(ingredientName);
                return (
                  <button
                    key={ingredientName}
                    onClick={() => onToggleIngredient(ingredientName)}
                    className={`flex-shrink-0 w-20 h-24 rounded-2xl flex flex-col items-center justify-center gap-2 p-2 transition-all snap-center ${isSelected
                        ? 'bg-green-50 border-2 border-green-500 shadow-md'
                        : 'bg-gray-50 border border-gray-100 opacity-60 grayscale'
                      }`}
                  >
                    <div className={`text-2xl ${isSelected ? 'text-green-600' : 'text-gray-400'}`}>
                      <IngredientIcon name={ingredientName} className="w-8 h-8" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-700 truncate w-full text-center">{ingredientName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-auto pt-4">
          <p className="text-gray-500 text-sm leading-relaxed mb-6 text-center md:text-left">{item.description}</p>
        </div>

        {/* Spacer for fixed bottom bar if needed */}
        <div className="h-20 md:hidden"></div>
      </div>
    </div>
  );
};

// Import motion for animations
import { motion } from 'framer-motion';
