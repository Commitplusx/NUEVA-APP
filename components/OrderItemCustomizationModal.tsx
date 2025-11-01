import React, { useState } from 'react';
import { MenuItem, Ingredient } from '../types';
import { useAppContext } from '../context/AppContext';
import { XCircleIcon, PlusIcon, MinusIcon, CartIcon } from './icons';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderItemCustomizationModalProps {
  item: MenuItem;
  onClose: () => void;
}

const IngredientToggle: React.FC<{ ingredient: Ingredient; isEnabled: boolean; onToggle: () => void; }> = ({ ingredient, isEnabled, onToggle }) => {
  return (
    <motion.div 
      onClick={onToggle}
      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors duration-200 ${isEnabled ? 'bg-orange-100' : 'bg-gray-100'}`}
      whileTap={{ scale: 0.95 }}
    >
      <span className={`font-semibold ${isEnabled ? 'text-orange-800' : 'text-gray-700'}`}>{ingredient.name}</span>
      <div className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${isEnabled ? 'bg-orange-500' : 'bg-gray-300'}`}>
        <motion.div 
          className="w-5 h-5 bg-white rounded-full shadow-md"
          layout 
          transition={{ type: "spring", stiffness: 700, damping: 30 }}
          initial={{ x: isEnabled ? 20 : 0 }}
          animate={{ x: isEnabled ? 20 : 0 }}
        />
      </div>
    </motion.div>
  );
};

export const OrderItemCustomizationModal: React.FC<OrderItemCustomizationModalProps> = ({ item, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const { handleAddToCart: contextAddToCart } = useAppContext();

  const ingredients = Array.isArray(item.ingredients) ? item.ingredients : [];
  const [customizedIngredients, setCustomizedIngredients] = useState(ingredients || []);

  const total = item.price * quantity;

  const handleIngredientToggle = (ingredient: Ingredient) => {
    setCustomizedIngredients(prev =>
      prev.some(i => i.name === ingredient.name)
        ? prev.filter(i => i.name !== ingredient.name)
        : [...prev, ingredient]
    );
  };

  const handleAddToCartClick = () => {
    contextAddToCart(item, quantity, customizedIngredients);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-end z-50 p-0 md:items-center"
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: "0%" }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="bg-gray-50 rounded-t-2xl md:rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex-shrink-0 p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Personaliza tu orden</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircleIcon className="w-7 h-7" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-4">
            <div className="flex items-start gap-4 mb-4">
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
              )}
              <div className="flex-grow">
                <h3 className="text-2xl font-bold text-gray-900">{item.name}</h3>
                <p className="text-gray-600 mt-1">{item.description}</p>
              </div>
            </div>

            {ingredients.length > 0 && (
              <motion.div layout className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Ingredientes</h3>
                <div className="space-y-2">
                  {ingredients.map(ingredient => (
                    <IngredientToggle 
                      key={ingredient.name} 
                      ingredient={ingredient} 
                      isEnabled={customizedIngredients.some(i => i.name === ingredient.name)}
                      onToggle={() => handleIngredientToggle(ingredient)}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 mt-auto p-4 pt-2 pb-24 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-gray-600">Cantidad</p>
              <div className="flex items-center gap-4 bg-gray-100 rounded-full p-1">
                <motion.button
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="w-10 h-10 rounded-full bg-white shadow text-gray-700 flex items-center justify-center"
                  whileTap={{ scale: 0.9 }}
                >
                  <MinusIcon className="w-6 h-6" />
                </motion.button>
                <span className="text-xl font-bold w-8 text-center">{quantity}</span>
                <motion.button
                  onClick={() => setQuantity(prev => prev + 1)}
                  className="w-10 h-10 rounded-full bg-white shadow text-gray-700 flex items-center justify-center"
                  whileTap={{ scale: 0.9 }}
                >
                  <PlusIcon className="w-6 h-6" />
                </motion.button>
              </div>
            </div>

            <motion.button
              onClick={handleAddToCartClick}
              className="w-full bg-orange-500 text-white py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-orange-600"
              whileTap={{ scale: 0.95 }}
            >
              <CartIcon className="w-6 h-6" />
              <span>Añadir por ${(total).toFixed(2)}</span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

