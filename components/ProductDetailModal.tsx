import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductDetail } from './ProductDetail';
import { Restaurant, MenuItem } from '../types';
import { MinusIcon, PlusIcon } from './icons';

interface ProductDetailModalProps {
  isOpen: boolean;
  item: MenuItem | null;
  restaurant: Restaurant | null;
  onClose: () => void;
  onAddToCart: (item: MenuItem, quantity: number, customizedIngredients: string[]) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ isOpen, item, restaurant, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const toggleIngredient = (ingredientName: string) => {
    setSelectedIngredients(prev => {
      if (prev.includes(ingredientName)) {
        return prev.filter(ing => ing !== ingredientName);
      } else {
        return [...prev, ingredientName];
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

  const modalVariants = {
    initial: isDesktop 
        ? { opacity: 0, scale: 0.95 } 
        : { opacity: 1, y: "100%" },
    animate: isDesktop 
        ? { opacity: 1, scale: 1 } 
        : { opacity: 1, y: "0%" },
    exit: isDesktop 
        ? { opacity: 0, scale: 0.95 } 
        : { opacity: 1, y: "100%" }
  };

  return (
    <AnimatePresence>
        {isOpen && (
            <div 
            className={`fixed inset-0 z-50 flex justify-center ${isDesktop ? 'items-center bg-black/40 backdrop-blur-sm p-4' : 'items-end bg-black/40 backdrop-blur-sm'}`}
            onClick={onClose}
            >
            <motion.div
                variants={modalVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
                className={`bg-white w-full relative flex flex-col overflow-hidden shadow-2xl ${
                    isDesktop 
                    ? 'max-w-4xl h-[80vh] rounded-2xl' 
                    : 'max-w-lg max-h-[90vh] rounded-t-3xl'
                }`}
            >
                {/* Modified: overflow-y-auto for mobile to allow scrolling the entire product detail */}
                {/* On desktop (md:), we hide overflow here because ProductDetail handles internal scrolling */}
                <div className="flex-grow overflow-y-auto md:overflow-hidden bg-white no-scrollbar">
                    <ProductDetail 
                        item={item} 
                        restaurant={restaurant} 
                        onBack={handleBack}
                        selectedIngredients={selectedIngredients}
                        onToggleIngredient={toggleIngredient}
                        hideAddToCartBar={true} 
                    />
                </div>
                
                {/* --- Minimalist Bottom Action Bar --- */}
                <div className={`bg-white border-t border-gray-100 p-4 pb-8 md:pb-6 z-20 flex-shrink-0 ${isDesktop ? 'rounded-b-2xl' : ''}`}>
                    <div className="flex items-center justify-between gap-6 max-w-3xl mx-auto">
                        {/* Minimalist Quantity Selector */}
                        <div className="flex items-center gap-6">
                            <button 
                                onClick={() => handleQuantityChange(-1)} 
                                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${quantity <= 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:border-green-600 hover:text-green-600'}`}
                                disabled={quantity <= 1}
                            >
                                <MinusIcon className="w-4 h-4" />
                            </button>
                            <span className="text-xl font-bold text-gray-900 min-w-[1.5rem] text-center">{quantity}</span>
                            <button 
                                onClick={() => handleQuantityChange(1)} 
                                className="w-10 h-10 rounded-full border border-gray-300 text-gray-700 flex items-center justify-center hover:border-green-600 hover:text-green-600 transition-colors"
                            >
                                <PlusIcon className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Green Vibrant Button */}
                        <button 
                            onClick={handleAddToCartClick}
                            className="flex-grow bg-green-600 text-white h-14 rounded-full hover:bg-green-700 active:scale-95 transition-all shadow-lg shadow-green-600/20 flex justify-between items-center px-6"
                        >
                            <span className="font-bold text-base">Agregar</span>
                            <span className="font-bold text-lg">${totalPrice}</span>
                        </button>
                    </div>
                </div>
            </motion.div>
            </div>
        )}
    </AnimatePresence>
  );
};
