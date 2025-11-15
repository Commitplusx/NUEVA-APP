import React, { useState } from 'react';
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
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ 
  item, 
  restaurant, 
  onBack, 
  onAddToCart,
  selectedIngredients,
  onToggleIngredient,
  hideAddToCartBar = false
}) => {
  useThemeColor('#f97316');
  const [quantity, setQuantity] = useState(1);

  const handleAddToCartClick = () => {
    if (onAddToCart) {
      onAddToCart(item, quantity, selectedIngredients);
    }
    // Optional: Show a toast or navigate back
  };

  return (
    <div className={`bg-gray-50 ${!hideAddToCartBar ? 'pb-32' : 'pb-4'}`}>
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

        <div className="mt-6">
            <h2 className="text-lg font-bold text-gray-800 mb-2">Descripción</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
        </div>

        {/* Sección de ingredientes interactiva */}
        {item.ingredients && item.ingredients.length > 0 && (
            <div className="mt-6">
                <h2 className="text-lg font-bold text-gray-800 mb-3">Ingredientes</h2>
                <p className="text-sm text-gray-500 mb-3">Selecciona los ingredientes que quieres en tu platillo.</p>
                <div className="flex flex-wrap gap-3">
                    {item.ingredients.map(ingredientName => {
                      const isSelected = selectedIngredients.includes(ingredientName);
                      return (
                        <button 
                          key={ingredientName} 
                          onClick={() => onToggleIngredient(ingredientName)}
                          className={`flex items-center gap-3 p-3 border rounded-xl transition-all duration-200 relative ${
                            isSelected 
                            ? 'bg-orange-50 border-orange-500' 
                            : 'bg-gray-100 border-gray-200'
                          }`}
                        >
                          <IngredientIcon name={ingredientName} className={`text-2xl ${isSelected ? 'text-orange-500' : 'text-gray-500'}`} />
                          <span className={`font-medium ${isSelected ? 'text-orange-800' : 'text-gray-700'}`}>{ingredientName}</span>
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 bg-orange-500 rounded-full p-0.5 shadow">
                                <Icons.CheckIcon className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                </div>
            </div>
        )}
      </div>

      {/* Barra inferior para añadir al carrito */}
      {!hideAddToCartBar && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex items-center justify-between gap-4 shadow-top z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-2 bg-gray-200 rounded-full text-gray-700"><Icons.MinusIcon className="w-5 h-5"/></button>
            <span className="text-xl font-bold w-8 text-center">{quantity}</span>
            <button onClick={() => setQuantity(q => q + 1)} className="p-2 bg-gray-200 rounded-full text-gray-700"><Icons.PlusIcon className="w-5 h-5"/></button>
          </div>
          <button onClick={handleAddToCartClick} className="flex-grow bg-orange-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-orange-600 transition-colors">
            Añadir al Carrito
          </button>
        </div>
      )}
    </div>
  );
};
