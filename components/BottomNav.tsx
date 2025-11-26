import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HomeIcon, HeartIcon, ShoppingBagIcon, UtensilsIcon, UserIcon } from './icons';
import { useAppContext } from '../context/AppContext';

export const BottomNav: React.FC = () => {
  const { cartItemCount, isBottomNavVisible } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isBottomNavVisible) {
    return null;
  }

  const navItems = [
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

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="fixed bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 z-50 w-[90%] md:w-auto max-w-md">
      <div className="bg-white/90 backdrop-blur-xl px-6 md:px-8 py-4 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/50 flex items-center justify-between md:justify-center md:gap-10">
        {navItems.map((item, index) => {
          const active = item.isActive(location.pathname);

          return (
            <div key={index} className="relative group cursor-pointer" onClick={() => handleNavigation(item.path)}>
              {item.isFab ? (
                <div className="relative -top-10 transform transition-transform duration-300 hover:-translate-y-2">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-[#2d0c5e] rounded-full flex items-center justify-center shadow-xl shadow-purple-900/40 border-4 border-gray-50">
                    <item.icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                    {cartItemCount > 0 && (
                      <div className="absolute top-0 right-0 w-4 h-4 md:w-5 md:h-5 bg-red-500 rounded-full border-2 border-[#2d0c5e] flex items-center justify-center">
                        <span className="text-[9px] md:text-[10px] font-bold text-white">{cartItemCount}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 transition-colors duration-300 hover:text-purple-600 text-gray-400">
                  <item.icon className={`w-6 h-6 md:w-7 md:h-7 ${active ? 'text-purple-600' : 'text-gray-400 group-hover:text-purple-400'}`} />
                  {active && <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-purple-600 rounded-full absolute -bottom-2 md:-bottom-3" />}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};