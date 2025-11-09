import React from 'react';
import { motion } from 'framer-motion';
import { useCategories } from '../hooks/useCategories';
import { Category } from '../types';
import { getTransformedImageUrl } from '../services/image';

const CategoryCard: React.FC<{ category: Category; isSelected: boolean; onSelect: () => void; }> = ({ category, isSelected, onSelect }) => {
  const optimizedImageUrl = getTransformedImageUrl(category.imageUrl || '', 100, 100);

  return (
    <motion.button
      onClick={onSelect}
      className={`flex flex-col items-center justify-center w-24 text-center transition-all duration-300 ease-in-out ${isSelected ? 'text-orange-500' : 'text-gray-600'}`}
      whileHover={{ scale: 1.05 }}
    >
      <div className={`relative w-20 h-20 rounded-full overflow-hidden mb-2 border-4 ${isSelected ? 'border-orange-500' : 'border-transparent'}`}>
        {optimizedImageUrl ? (
          <img src={optimizedImageUrl} alt={category.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
            ?
          </div>
        )}
      </div>
      <span className="font-semibold text-sm">{category.name}</span>
      {category.starting_price !== undefined && category.starting_price > 0 && (
        <span className="text-xs text-gray-500">
          Starting ${category.starting_price.toFixed(2)}
        </span>
      )}
    </motion.button>
  );
};

const CategorySkeleton: React.FC = () => (
  <div className="flex flex-col items-center w-24 animate-pulse">
    <div className="w-20 h-20 bg-gray-200 rounded-full mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-16"></div>
  </div>
);

export const Categories: React.FC<{
  selectedCategories: number[];
  onCategorySelect: (categoryId: number) => void;
}> = ({ selectedCategories, onCategorySelect }) => {
  const { categories, loading, error } = useCategories();

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 px-4">
        {[...Array(5)].map((_, i) => <CategorySkeleton key={i} />)}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 px-4">{error}</div>;
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 px-4">
      {categories.map(category => (
        <CategoryCard
          key={category.id}
          category={category}
          isSelected={selectedCategories.includes(category.id)}
          onSelect={() => onCategorySelect(category.id)}
        />
      ))}
    </div>
  );
};
