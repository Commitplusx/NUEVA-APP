import React from 'react';
import { Restaurant, MenuItem } from '../App';
import { ChevronLeftIcon } from './icons';

interface RestaurantDetailProps {
  restaurant: Restaurant;
  onSelectItem: (item: MenuItem) => void;
  onBack: () => void;
}

const MenuItemCard: React.FC<{ item: MenuItem; onSelect: () => void }> = ({ item, onSelect }) => (
  <button onClick={onSelect} className="w-full flex items-center p-3 bg-white rounded-xl border border-gray-100 shadow-sm transition-transform transform hover:scale-[1.02] duration-300 text-left">
    {item.imageUrl && (
        <img src={item.imageUrl} alt={item.name} className="w-24 h-24 object-cover rounded-lg mr-4"/>
    )}
    <div className="flex-1 pr-2">
      <div className="flex items-center">
        {item.isPopular && <span className="text-xs font-bold text-orange-500 mr-2 bg-orange-100 px-2 py-0.5 rounded-full">🔥 Popular</span>}
      </div>
      <h3 className="font-bold text-gray-800 mt-1">{item.name}</h3>
      <p className="text-sm text-gray-500 my-1 line-clamp-2">{item.description}</p>
      <p className="font-bold text-lg text-orange-500">${item.price.toFixed(2)}</p>
    </div>
    <div className="text-orange-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
    </div>
  </button>
);


export const RestaurantDetail: React.FC<RestaurantDetailProps> = ({ restaurant, onSelectItem, onBack }) => {
  const popularItems = restaurant.menu.filter(item => item.isPopular);
  const otherItems = restaurant.menu.filter(item => !item.isPopular);

  return (
    <div className="pb-24 bg-gray-50">
      <div className="relative">
        <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-48 object-cover" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
            <h1 className="text-white text-3xl font-bold drop-shadow-lg">{restaurant.name}</h1>
            <p className="text-white font-semibold drop-shadow-md">{restaurant.category}</p>
        </div>
        <button onClick={onBack} className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md transition-transform hover:scale-110">
            <ChevronLeftIcon className="w-6 h-6 text-gray-800"/>
        </button>
      </div>
      
      <div className="p-4">
         {popularItems.length > 0 && (
           <div className="mb-8">
             <h2 className="text-2xl font-bold text-gray-800 mb-4">Los Más Populares</h2>
             <div className="space-y-4">
                {popularItems.map(item => (
                  <MenuItemCard key={item.id} item={item} onSelect={() => onSelectItem(item)} />
                ))}
             </div>
           </div>
         )}
         
         <h2 className="text-2xl font-bold text-gray-800 mb-4">Menú Completo</h2>
         <div className="space-y-4">
            {otherItems.map(item => (
              <MenuItemCard key={item.id} item={item} onSelect={() => onSelectItem(item)} />
            ))}
         </div>
      </div>
    </div>
  );
};