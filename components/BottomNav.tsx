import React from 'react';
import { HomeIcon, CartIcon, RestaurantIcon } from './icons';
import { Page } from '../App';

interface BottomNavProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  cartItemCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentPage, setCurrentPage, cartItemCount }) => {
  const navItems = [
    { page: 'home' as Page, icon: HomeIcon, label: 'Home' },
    { page: 'restaurants' as Page, icon: RestaurantIcon, label: 'Restaurants' },
    { page: 'cart' as Page, icon: CartIcon, label: 'Cart' },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full md:max-w-sm bg-white border-t border-gray-200">
      <div className="flex justify-around items-center h-20">
        {navItems.map((item) => {
          const isSelected = currentPage === item.page;
          return (
            <button
              key={item.page}
              onClick={() => setCurrentPage(item.page)}
              className="flex items-center justify-center w-1/3 h-full transition-colors duration-300"
              aria-current={isSelected ? 'page' : undefined}
              aria-label={`Navigate to ${item.label}`}
            >
              <div className="relative">
                <item.icon className={`w-8 h-8 transition-colors ${isSelected ? 'text-orange-500' : 'text-gray-400'}`} />
                {item.page === 'cart' && cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                    {cartItemCount}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
