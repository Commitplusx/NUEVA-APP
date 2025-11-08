import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { CartIcon, MenuIcon, UserCircleIcon, ChevronLeftIcon } from './icons';

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
  const { toggleSidebar, user, cartItemCount } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const title = getTitleForPath(location.pathname);
  const canGoBack = location.pathname !== '/restaurants' && location.pathname !== '/';

  return (
    <div className="bg-white p-4 shadow-sm sticky top-0 z-40">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {canGoBack ? (
            <button onClick={() => navigate(-1)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
          ) : (
            <button onClick={toggleSidebar} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
              <MenuIcon className="w-6 h-6" />
            </button>
          )}
          <h1 className="text-xl font-bold text-gray-800">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/cart')} className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                <CartIcon className="w-6 h-6" />
                {cartItemCount > 0 && (
                  <span className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>
              <button onClick={() => navigate('/profile')} className="p-1 rounded-full hover:bg-gray-100">
                <UserCircleIcon className="w-8 h-8 text-gray-600" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => navigate('/login')} 
              className="px-4 py-2 text-sm font-semibold text-orange-500 border border-orange-500 rounded-full hover:bg-orange-50"
            >
              Iniciar Sesión
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
