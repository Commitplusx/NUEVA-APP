import React, { useState } from 'react';
import { Restaurant, MenuItem, Ingredient } from '../App';
import { useThemeColor } from '../hooks/useThemeColor';
import { ChevronLeftIcon, StarIcon, MinusIcon, PlusIcon, LocationIcon } from './icons';
import { getTransformedImageUrl } from '../services/image';

interface ProductDetailProps {
  item: MenuItem;
  restaurant: Restaurant;
  onAddToCart: (item: MenuItem, quantity: number, customizedIngredients: Ingredient[]) => void;
  onBack: () => void;
}

const IngredientToggleButton: React.FC<{ ingredient: Ingredient; isSelected: boolean; onToggle: () => void; }> = ({ ingredient, isSelected, onToggle }) => (
    <button 
        onClick={onToggle}
        className={`flex-shrink-0 flex flex-col items-center justify-center p-2 border-2 rounded-lg w-20 h-20 text-center transition-all duration-200 relative ${
            isSelected 
            ? 'bg-orange-50 border-orange-500' 
            : 'bg-gray-100 border-gray-300 opacity-60'
        }`}
        aria-pressed={isSelected}
    >
        <ingredient.icon className={`w-8 h-8 mb-1 ${isSelected ? 'text-orange-500' : 'text-gray-400'}`} />
        <span className={`text-xs font-medium ${isSelected ? 'text-gray-700' : 'text-gray-500 line-through'}`}>{ingredient.name}</span>
    </button>
);


export const ProductDetail: React.FC<ProductDetailProps> = ({ item, restaurant, onAddToCart, onBack }) => {
  useThemeColor('#f97316');
  const [quantity, setQuantity] = useState(1);
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>(item.ingredients || []);

  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => Math.max(1, prev + amount));
  }

  const toggleIngredient = (ingredientToToggle: Ingredient) => {
    setSelectedIngredients(prev => {
      const isAlreadySelected = prev.some(ing => ing.name === ingredientToToggle.name);
      if (isAlreadySelected) {
        return prev.filter(ing => ing.name !== ingredientToToggle.name);
      } else {
        return [...prev, ingredientToToggle];
      }
    });
  };

  const totalPrice = (item.price * quantity).toFixed(2);

  const headerImageUrl = getTransformedImageUrl(restaurant.imageUrl || item.imageUrl || '', 1200, 600);

  return (
    <div className="bg-gray-50 pb-28">
      <div className="relative">
        <img src={headerImageUrl} alt={restaurant.name} className="w-full h-64 object-cover" />
        <button onClick={onBack} className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md transition-transform hover:scale-110">
          <ChevronLeftIcon className="w-6 h-6 text-gray-800"/>
        </button>
         <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/70 to-transparent">
             <span className="bg-white/90 text-black text-xs font-bold px-2 py-1 rounded">DELIVERY</span>
        </div>

        {/* Ingredient/product icons overlay (small circular chips) */}
        {item.ingredients && item.ingredients.length > 0 && (
          <div className="absolute right-4 bottom-4 flex gap-3">
            {item.ingredients.slice(0,5).map((ing, idx) => {
              const Icon = ing.icon as React.FC<any>;
              return (
                <div key={ing.name} className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md">
                  <Icon className="w-5 h-5 text-orange-500" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold text-gray-900 flex-1 pr-4">{item.name}</h1>
            <p className="text-3xl font-bold text-orange-600">${item.price.toFixed(2)}</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
            <div className="flex items-center gap-1">
                <LocationIcon className="w-4 h-4" />
                <span>{restaurant.name}</span>
            </div>
            <div className="flex items-center gap-1">
                <StarIcon className="w-5 h-5 text-yellow-400" />
                <span className="font-bold text-gray-800">{item.rating}</span>
                <span>({item.reviews} Reviews)</span>
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
                        onToggle={() => toggleIngredient(ing)}
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
      
      {/* --- Bottom Action Bar --- */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm h-24 bg-white border-t border-gray-200 flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
              <button onClick={() => handleQuantityChange(-1)} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors disabled:opacity-50" disabled={quantity <= 1}>
                  <MinusIcon className="w-6 h-6 text-gray-800" />
              </button>
              <span className="text-2xl font-bold w-8 text-center">{quantity}</span>
               <button onClick={() => handleQuantityChange(1)} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors">
                  <PlusIcon className="w-6 h-6 text-gray-800" />
              </button>
          </div>
          <button 
            onClick={() => onAddToCart(item, quantity, selectedIngredients)}
            className="flex-1 ml-4 bg-orange-500 text-white font-bold py-4 rounded-xl hover:bg-orange-600 transition-colors shadow-lg text-center"
          >
            Añadir (${totalPrice})
          </button>
      </div>
    </div>
  );
};
