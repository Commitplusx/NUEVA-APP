import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { CartIcon, MenuIcon, ChevronLeftIcon } from './icons';
import { Avatar } from './Avatar';

const getTitleForPath = (path: string): string => {
  if (path.startsWith('/restaurants/')) return 'Detalles del Restaurante';

  switch (path) {
    case '/restaurants': return 'Restaurantes';
    case '/cart': return 'Mi Carrito';
    case '/profile': return 'Mi Perfil';
    case '/request': return 'Solicitar Servicio';
    case '/admin': return 'Dashboard de Admin';
    default: return 'Delivery App';
  }
};

export const MainHeader: React.FC = () => {
  const { toggleSidebar, user, cartItemCount, profile } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  const title = getTitleForPath(location.pathname);
  const canGoBack = location.pathname !== '/restaurants' && location.pathname !== '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`sticky top-0 z-40 transition-all duration-300 ease-in-out ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-lg shadow-lg'
          : 'bg-white/0 backdrop-blur-none shadow-none'
      }`}
    >
      <div
        className={`flex justify-between items-center transition-all duration-300 ease-in-out max-w-screen-xl mx-auto ${
          isScrolled ? 'px-4 py-2' : 'px-4 py-4'
        }`}
      >
        <div className="flex items-center gap-2">
          {canGoBack ? (
            <button onClick={() => navigate(-1)} className="p-2 text-gray-700 hover:bg-gray-200/80 rounded-full transition-colors">
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
          ) : (
            <button onClick={toggleSidebar} className="p-2 text-gray-700 hover:bg-gray-200/80 rounded-full transition-colors">
              <MenuIcon className="w-6 h-6" />
            </button>
          )}
          <h1 className="text-xl font-bold text-gray-800 truncate">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          {user ? (
            <>
              <button onClick={() => navigate('/cart')} className="relative p-2 text-gray-700 hover:bg-gray-200/80 rounded-full transition-colors">
                <CartIcon className="w-6 h-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                    {cartItemCount}
                  </span>
                )}
              </button>
              <button onClick={() => navigate('/profile')} className="rounded-full transition-transform duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                <Avatar url={profile?.avatar || null} size={32} onUpload={() => {}} loading={false} />
              </button>
            </>
          ) : (
            <button 
              onClick={() => navigate('/login')} 
              className="px-4 py-2 text-sm font-semibold text-orange-500 bg-white/80 border border-orange-500 rounded-full hover:bg-orange-50 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              Iniciar Sesión
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
