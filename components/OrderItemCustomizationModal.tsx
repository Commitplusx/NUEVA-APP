import React, { useState, useEffect } from 'react';
import { MenuItem, Ingredient, MenuItemOptionGroup } from '../types';
import { useAppContext } from '../context/AppContext';
import { XCircleIcon, PlusIcon, MinusIcon, CartIcon, CheckCircleIcon } from './icons';
import { motion, AnimatePresence, useSpring, useMotionValueEvent } from 'framer-motion';

interface OrderItemCustomizationModalProps {
  item: MenuItem;
  onClose: () => void;
}

const IngredientToggle: React.FC<{ ingredient: Ingredient; isEnabled: boolean; onToggle: () => void; }> = ({ ingredient, isEnabled, onToggle }) => {
  return (
    <motion.div
      onClick={onToggle}
      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 border ${isEnabled ? 'bg-orange-50 border-orange-200 shadow-sm hover:bg-orange-100' : 'bg-white border-gray-200 hover:shadow-md hover:border-gray-300'}`}
      whileTap={{ scale: 0.95 }}
    >
      <span className={`font-semibold ${isEnabled ? 'text-orange-800' : 'text-gray-700'}`}>{ingredient.name}</span>
      <div className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${isEnabled ? 'bg-orange-500' : 'bg-gray-300'}`}>
        <motion.div
          className="w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center"
          layout
          transition={{ type: "spring", stiffness: 700, damping: 30 }}
          initial={{ x: isEnabled ? 20 : 0 }}
          animate={{ x: isEnabled ? 20 : 0 }}
        >
          {isEnabled && <CheckCircleIcon className="w-4 h-4 text-orange-500" />}
        </motion.div>
      </div>
    </motion.div>
  );
};

const OptionCheckbox: React.FC<{
  option: string;
  isSelected: boolean;
  isExtra: boolean;
  extraPrice: number;
  onToggle: () => void;
}> = ({ option, isSelected, isExtra, extraPrice, onToggle }) => {
  return (
    <motion.div
      onClick={onToggle}
      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 border ${isSelected
        ? 'bg-orange-50 border-orange-200 shadow-sm'
        : 'bg-white border-gray-200 hover:shadow-md hover:border-gray-300'
        }`}
      whileTap={{ scale: 0.95 }}
    >
      <div className="flex items-center gap-2">
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-orange-500 border-orange-500' : 'border-gray-300'
          }`}>
          {isSelected && <CheckCircleIcon className="w-4 h-4 text-white" />}
        </div>
        <span className={`font-medium ${isSelected ? 'text-orange-800' : 'text-gray-700'}`}>
          {option}
        </span>
      </div>
      {isExtra && (
        <span className="text-sm font-semibold text-orange-600">
          +${extraPrice.toFixed(2)}
        </span>
      )}
    </motion.div>
  );
};

