import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductDetail } from './ProductDetail';
import { Restaurant, MenuItem } from '../types';
import { MinusIcon, PlusIcon } from './icons';
import Lottie from 'lottie-react';
import cartAnimation from './animations/cart checkout - fast.json';

interface ProductDetailModalProps {
  isOpen: boolean;
  item: MenuItem | null;
  restaurant: Restaurant | null;
  onClose: () => void;
  onAddToCart: (item: MenuItem, quantity: number, customizedIngredients: string[], selectedOptions?: Record<string, string[]>) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ isOpen, item, restaurant, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (item) {
      setQuantity(1);
      setSelectedIngredients(item.ingredients || []);
      setSelectedOptions({});
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

  const handleOptionToggle = (groupId: string, optionName: string, maxSelect: number) => {
    setSelectedOptions(prev => {
      const current = prev[groupId] || [];
      if (current.includes(optionName)) {
        return { ...prev, [groupId]: current.filter(o => o !== optionName) };
      } else {
        if (maxSelect && current.length >= maxSelect) return prev;
        return { ...prev, [groupId]: [...current, optionName] };
      }
    });
  };

  const calculateExtraPrice = () => {
    let extra = 0;
    if (item.customizationOptions) {
      item.customizationOptions.forEach(group => {
        const selectedCount = (selectedOptions[group.id] || []).length;
        const chargeableCount = Math.max(0, selectedCount - group.includedItems);
        extra += chargeableCount * group.pricePerExtra;
      });
    }
    return extra;
  };

  const unitPrice = item.price + calculateExtraPrice();
  const totalPrice = (unitPrice * quantity).toFixed(2);

  const handleBack = () => {
    onClose();
  };

  const handleAddToCartClick = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onAddToCart(item, quantity, selectedIngredients, selectedOptions);
      setIsAnimating(false);
      onClose();
    }, 1500); // Wait for animation
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
            className={`bg-white w-full relative flex flex-col overflow-hidden shadow-2xl ${isDesktop
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
                quantity={quantity}
                onQuantityChange={setQuantity}
                selectedOptions={selectedOptions}
                onOptionToggle={handleOptionToggle}
                currentPrice={unitPrice * quantity}
              />
            </div>

            {/* --- Minimalist Bottom Action Bar --- */}
            <div className={`bg-white border-t border-gray-100 p-4 pb-8 md:pb-6 z-20 flex-shrink-0 ${isDesktop ? 'rounded-b-2xl' : ''}`}>
              <div className="flex items-center justify-center max-w-3xl mx-auto w-full">
                {/* Purple Vibrant Button - Full Width */}
                <button
                  onClick={handleAddToCartClick}
                  disabled={isAnimating}
                  className="w-full bg-purple-600 text-white h-14 rounded-full hover:bg-purple-700 active:scale-95 transition-all shadow-lg shadow-purple-600/20 flex justify-between items-center px-6 disabled:opacity-70 disabled:scale-100"
                >
                  {isAnimating ? (
                    <div className="flex justify-center items-center w-full">
                      <span className="font-bold text-base mr-2">Agregando...</span>
                    </div>
                  ) : (
                    <>
                      <span className="font-bold text-base">Agregar al carrito</span>
                      <span className="font-bold text-lg">${totalPrice}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Full Screen Animation Overlay */}
            <AnimatePresence>
              {isAnimating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm"
                >
                  <div className="w-64 h-64">
                    <Lottie animationData={cartAnimation} loop={false} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
