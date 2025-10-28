import React, { useState, useMemo } from 'react';
import { Restaurant } from '../types';
import { useRestaurants } from '../hooks/useRestaurants';
import { MenuIcon, ChevronDownIcon, UserCircleIcon, SearchIcon, StarIcon, ClockIcon, AlertTriangleIcon } from './icons';
import { Spinner } from './Spinner';

const categories = [
    { name: 'All', icon: '🔥' },
    { name: 'Pizza', icon: '🍕' },
    { name: 'Burger', icon: '🍔' },
    { name: 'Sushi', icon: '🍣' },
    { name: 'Wings', icon: '🍗' },
    { name: 'Tacos', icon: '🌮' },
];

const CategoryChip: React.FC<{name: string, icon: string, isSelected?: boolean, onClick: () => void}> = ({name, icon, isSelected, onClick}) => (
    <div onClick={onClick} className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all duration-300 ${isSelected ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 shadow-sm border border-gray-200'}`}>
        <span>{icon}</span>
        <span className="font-semibold text-sm">{name}</span>
    </div>
);

const RestaurantCard: React.FC<{ restaurant: Restaurant; onSelect: () => void; }> = ({ restaurant, onSelect }) => (
  <button onClick={onSelect} className="w-full text-left bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300 ease-in-out">
    <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-40 object-cover" />
    <div className="p-4">
      <h3 className="font-bold text-lg text-gray-900">{restaurant.name}</h3>
      <p className="text-sm text-gray-500 mb-2">{restaurant.category}</p>
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
  </button>
);

interface RestaurantsProps {
  onSelectRestaurant: (restaurant: Restaurant) => void;
}

export const Restaurants: React.FC<RestaurantsProps> = ({ onSelectRestaurant }) => {
  const { restaurants, loading, error } = useRestaurants();
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
      const categoryMatch = selectedCategory === 'All' || restaurant.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const searchMatch = searchQuery.trim() === '' || 
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (restaurant.menu && restaurant.menu.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())));
      return categoryMatch && searchMatch;
    });
  }, [restaurants, selectedCategory, searchQuery]);

  return (
    <div>
      <header className="p-4">
        <div className="flex justify-between items-center mb-4">
          <button className="p-2 rounded-full bg-white shadow-sm border border-gray-200"><MenuIcon className="w-6 h-6 text-gray-800"/></button>
          <div>
            <span className="text-xs text-gray-500">DELIVER TO</span>
            <div className="flex items-center gap-1 font-bold text-orange-500">
              <span>Halal Lab office</span>
              <ChevronDownIcon className="w-4 h-4"/>
            </div>
          </div>
          <div className="relative">
            <UserCircleIcon className="w-10 h-10 text-gray-300"/>
            <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-orange-500 border-2 border-white"></span>
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-gray-800">Hey Halal, <span className="font-bold">Good Afternoon!</span></h1>
      </header>

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
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-4">
            {categories.map((cat) => (
              <CategoryChip 
                key={cat.name} 
                name={cat.name} 
                icon={cat.icon} 
                isSelected={selectedCategory === cat.name}
                onClick={() => handleCategoryClick(cat.name)}
              />
            ))}
        </div>
      </div>

      <section className="px-4">
        <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold text-gray-800">
              Restaurantes Abiertos
            </h2>
        </div>
        
        {loading ? (
          <Spinner />
        ) : error ? (
          <div className="text-center text-red-500 col-span-1 py-10 bg-red-50 rounded-lg">
            <AlertTriangleIcon className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <h3 className="text-lg font-semibold mb-2">Error al Cargar</h3>
            <p className="text-sm">{error}</p>
            <p className="text-xs mt-4">Inténtalo de nuevo más tarde o contacta a soporte.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
              {filteredRestaurants.length > 0 ? (
                  filteredRestaurants.map((restaurant) => (
                      <RestaurantCard
                          key={restaurant.id}
                          restaurant={restaurant}
                          onSelect={() => onSelectRestaurant(restaurant)}
                      />
                  ))
              ) : (
                  <p className="text-center text-gray-500 col-span-1 py-10">
                      No se encontraron resultados. Intenta con otra búsqueda.
                  </p>
              )}
          </div>
        )}
      </section>
    </div>
  );
};