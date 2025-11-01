import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Restaurant } from '../types';
import { useRestaurants } from '../hooks/useRestaurants';
import { useCategories } from '../hooks/useCategories';
import { SearchIcon, StarIcon, ClockIcon, AlertTriangleIcon, PizzaIcon, BurgerIcon, TacoIcon, FoodIcon } from './icons';
import { RestaurantCardSkeleton } from './RestaurantCardSkeleton';

const iconMap: { [key: string]: React.ReactElement } = {
  default: <FoodIcon className="w-5 h-5" />,
  pizza: <PizzaIcon className="w-5 h-5" />,
  burger: <BurgerIcon className="w-5 h-5" />,
  tacos: <TacoIcon className="w-5 h-5" />,
  all: <FoodIcon className="w-5 h-5" />,
};

const getCategoryIcon = (categoryName: string) => {
  const lowerCaseName = categoryName.toLowerCase();
  for (const key in iconMap) {
    if (lowerCaseName.includes(key)) {
      return iconMap[key];
    }
  }
  return iconMap.default;
};

const CategoryChip: React.FC<{name: string, icon: React.ReactNode, isSelected?: boolean, onClick: () => void}> = ({name, icon, isSelected, onClick}) => (
    <div onClick={onClick} className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-full cursor-pointer transition-all duration-300 scroll-snap-align-start ${isSelected ? 'bg-orange-500 text-white shadow-lg' : 'bg-white text-gray-700 shadow-sm border border-gray-200 hover:shadow-md'}`}>
        {icon}
        <span className="font-semibold text-sm">{name}</span>
    </div>
);

const RestaurantCard: React.FC<{ restaurant: Restaurant; onSelect: () => void; }> = ({ restaurant, onSelect }) => (
  <motion.button 
    onClick={onSelect} 
    className="w-full text-left bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300 ease-in-out"
    whileHover={{ scale: 1.03, y: -5 }}
    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
  >
    <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-40 object-cover" />
    <div className="p-4">
      <h3 className="font-bold text-lg text-gray-900">{restaurant.name}</h3>
      <p className="text-sm text-gray-500 mb-2">{restaurant.categories?.map(c => c.name).join(' - ')}</p>
      <div className="flex items-center gap-4 text-sm text-gray-700">
        <div className="flex items-center gap-1">
          <StarIcon className="w-4 h-4 text-yellow-500" />
          <span className="font-bold">{restaurant.rating}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-bold text-green-600">{restaurant.deliveryFee}</span>
        </div>
        <div className="flex items-center gap-1">
          <ClockIcon className="w-4 h-4 text-gray-500" />
          <span className="font-semibold">{restaurant.deliveryTime}</span>
        </div>
      </div>
    </div>
  </motion.button>
);

const RestaurantList: React.FC<{
  loading: boolean;
  error: string | null;
  restaurants: Restaurant[];
}> = ({ loading, error, restaurants }) => {
  const navigate = useNavigate();

  if (error) {
    return (
      <div className="text-center text-red-500 col-span-1 py-10 bg-red-50 rounded-lg">
        <AlertTriangleIcon className="w-12 h-12 mx-auto mb-4 text-red-400" />
        <h3 className="text-lg font-semibold mb-2">Error al Cargar</h3>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6">
        {[...Array(3)].map((_, i) => <RestaurantCardSkeleton key={i} />)}
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="text-center text-gray-500 p-4 mt-4 bg-gray-100 rounded-lg">
        <p>No se encontraron restaurantes con esos criterios.</p>
        <p className="text-sm mt-2">Intenta con otra búsqueda o categoría.</p>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      className="grid grid-cols-1 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {restaurants.map((restaurant) => (
        <motion.div key={restaurant.id} variants={itemVariants}>
          <RestaurantCard
            restaurant={restaurant}
            onSelect={() => navigate(`/restaurants/${restaurant.id}`)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export const Restaurants: React.FC = () => {
  const { restaurants, loading: restaurantsLoading, error: restaurantsError } = useRestaurants();
  const { categories, loading: categoriesLoading } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredRestaurants = useMemo(() => {
    if (!restaurants) return [];
    return restaurants.filter(restaurant => {
      const categoryMatch = selectedCategory === 'All' || restaurant.categories?.some(c => c.name === selectedCategory);
      const searchMatch = searchQuery.trim() === '' || 
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (restaurant.menu && restaurant.menu.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())));
      return categoryMatch && searchMatch;
    });
  }, [restaurants, selectedCategory, searchQuery]);

  const allCategories = [{ name: 'All', icon: 'All' }, ...categories.filter(c => c.name !== 'All')];

  return (
    <div className="p-4">
      <div className="px-4 mb-4">
          <div className="relative flex items-center">
              <input 
                type="text" 
                placeholder="Busca tu restaurante o platillo..." 
                className="w-full py-3 pl-10 pr-4 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <SearchIcon className="w-5 h-5"/>
              </div>
          </div>
      </div>

      <div className="mb-6">
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 scroll-snap-type-x-mandatory">
            {categoriesLoading ? (
              <p className="text-sm text-gray-400">Cargando categorías...</p>
            ) : (
              allCategories.map((cat) => (
                <CategoryChip 
                  key={cat.name} 
                  name={cat.name === 'All' ? 'Todos' : cat.name} 
                  icon={getCategoryIcon(cat.name)}
                  isSelected={selectedCategory === cat.name}
                  onClick={() => handleCategoryClick(cat.name)}
                />
              ))
            )}
        </div>
      </div>

      <section className="px-4">
        <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold text-gray-800">
              Restaurantes Abiertos
            </h2>
        </div>
        
        <RestaurantList
          loading={restaurantsLoading}
          error={restaurantsError}
          restaurants={filteredRestaurants}
        />
      </section>
    </div>
  );
};
