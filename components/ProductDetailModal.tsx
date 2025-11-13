import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ProductDetail } from './ProductDetail';
import { Restaurant, MenuItem, Ingredient } from '../types';
import { MinusIcon, PlusIcon } from './icons';

interface ProductDetailModalProps {
  isOpen: boolean;
  item: MenuItem | null;
  restaurant: Restaurant | null;
  onClose: () => void;
  onAddToCart: (item: MenuItem, quantity: number, customizedIngredients: Ingredient[]) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ isOpen, item, restaurant, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);

  // Reset state when the item changes (when a new modal is opened)
  useEffect(() => {
    if (item) {
      setQuantity(1);
      setSelectedIngredients(item.ingredients || []);
    }
  }, [item]);

  if (!isOpen || !item || !restaurant) {
    return null;
  }

  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };

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

  const handleBack = () => {
    onClose();
  };

  const handleAddToCartClick = () => {
    onAddToCart(item, quantity, selectedIngredients);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: "0%" }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-50 rounded-t-2xl shadow-xl w-full max-w-lg relative flex flex-col max-h-[85vh]"
      >
        <div className="overflow-y-auto no-scrollbar">
          <ProductDetail 
            item={item} 
            restaurant={restaurant} 
            onBack={handleBack}
            selectedIngredients={selectedIngredients}
            onToggleIngredient={toggleIngredient}
          />
        </div>
        
        {/* --- Bottom Action Bar --- */}
        <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 rounded-b-2xl">
          <div className="flex items-center justify-between p-4">
              {/* Left side: Price */}
              <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Total</span>
                  <span className="text-2xl font-bold text-gray-900">${totalPrice}</span>
              </div>

              {/* Right side: Actions */}
              <div className="flex items-center gap-4">
                  {/* Quantity Selector */}
                  <div className="flex items-center gap-3 p-1 bg-gray-100 rounded-full">
                      <button 
                          onClick={() => handleQuantityChange(-1)} 
                          className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-800 hover:bg-gray-50 transition-colors disabled:opacity-50" 
                          disabled={quantity <= 1}
                      >
                          <MinusIcon className="w-5 h-5" />
                      </button>
                      <span className="text-lg font-bold w-8 text-center">{quantity}</span>
                      <button 
                          onClick={() => handleQuantityChange(1)} 
                          className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-800 hover:bg-gray-50 transition-colors"
                      >
                          <PlusIcon className="w-5 h-5" />
                      </button>
                  </div>
                  {/* Add to Cart Button */}
                  <button 
                      onClick={handleAddToCartClick}
                      className="bg-orange-500 text-white font-bold py-3 px-6 rounded-full hover:bg-orange-600 transition-all shadow-lg"
                  >
                      Añadir
                  </button>
              </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
