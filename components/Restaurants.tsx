import React, { useState } from 'react';
import { Restaurant } from '../App';
import { MenuIcon, ChevronDownIcon, UserCircleIcon, SearchIcon, StarIcon, ClockIcon, SaltIcon, ChickenIcon, OnionIcon, GarlicIcon, PeppersIcon, GingerIcon, BroccoliIcon } from './icons';

const restaurants: Restaurant[] = [
  {
    id: 1,
    name: 'Rose Garden Restaurant',
    category: 'Burger - Chiken - Riche - Wings',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop',
    rating: 4.7,
    deliveryFee: 'Free',
    deliveryTime: '20 min',
    menu: [
      { 
        id: 101, 
        name: 'Pizza Margherita', 
        description: 'Salsa de tomate, mozzarella fresca, albahaca y un toque de aceite de oliva.', 
        price: 150, 
        imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=2069&auto=format&fit=crop',
        rating: 4.8,
        reviews: 120,
        ingredients: [
          { name: 'Tomate', icon: PeppersIcon },
          { name: 'Queso', icon: SaltIcon },
          { name: 'Albahaca', icon: BroccoliIcon },
        ]
      },
      { 
        id: 102, 
        name: 'Chicken Thai Biriyani', 
        description: 'Un exquisito plato de arroz con pollo marinado en especias tailandesas y un toque picante.', 
        price: 260, 
        imageUrl: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8da7?q=80&w=1974&auto=format&fit=crop',
        rating: 4.9,
        reviews: 215,
        isPopular: true,
        ingredients: [
          { name: 'Pollo', icon: ChickenIcon },
          { name: 'Arroz', icon: SaltIcon },
          { name: 'Cebolla', icon: OnionIcon },
          { name: 'Ajo', icon: GarlicIcon },
          { name: 'Jengibre', icon: GingerIcon },
          { name: 'Chile', icon: PeppersIcon },
        ]
      },
    ],
  },
  {
    id: 4,
    name: 'Burger Joint',
    category: 'Burger - Americana',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1998&auto=format&fit=crop',
    rating: 4.8,
    deliveryFee: '$20',
    deliveryTime: '25 min',
    menu: [
        { 
          id: 401, 
          name: 'Classic Cheeseburger', 
          description: 'Carne de res premium, queso americano derretido, lechuga fresca y tomate jugoso.', 
          price: 190, 
          imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1965&auto=format&fit=crop',
          rating: 4.7,
          reviews: 350,
          isPopular: true,
          ingredients: [
            { name: 'Carne', icon: ChickenIcon },
            { name: 'Queso', icon: SaltIcon },
            { name: 'Cebolla', icon: OnionIcon },
            { name: 'Lechuga', icon: BroccoliIcon },
          ]
        },
        { 
          id: 402, 
          name: 'Bacon Burger', 
          description: 'Nuestra clásica hamburguesa con queso, elevada con tiras de tocino crujiente.', 
          price: 220, 
          imageUrl: 'https://images.unsplash.com/photo-1606132923582-e006274b3573?q=80&w=1974&auto=format&fit=crop',
          rating: 4.8,
          reviews: 280,
           ingredients: [
            { name: 'Carne', icon: ChickenIcon },
            { name: 'Queso', icon: SaltIcon },
            { name: 'Tocino', icon: PeppersIcon },
            { name: 'Cebolla', icon: OnionIcon },
          ]
        },
        { 
          id: 403, 
          name: 'Papas Fritas', 
          description: 'Papas a la francesa doradas a la perfección, crujientes por fuera y suaves por dentro.', 
          price: 60, 
          imageUrl: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?q=80&w=2070&auto=format&fit=crop',
          rating: 4.5,
          reviews: 500,
          ingredients: [
            { name: 'Papa', icon: BroccoliIcon },
            { name: 'Sal', icon: SaltIcon },
          ]
        },
      ],
  },
];

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
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRestaurants = restaurants.filter(restaurant => {
    const categoryMatch = selectedCategory === 'All' || restaurant.category.toLowerCase().includes(selectedCategory.toLowerCase());
    
    const searchMatch = searchQuery.trim() === '' || 
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.menu.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return categoryMatch && searchMatch;
  });

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
          <div className="relative">
              <input 
                type="text" 
                placeholder="Buscar platillos, restaurantes..." 
                className="w-full py-3 pl-10 pr-4 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                onClick={() => setSelectedCategory(cat.name)}
              />
            ))}
        </div>
      </div>

      <section className="px-4">
        <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold text-gray-800">
              {searchQuery ? `Resultados para "${searchQuery}"` : 'Restaurantes Abiertos'}
            </h2>
        </div>
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
      </section>
    </div>
  );
};