export const OrderItemCustomizationModal: React.FC<OrderItemCustomizationModalProps> = ({ item, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const { handleAddToCart: contextAddToCart, setIsCustomizationModalOpen } = useAppContext();

  const ingredients = Array.isArray(item.ingredients) ? item.ingredients : [];
  const [customizedIngredients, setCustomizedIngredients] = useState(ingredients || []);

  // Estado para opciones de personalización
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});

  const customizationGroups = item.customizationOptions || [];

  // DEBUG: Ver qué grupos de personalización tiene el item
  console.log('🎨 Item completo:', item);
  console.log('🎨 customizationGroups:', customizationGroups);
  console.log('🎨 Cantidad de grupos:', customizationGroups.length);
  if (customizationGroups.length > 0) {
    console.log('🎨 Primer grupo:', customizationGroups[0]);
    console.log('🎨 Opciones del primer grupo:', customizationGroups[0]?.options);
  }

  // Calcular precio extra por opciones
  const calculateExtrasPrice = () => {
    let extrasTotal = 0;
    customizationGroups.forEach(group => {
      const selected = selectedOptions[group.id]?.length || 0;
      const extras = Math.max(0, selected - group.includedItems);
      extrasTotal += extras * group.pricePerExtra;
    });
    return extrasTotal;
  };

  const extrasPrice = calculateExtrasPrice();
  const total = (item.price + extrasPrice) * quantity;

  const springTotal = useSpring(total, { stiffness: 400, damping: 30 });
  const [displayedTotal, setDisplayedTotal] = useState(total);

  useMotionValueEvent(springTotal, "change", (latest) => {
    setDisplayedTotal(latest);
  });

  useEffect(() => {
    springTotal.set(total);
  }, [total, springTotal]);

  useEffect(() => {
    setIsCustomizationModalOpen(true);
    return () => setIsCustomizationModalOpen(false);
  }, [setIsCustomizationModalOpen]);

  const handleIngredientToggle = (ingredient: Ingredient) => {
    setCustomizedIngredients(prev =>
      prev.some(i => i.name === ingredient.name)
        ? prev.filter(i => i.name !== ingredient.name)
        : [...prev, ingredient]
    );
  };

  const handleOptionToggle = (groupId: string, optionName: string) => {
    setSelectedOptions(prev => {
      const currentSelections = prev[groupId] || [];
      const isSelected = currentSelections.includes(optionName);

      if (isSelected) {
        return {
          ...prev,
          [groupId]: currentSelections.filter(name => name !== optionName)
        };
      } else {
        return {
          ...prev,
          [groupId]: [...currentSelections, optionName]
        };
      }
    });
  };

  const handleAddToCartClick = () => {
    // Convertir customizedIngredients a string[] para compatibilidad
    const ingredientsAsStrings = customizedIngredients.map(ing => ing.name);
    contextAddToCart(item, quantity, ingredientsAsStrings, selectedOptions);
    setIsCustomizationModalOpen(false);
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
          <div className="flex-shrink-0 p-4 flex justify-between items-center shadow-md bg-white rounded-t-2xl md:rounded-t-2xl">
            <h2 className="text-xl font-bold text-gray-800">Personaliza tu orden</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircleIcon className="w-7 h-7" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-4 bg-white">
            <div className="flex items-start gap-4 mb-4 p-3 bg-white rounded-lg">
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
              )}
              <div className="flex-grow">
                <h3 className="text-2xl font-bold text-gray-900">{item.name || 'Producto Desconocido'}</h3>
                <p className="text-gray-600 mt-1">{item.description || 'Sin descripción disponible.'}</p>
                <p className="text-lg font-bold text-orange-600 mt-2">${item.price.toFixed(2)}</p>
              </div>
            </div>

            {/* Grupos de Personalización */}
            {customizationGroups.map(group => {
              const selectedCount = selectedOptions[group.id]?.length || 0;
              const extrasCount = Math.max(0, selectedCount - group.includedItems);

              return (
                <motion.div key={group.id} layout className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">{group.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-600">
                        {group.includedItems} {group.includedItems === 1 ? 'incluido' : 'incluidos'} gratis
                      </span>
                      {group.pricePerExtra > 0 && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-orange-600 font-medium">
                            Extras: ${group.pricePerExtra.toFixed(2)} c/u
                          </span>
                        </>
                      )}
                    </div>
                    {selectedCount > 0 && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-600">Seleccionados: {selectedCount}</span>
                        {extrasCount > 0 && (
                          <span className="ml-2 text-orange-600 font-semibold">
                            ({extrasCount} {extrasCount === 1 ? 'extra' : 'extras'}: +${(extrasCount * group.pricePerExtra).toFixed(2)})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {group.options.map((option, idx) => {
                      const isSelected = selectedOptions[group.id]?.includes(option.name) || false;
                      const selectionIndex = selectedOptions[group.id]?.indexOf(option.name) ?? -1;
                      const isExtra = isSelected && selectionIndex >= group.includedItems;

                      return (
                        <OptionCheckbox
                          key={idx}
                          option={option.name}
                          isSelected={isSelected}
                          isExtra={isExtra}
                          extraPrice={group.pricePerExtra}
                          onToggle={() => handleOptionToggle(group.id, option.name)}
                        />
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}

            {/* Ingredientes Básicos */}
            {ingredients.length > 0 && (
              <motion.div layout className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Ingredientes Base</h3>
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
          <div className="flex-shrink-0 mt-auto p-4 pt-2 pb-6 bg-white shadow-lg rounded-b-2xl md:rounded-b-2xl">
            {/* Resumen de Selección */}
            {(customizedIngredients.length > 0 || Object.keys(selectedOptions).some(key => selectedOptions[key].length > 0)) && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-600 mb-2">Tu selección:</h4>
                <div className="flex flex-wrap gap-2">
                  <AnimatePresence>
                    {customizedIngredients.map(ing => (
                      <motion.span
                        key={`ing-${ing.name}`}
                        layout
                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="text-sm bg-green-100 text-green-800 font-medium px-3 py-1 rounded-full border border-green-200"
                      >
                        {ing.name}
                      </motion.span>
                    ))}
                    {Object.entries(selectedOptions).map(([groupId, options]: [string, string[]]) =>
                      options.map(optionName => (
                        <motion.span
                          key={`opt-${groupId}-${optionName}`}
                          layout
                          initial={{ opacity: 0, y: 10, scale: 0.8 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.8 }}
                          transition={{ duration: 0.2 }}
                          className="text-sm bg-orange-100 text-orange-800 font-medium px-3 py-1 rounded-full border border-orange-200"
                        >
                          {optionName}
                        </motion.span>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Desglose de Precio */}
            {extrasPrice > 0 && (
              <div className="mb-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">Precio base:</span>
                  <span className="font-medium">${item.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-orange-700 font-medium">Extras:</span>
                  <span className="font-semibold text-orange-700">+${extrasPrice.toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-gray-600">Cantidad</p>
              <div className="flex items-center rounded-full border border-gray-300 bg-white">
                <motion.button
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="w-10 h-10 rounded-l-full text-gray-700 flex items-center justify-center border-r border-gray-300"
                  whileTap={{ scale: 0.9 }}
                >
                  <MinusIcon className="w-6 h-6" />
                </motion.button>
                <span className="text-xl font-bold w-12 text-center text-gray-800">{quantity}</span>
                <motion.button
                  onClick={() => setQuantity(prev => prev + 1)}
                  className="w-10 h-10 rounded-r-full text-gray-700 flex items-center justify-center border-l border-gray-300"
                  whileTap={{ scale: 0.9 }}
                >
                  <PlusIcon className="w-6 h-6" />
                </motion.button>
              </div>
            </div>

            <motion.button
              key={total}
              initial={{ scale: 0.98, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              onClick={handleAddToCartClick}
              className="w-full bg-orange-500 text-white py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-orange-600 hover:shadow-xl transition-all duration-200"
              whileTap={{ scale: 0.95 }}
            >
              <CartIcon className="w-6 h-6" />
              <span>Añadir por ${displayedTotal.toFixed(2)}</span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

