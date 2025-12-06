import React from 'react';
import { Restaurant, MenuItem } from '../types';
import { useThemeColor } from '../hooks/useThemeColor';
import * as Icons from './icons';
import { getTransformedImageUrl } from '../services/image';
import IngredientIcon from './IngredientIcon';
import { motion, AnimatePresence } from 'framer-motion';

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
  selectedOptions?: Record<string, string[]>;
  onOptionToggle?: (groupId: string, optionName: string, maxSelect: number) => void;
  currentPrice?: number;
}

// --- Animated Option Component ---
const OptionItem: React.FC<{
  name: string;
  isSelected: boolean;
  onToggle: () => void;
  price?: number;
}> = ({ name, isSelected, onToggle, price }) => (
  <motion.div
    onClick={onToggle}
    layout
    className={`relative flex items-center justify-between p-4 mb-2 rounded-2xl cursor-pointer border transition-colors ${isSelected
        ? 'bg-purple-50 border-purple-200'
        : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50'
      }`}
    whileTap={{ scale: 0.98 }}
    transition={{ type: "spring", stiffness: 500, damping: 30 }}
  >
    <div className="flex items-center gap-3">
      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
        }`}>
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-white"
          >
            <Icons.CheckIcon className="w-4 h-4" />
          </motion.div>
        )}
      </div>
      <span className={`font-medium ${isSelected ? 'text-purple-900' : 'text-gray-700'}`}>
        {name}
      </span>
    </div>
    {price && price > 0 && (
      <span className="text-sm font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-md">
        +${price.toFixed(2)}
      </span>
    )}
  </motion.div>
);

// --- Ingredient Toggle Component ---
const IngredientToggle: React.FC<{
  name: string;
  isSelected: boolean;
  onToggle: () => void;
}> = ({ name, isSelected, onToggle }) => (
  <motion.button
    onClick={onToggle}
    layout
    className={`flex-shrink-0 w-20 h-24 rounded-2xl flex flex-col items-center justify-center gap-2 p-2 transition-all relative ${isSelected
        ? 'bg-green-50 border-2 border-green-500 shadow-sm'
        : 'bg-gray-50 border border-gray-100 opacity-60 grayscale'
      }`}
    whileTap={{ scale: 0.9 }}
  >
    <div className={`text-2xl ${isSelected ? 'text-green-600' : 'text-gray-400'}`}>
      <IngredientIcon name={name} className="w-8 h-8" />
    </div>
    <span className="text-[10px] font-bold text-gray-700 leading-tight w-full text-center line-clamp-2">
      {name}
    </span>
    {isSelected && (
      <motion.div
        layoutId={`check-${name}`}
        className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center shadow-sm"
      >
        <Icons.CheckIcon className="w-2.5 h-2.5 text-white" />
      </motion.div>
    )}
  </motion.button>
);

export const ProductDetail: React.FC<ProductDetailProps> = ({
  item,
  restaurant,
  onBack,
  selectedIngredients,
  onToggleIngredient,
  quantity,
  onQuantityChange,
  selectedOptions = {},
  onOptionToggle,
  currentPrice
}) => {
  useThemeColor('#ffffff');

  const displayPrice = currentPrice !== undefined ? currentPrice : item.price * quantity;

  return (
    <div className="bg-white md:h-full md:flex md:overflow-hidden h-full flex flex-col">
      {/* --- Header Image --- */}
      <div className="relative w-full h-64 md:h-full md:w-1/2 flex-shrink-0 overflow-hidden bg-white">
        <motion.div
          className="absolute inset-0 z-0 bg-purple-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Abstract Backdrops */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] aspect-square bg-purple-200/20 rounded-full blur-[80px]" />

        <div className="relative z-10 w-full h-full flex items-center justify-center p-8">
          <motion.img
            src={getTransformedImageUrl(item.imageUrl || restaurant.imageUrl || '', 800, 800)}
            alt={item.name}
            className="w-48 h-48 md:w-96 md:h-96 object-cover rounded-full shadow-2xl shadow-purple-900/10"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 20 }}
          />
        </div>

        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-20">
          <motion.button
            onClick={onBack}
            className="bg-white/90 backdrop-blur-md rounded-full p-3 shadow-lg hover:bg-white transition-all"
            whileTap={{ scale: 0.9 }}
          >
            <Icons.ChevronLeftIcon className="w-6 h-6 text-gray-800" />
          </motion.button>

          {/* Info Badge */}
          <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
            <Icons.ClockIcon className="w-3.5 h-3.5 text-purple-600" />
            <span className="text-xs font-bold text-gray-800">{restaurant.delivery_time} min</span>
          </div>
        </div>
      </div>

      {/* --- Content Scroll --- */}
      <div className="flex-grow flex flex-col md:w-1/2 bg-white rounded-t-[2.5rem] -mt-10 md:mt-0 md:rounded-none relative z-10 md:overflow-y-auto">
        <div className="p-6 md:p-10 pb-32">

          {/* Header Info */}
          <div className="mb-8">
            <div className="flex justify-between items-start gap-4 mb-2">
              <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">{item.name}</h1>
              <p className="text-2xl font-black text-purple-600 flex-shrink-0">${item.price.toFixed(2)}</p>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gray-100 my-6" />

          {/* Customization Groups */}
          {item.customizationOptions?.map(group => (
            <div key={group.id} className="mb-8">
              <div className="flex justify-between items-baseline mb-4">
                <h3 className="text-lg font-bold text-gray-900">{group.name}</h3>
                <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                  {group.maxSelect === 1 ? 'Elige 1' : `Hasta ${group.maxSelect}`}
                </span>
              </div>

              <div className="space-y-1">
                {group.options.map(opt => {
                  // Calculate if this option adds extra cost
                  const selectedCount = (selectedOptions[group.id] || []).length;
                  const isSelected = (selectedOptions[group.id] || []).includes(opt.name);

                  // Logic for display price: Show price if it WOULD cost extra or DOES cost extra
                  // Simplifying: Just show the potential price per extra
                  const priceDisplay = group.pricePerExtra > 0 ? group.pricePerExtra : undefined;

                  return (
                    <OptionItem
                      key={opt.name}
                      name={opt.name}
                      isSelected={isSelected}
                      price={priceDisplay}
                      onToggle={() => onOptionToggle && onOptionToggle(group.id, opt.name, group.maxSelect || 100)}
                    />
                  );
                })}
              </div>
            </div>
          ))}

          {/* Ingredients */}
          {(!item.customizationOptions || item.customizationOptions.length === 0) && item.ingredients && item.ingredients.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Ingredientes</h3>
              <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
                {item.ingredients.map(ing => (
                  <IngredientToggle
                    key={ing}
                    name={ing}
                    isSelected={selectedIngredients.includes(ing)}
                    onToggle={() => onToggleIngredient(ing)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector Inline (Desktop mostly, or just extra utility) */}
          <div className="flex items-center justify-between mt-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <span className="font-bold text-gray-700">Cantidad</span>
            <div className="flex items-center gap-6 bg-white rounded-xl shadow-sm px-2 py-1 border border-gray-200">
              <button
                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-purple-600 active:scale-90 transition-transform"
                disabled={quantity <= 1}
              >
                <Icons.MinusIcon className="w-5 h-5" />
              </button>
              <span className="text-xl font-black text-gray-900 w-6 text-center">{quantity}</span>
              <button
                onClick={() => onQuantityChange(quantity + 1)}
                className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-purple-600 active:scale-90 transition-transform"
              >
                <Icons.PlusIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
