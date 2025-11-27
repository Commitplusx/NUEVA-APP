import React from 'react';
import { Restaurant, MenuItem } from '../types';
import { useThemeColor } from '../hooks/useThemeColor';
import * as Icons from './icons';
import { getTransformedImageUrl } from '../services/image';
import IngredientIcon from './IngredientIcon';
import { motion } from 'framer-motion';

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
  // New props for customization
  selectedOptions?: Record<string, string[]>;
  onOptionToggle?: (groupId: string, optionName: string, maxSelect: number) => void;
  currentPrice?: number; // Calculated price including extras
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
  onQuantityChange,
  selectedOptions = {},
  onOptionToggle,
  currentPrice
}) => {
  useThemeColor('#f0fdf4'); // Light green background for the top part

  const displayPrice = currentPrice !== undefined ? currentPrice : item.price * quantity;

  return (
    <div className="bg-white md:h-full md:flex md:overflow-hidden h-full flex flex-col">
      {/* Image Section with Circular Background - Reduced height for mobile */}
      <div className="relative w-full bg-green-50 h-48 md:w-1/2 md:h-full flex-shrink-0 overflow-hidden rounded-b-[2rem] md:rounded-none md:rounded-r-[3rem]">
        {/* Decorative Circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] aspect-square bg-white/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4">
          <motion.img
            src={getTransformedImageUrl(item.imageUrl || restaurant.imageUrl || '', 600, 600)}
            alt={item.name}
            className="w-40 h-40 md:w-96 md:h-96 object-cover rounded-full shadow-xl shadow-green-900/20"
            initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 20 }}
          />
        </div>

        {/* Header Icons */}
        <div className="absolute top-4 left-0 right-0 px-4 flex justify-between items-center z-20">
          <button onClick={onBack} className="bg-white/80 backdrop-blur-md rounded-full p-2 shadow-sm hover:bg-white transition-transform active:scale-90">
            <Icons.ChevronLeftIcon className="w-5 h-5 text-gray-800" />
          </button>
          <button className="bg-white/80 backdrop-blur-md rounded-full p-2 shadow-sm hover:bg-white transition-transform active:scale-90">
            <Icons.HeartIcon className="w-5 h-5 text-gray-800" />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-grow flex flex-col p-5 md:p-10 md:w-1/2 md:overflow-y-auto">
        <div className="flex flex-col items-center text-center mb-6">

          <div className="flex justify-between items-center w-full mb-2">
            <h1 className="text-2xl font-extrabold text-gray-900 text-left leading-tight flex-grow">{item.name}</h1>
            <p className="text-2xl font-bold text-green-600 ml-4">${displayPrice.toFixed(2)}</p>
          </div>

          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2 text-gray-500 text-xs font-medium bg-gray-100 px-2 py-1 rounded-lg">
              <Icons.ClockIcon className="w-3 h-3" />
              <span>{restaurant.delivery_time} min</span>
            </div>

            {/* Compact Quantity Selector */}
            <div className="flex items-center gap-4 bg-yellow-400 rounded-full px-4 py-1.5 shadow-md shadow-yellow-400/20">
              <button
                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                className="text-black disabled:opacity-50 active:scale-90 transition-transform p-1"
                disabled={quantity <= 1}
              >
                <Icons.MinusIcon className="w-4 h-4 font-bold" />
              </button>
              <span className="text-base font-bold text-black min-w-[1rem]">{quantity}</span>
              <button
                onClick={() => onQuantityChange(quantity + 1)}
                className="text-black active:scale-90 transition-transform p-1"
              >
                <Icons.PlusIcon className="w-4 h-4 font-bold" />
              </button>
            </div>
          </div>
        </div>

        {/* Customization Groups */}
        {item.customizationOptions?.map(group => (
          <div key={group.id} className="mb-5 w-full border-b border-gray-100 pb-4">
            <h3 className="font-bold text-gray-800 mb-1 text-left text-sm">{group.name}</h3>
            <div className="flex justify-between text-[10px] text-gray-500 mb-2">
              <span>Elige hasta {group.maxSelect}</span>
              <span>{group.includedItems} incluidos, extra +${group.pricePerExtra}</span>
            </div>

            {/* Grid Layout for Options */}
            <div className="grid grid-cols-2 gap-3">
              {group.options.map(opt => {
                const isSelected = (selectedOptions[group.id] || []).includes(opt.name);
                return (
                  <div
                    key={opt.name}
                    onClick={() => onOptionToggle && onOptionToggle(group.id, opt.name, group.maxSelect || 100)}
                    className={`flex justify-between items-center p-2.5 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-green-500 bg-green-50 shadow-sm' : 'border-gray-100 hover:border-gray-200 bg-white'
                      }`}
                  >
                    <span className={`text-xs font-medium leading-tight ${isSelected ? 'text-green-700' : 'text-gray-600'}`}>{opt.name}</span>
                    <div className={`w-4 h-4 rounded-full border flex-shrink-0 ml-2 flex items-center justify-center ${isSelected ? 'bg-green-500 border-green-500' : 'border-gray-300'
                      }`}>
                      {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Ingredients */}
        {(!item.customizationOptions || item.customizationOptions.length === 0) && item.ingredients && item.ingredients.length > 0 && (
          <div className="mb-6 w-full">
            <h3 className="text-base font-bold text-gray-900 mb-3 text-left">Ingredients</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar snap-x">
              {item.ingredients.map(ingredientName => {
                const isSelected = selectedIngredients.includes(ingredientName);
                return (
                  <button
                    key={ingredientName}
                    onClick={() => onToggleIngredient(ingredientName)}
                    className={`flex-shrink-0 w-16 h-20 rounded-xl flex flex-col items-center justify-center gap-1 p-1.5 transition-all snap-center ${isSelected
                      ? 'bg-green-50 border-2 border-green-500 shadow-sm'
                      : 'bg-gray-50 border border-gray-100 opacity-60 grayscale'
                      }`}
                  >
                    <div className={`text-xl ${isSelected ? 'text-green-600' : 'text-gray-400'}`}>
                      <IngredientIcon name={ingredientName} className="w-6 h-6" />
                    </div>
                    <span className="text-[9px] font-bold text-gray-700 truncate w-full text-center">{ingredientName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-auto pt-2">
          <p className="text-gray-400 text-xs leading-relaxed mb-4 text-center md:text-left line-clamp-3">{item.description}</p>
        </div>

        {/* Spacer for fixed bottom bar if needed */}
        <div className="h-16 md:hidden"></div>
      </div>
    </div>
  );
};
