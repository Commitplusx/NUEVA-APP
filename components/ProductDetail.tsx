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
  useThemeColor('#000000'); // Changed theme color to black
  const [quantity, setQuantity] = useState(1);

  const handleAddToCartClick = () => {
    if (onAddToCart) {
      onAddToCart(item, quantity, selectedIngredients);
    }
  };

  return (
    // Modified: h-full is only for md (desktop). On mobile, it grows with content.
    <div className={`bg-white md:h-full md:flex md:overflow-hidden ${!hideAddToCartBar ? 'pb-32' : 'pb-0'}`}>
      {/* Image Section */}
      <div className="relative md:w-1/2 md:h-full bg-gray-100">
        <img 
            src={getTransformedImageUrl(item.imageUrl || restaurant.imageUrl || '', 1200, 800)} 
            alt={item.name} 
            className="w-full h-64 md:h-full object-cover" 
        />
        <button onClick={onBack} className="absolute top-4 left-4 bg-white/90 backdrop-blur-md rounded-full p-2.5 shadow-sm hover:bg-white transition-transform active:scale-90 z-10 md:hidden">
          <Icons.ChevronLeftIcon className="w-6 h-6 text-black"/>
        </button>
      </div>

      {/* Content Section */}
      {/* Modified: md:h-full and md:overflow-y-auto for desktop two-column scroll. Mobile uses parent scroll. */}
      <div className="p-6 md:p-10 md:w-1/2 md:overflow-y-auto md:h-full flex flex-col">
        <div className="flex flex-col items-start border-b border-gray-100 pb-6 mb-6">
            <div className="flex justify-between items-start w-full mb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight tracking-tight">{item.name}</h1>
                {/* Close button for desktop inside content area */}
                <button onClick={onBack} className="hidden md:block p-2 hover:bg-gray-50 rounded-full transition-colors">
                    <Icons.XIcon className="w-6 h-6 text-gray-400 hover:text-black" />
                </button>
            </div>
            
            <div className="flex items-center gap-3 mb-4 w-full">
                <p className="text-3xl font-bold text-green-600">${item.price.toFixed(2)}</p>
                {item.rating && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
                        <Icons.StarIcon className="w-4 h-4 text-yellow-500" />
                        <span className="font-bold text-sm text-gray-800">{item.rating}</span>
                        {item.reviews && <span className="text-xs text-gray-400">({item.reviews})</span>}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
                <Icons.StoreIcon className="w-4 h-4" />
                <span className="font-medium">{restaurant.name}</span>
            </div>
        </div>

        <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">Descripción</h3>
            <p className="text-gray-600 text-base leading-relaxed">{item.description}</p>
        </div>

        {/* Sección de ingredientes interactiva */}
        {item.ingredients && item.ingredients.length > 0 && (
            <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">Personaliza tu orden</h3>
                <div className="grid grid-cols-1 gap-3">
                    {item.ingredients.map(ingredientName => {
                      const isSelected = selectedIngredients.includes(ingredientName);
                      return (
                        <button 
                          key={ingredientName} 
                          onClick={() => onToggleIngredient(ingredientName)}
                          className={`w-full flex items-center justify-between p-4 border rounded-2xl transition-all duration-200 group ${
                            isSelected 
                            ? 'bg-green-50 border-green-500 shadow-sm' 
                            : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                              {/* Ingredient icon color adapts to selection */}
                              <div className={`text-3xl ${isSelected ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-500'}`}>
                                <IngredientIcon name={ingredientName} className="w-8 h-8" />
                              </div>
                              <span className={`font-medium text-base ${isSelected ? 'text-green-900' : 'text-gray-700'}`}>{ingredientName}</span>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-green-500 bg-green-500' : 'border-gray-300 bg-white'}`}>
                              {isSelected && <Icons.CheckIcon className="w-3.5 h-3.5 text-white" />}
                          </div>
                        </button>
                      );
                    })}
                </div>
            </div>
        )}
        
        {/* Spacer for scrolling */}
        <div className="h-12"></div>
      </div>

      {/* Barra inferior para añadir al carrito (Solo móvil si hideAddToCartBar es false - Legacy support) */}
      {!hideAddToCartBar && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 flex items-center justify-between gap-4 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-20 md:hidden">
          <div className="flex items-center gap-4 px-4 py-2 bg-gray-50 rounded-full">
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-black disabled:text-gray-300" disabled={quantity <= 1}><Icons.MinusIcon className="w-5 h-5"/></button>
            <span className="text-lg font-bold w-6 text-center">{quantity}</span>
            <button onClick={() => setQuantity(q => q + 1)} className="text-black"><Icons.PlusIcon className="w-5 h-5"/></button>
          </div>
          <button onClick={handleAddToCartClick} className="flex-grow bg-green-600 text-white font-bold py-3.5 px-6 rounded-full shadow-lg hover:bg-green-700 transition-colors">
            Añadir · ${(item.price * quantity).toFixed(2)}
          </button>
        </div>
      )}
    </div>
  );
};
