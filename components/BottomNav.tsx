import React from 'react';
import { HomeIcon, CartIcon, RestaurantIcon, WrenchIcon, UserCircleIcon } from './icons';
import { Page, UserRole } from '../types';

interface BottomNavProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  cartItemCount: number;
  userRole: UserRole;
  handleLogout: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentPage, setCurrentPage, cartItemCount, userRole, handleLogout }) => {
  const navItems = [
    { page: 'home' as Page, icon: HomeIcon, label: 'Home' },
    { page: 'restaurants' as Page, icon: RestaurantIcon, label: 'Restaurants' },
    { page: 'cart' as Page, icon: CartIcon, label: 'Cart' },
    { page: 'request' as Page, icon: WrenchIcon, label: 'Request Service' },
  ];

  if (userRole === 'admin') {
    navItems.push({ page: 'admin' as Page, icon: UserCircleIcon, label: 'Admin' });
  }

  const handleNavClick = (page: Page) => {
    setCurrentPage(page);
  };

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-9/12 md:max-w-sm bg-white/80 backdrop-blur-lg rounded-full shadow-lg border border-gray-200/50 overflow-hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isSelected = currentPage === item.page;
          return (
            <button
              key={item.page}
              onClick={() => handleNavClick(item.page)}
              className="flex items-center justify-center w-1/4 h-full transition-all duration-300 ease-in-out"
              aria-current={isSelected ? 'page' : undefined}
              aria-label={`Navigate to ${item.label}`}
            >
              <div className={`relative p-2 rounded-full transition-all duration-300 ${isSelected ? 'bg-orange-100' : 'bg-transparent'}`}>
                <item.icon className={`w-7 h-7 transition-all duration-300 ${isSelected ? 'text-orange-500 scale-110' : 'text-gray-400'}`} />
                {item.page === 'cart' && cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                    {cartItemCount}
                  </span>
                )}
              </div>
            </button>
          );
        })}
        {userRole !== 'guest' && (
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-1/4 h-full transition-all duration-300 ease-in-out"
              aria-label={`Logout`}
            >
              <div className={`relative p-2 rounded-full transition-all duration-300`}>
                <UserCircleIcon className={`w-7 h-7 transition-all duration-300 text-gray-400`} />
              </div>
            </button>
        )}
      </div>
    </nav>
  );
};
