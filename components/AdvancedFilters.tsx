import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon } from './icons';
import { useCategories } from '../hooks/useCategories';
import { Category } from '../types';

export interface Filters {
  sortBy: string;
  categories: string[];
  priceRange: number[];
  openNow: boolean;
}

interface AdvancedFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: Filters) => void;
  initialFilters: Filters;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ isOpen, onClose, onApply, initialFilters }) => {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const { categories: availableCategories, loading: categoriesLoading } = useCategories();

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const handleSortChange = (sortBy: string) => {
    setFilters(prev => ({ ...prev, sortBy }));
  };

  const handleCategoryToggle = (categoryName: string) => {
    setFilters(prev => {
      const newCategories = prev.categories.includes(categoryName)
        ? prev.categories.filter(c => c !== categoryName)
        : [...prev.categories, categoryName];
      return { ...prev, categories: newCategories };
    });
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleClear = () => {
    const clearedFilters = {
      sortBy: 'rating',
      categories: [],
      priceRange: [],
      openNow: false,
    };
    setFilters(clearedFilters);
    onApply(clearedFilters); // Apply cleared filters immediately or wait for explicit apply? Applying for now.
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-end"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            className="bg-white rounded-t-2xl shadow-xl w-full max-w-lg h-[90vh] max-h-[600px] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Filtros y Ordenación</h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                  <XIcon className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-8">
              {/* Sort Options */}
              <div>
                <h3 className="font-semibold text-lg mb-4 text-gray-700">Ordenar por</h3>
                <div className="space-y-3">
                  {['rating', 'delivery_time', 'delivery_fee'].map(option => (
                    <button key={option} onClick={() => handleSortChange(option)} className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${filters.sortBy === option ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white'}`}>
                      <span className={`font-medium ${filters.sortBy === option ? 'text-orange-600' : 'text-gray-800'}`}>
                        {option === 'rating' && 'Mejor Valoración'}
                        {option === 'delivery_time' && 'Tiempo de Entrega'}
                        {option === 'delivery_fee' && 'Costo de Envío'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <h3 className="font-semibold text-lg mb-4 text-gray-700">Categorías</h3>
                <div className="flex flex-wrap gap-3">
                  {categoriesLoading ? <p>Cargando...</p> : availableCategories.map(cat => (
                    <button key={cat.id} onClick={() => handleCategoryToggle(cat.name)} className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${filters.categories.includes(cat.name) ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}>
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 mt-auto border-t border-gray-200 flex gap-4">
              <button
                onClick={handleClear}
                className="flex-1 py-3 px-6 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Limpiar
              </button>
              <button
                onClick={handleApply}
                className="flex-1 py-3 px-6 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30"
              >
                Aplicar Filtros
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdvancedFilters;
