import React from 'react';
import { Restaurant, MenuItem, Ingredient } from '../types';
import { useThemeColor } from '../hooks/useThemeColor';
import * as Icons from './icons';
import { getTransformedImageUrl } from '../services/image';

// Map string names to actual icon components
const iconMap: { [key: string]: React.FC<any> } = {
  ChevronLeftIcon: Icons.ChevronLeftIcon,
  StarIcon: Icons.StarIcon,
  LocationIcon: Icons.LocationIcon,
  FoodIcon: Icons.FoodIcon,
  SaltIcon: Icons.SaltIcon,
  ChickenIcon: Icons.ChickenIcon,
  OnionIcon: Icons.OnionIcon,
  GarlicIcon: Icons.GarlicIcon,
  PeppersIcon: Icons.PeppersIcon,
  GingerIcon: Icons.GingerIcon,
  BroccoliIcon: Icons.BroccoliIcon,
  // Add any other ingredient icons here as needed
};

interface ProductDetailProps {
  item: MenuItem;
  restaurant: Restaurant;
  onBack: () => void;
  selectedIngredients: Ingredient[];
  onToggleIngredient: (ingredient: Ingredient) => void;
}

const IngredientToggleButton: React.FC<{ ingredient: Ingredient; isSelected: boolean; onToggle: () => void; }> = ({ ingredient, isSelected, onToggle }) => {
    const IconComponent = typeof ingredient.icon === 'string' ? iconMap[ingredient.icon] : Icons.FoodIcon;

    return (
        <button 
            onClick={onToggle}
            className={`flex-shrink-0 flex flex-col items-center justify-center p-2 border rounded-lg w-24 h-24 text-center transition-all duration-200 relative ${
                isSelected 
                ? 'bg-orange-100 border-orange-500 text-orange-800' 
                : 'bg-gray-100 border-gray-300 text-gray-600'
            }`}
            aria-pressed={isSelected}
        >
            {IconComponent && <IconComponent className={`w-8 h-8 mb-1 ${isSelected ? 'text-orange-500' : 'text-gray-400'}`} />}
            <span className={`text-xs font-medium ${isSelected ? 'text-orange-800' : 'text-gray-600'}`}>{ingredient.name}</span>
            {isSelected && (
                <div className="absolute top-1 right-1 bg-orange-500 rounded-full p-0.5">
                    <Icons.CheckIcon className="w-3 h-3 text-white" />
                </div>
            )}
        </button>
    );
};


export const ProductDetail: React.FC<ProductDetailProps> = ({ item, restaurant, onBack, selectedIngredients, onToggleIngredient }) => {
  useThemeColor('#f97316');

  return (
    <div className="bg-gray-50 pb-6">
      <div className="relative">
        <img src={getTransformedImageUrl(item.imageUrl || restaurant.imageUrl || '', 1200, 600)} alt={item.name} className="w-full h-64 object-cover" />
        <button onClick={onBack} className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md transition-transform hover:scale-110 z-10">
          <Icons.ChevronLeftIcon className="w-6 h-6 text-gray-800"/>
        </button>
      </div>

      <div className="p-4">
        <div className="flex flex-col items-start">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{item.name}</h1>
            <p className="text-4xl font-bold text-orange-600 mb-4">${item.price.toFixed(2)}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                    <Icons.LocationIcon className="w-4 h-4 text-gray-400" />
                    <span>{restaurant.name}</span>
                </div>
                {item.rating && (
                    <div className="flex items-center gap-1">
                        <Icons.StarIcon className="w-5 h-5 text-yellow-400" />
                        <span className="font-bold text-gray-800">{item.rating}</span>
                        {item.reviews && <span>({item.reviews} Reviews)</span>}
                    </div>
                )}
            </div>
        </div>

        {item.ingredients && item.ingredients.length > 0 && (
            <div className="mt-6">
                <h2 className="text-lg font-bold text-gray-800 mb-3">Ingredientes</h2>
                <p className="text-sm text-gray-500 mb-3">Selecciona los ingredientes que quieres en tu platillo.</p>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                    {item.ingredients.map(ing => (
                      <IngredientToggleButton 
                        key={ing.name} 
                        ingredient={ing}
                        isSelected={selectedIngredients.some(selIng => selIng.name === ing.name)}
                        onToggle={() => onToggleIngredient(ing)}
                      />
                    ))}
                </div>
            </div>
        )}

        <div className="mt-6">
            <h2 className="text-lg font-bold text-gray-800 mb-2">Descripción</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
        </div>
      </div>
    </div>
  );
};
