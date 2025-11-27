import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HomeIcon, HeartIcon, ShoppingBagIcon, UtensilsIcon, UserIcon, StoreIcon, GridIcon, TicketIcon } from './icons';
import { useAppContext } from '../context/AppContext';
import { motion } from 'framer-motion';

export const BottomNav: React.FC = () => {
  const { cartItemCount, isBottomNavVisible, userRole } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isBottomNavVisible) {
    return null;
  }

  const userNavItems = [
    {
      icon: HomeIcon,
      label: 'Inicio',
      path: '/restaurants',
      isActive: (path: string) => path === '/' || path === '/restaurants'
    },
    {
      icon: HeartIcon,
      label: 'Favoritos',
      path: '/favorites',
      isActive: (path: string) => path === '/favorites'
    },
    {
      icon: ShoppingBagIcon,
      label: 'Carrito',
      path: '/cart',
      isFab: true,
      isActive: (path: string) => path === '/cart'
    },
    {
      icon: UtensilsIcon,
      label: 'Solicitar',
      path: '/request',
      isActive: (path: string) => path === '/request'
    },
    {
      icon: UserIcon,
      label: 'Perfil',
      path: '/profile',
      isActive: (path: string) => path === '/profile' || path === '/login'
    },
  ];

  const adminNavItems = [
    {
      icon: HomeIcon,
      label: 'Dashboard',
      path: '/admin',
      isActive: (path: string) => path === '/admin'
    },
    {
      icon: StoreIcon,
      label: 'Restaurantes',
      path: '/admin/restaurants',
      isActive: (path: string) => path === '/admin/restaurants'
    },
    {
      icon: GridIcon,
      label: 'Categorías',
      path: '/admin/categories',
      isActive: (path: string) => path === '/admin/categories'
    },
    {
      icon: TicketIcon,
      label: 'Tarifas',
      path: '/admin/tariffs',
      isActive: (path: string) => path === '/admin/tariffs'
    },
    {
      icon: UserIcon,
      label: 'Perfil',
      path: '/profile',
      isActive: (path: string) => path === '/profile'
    },
  ];

  const navItems = userRole === 'admin' ? adminNavItems : userNavItems;

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-[95%] max-w-md">
      <div className="bg-white/95 backdrop-blur-xl px-2 py-2 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 flex items-center justify-between relative">
        {navItems.map((item, index) => {
          const active = item.isActive(location.pathname);

          return (
            <div key={index} className="relative z-10 flex-1 flex justify-center">
              {item.isFab ? (
                <div
                  className="relative -top-8 cursor-pointer group"
                  onClick={() => handleNavigation(item.path)}
                >
                  <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/40 border-[4px] border-gray-50 transform transition-transform duration-300 group-hover:scale-110 group-active:scale-95">
                    <item.icon className="w-6 h-6 text-white" />
                    {cartItemCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white">{cartItemCount}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`relative flex flex-col items-center justify-center w-full py-2 rounded-[1.5rem] transition-all duration-300 ${active ? 'text-purple-700' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-purple-100 rounded-[1.5rem] -z-10"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon className={`w-6 h-6 mb-0.5 ${active ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                  <span className={`text-[10px] font-bold ${active ? 'opacity-100' : 'opacity-0 hidden'} transition-opacity duration-200`}>
                    {item.label}
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};