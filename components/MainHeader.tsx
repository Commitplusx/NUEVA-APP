import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { CartIcon, MenuIcon, UserCircleIcon } from './icons';

export const MainHeader: React.FC = () => {
  const { toggleSidebar, user, cartItemCount } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const handleCartClick = () => {
    navigate('/cart');
  };

  return (
    <div className="bg-orange-500 p-4 shadow-lg sticky top-0 z-10">
      <div className="flex justify-between items-center">
        {location.pathname !== '/' ? (
          <button 
            onClick={toggleSidebar} 
            className="p-2"
          >
            <MenuIcon className="w-6 h-6 text-white" />
          </button>
        ) : (
          <div className="w-10 h-10" />
        )}
        
        <h1 className="text-xl font-bold text-white">Delivery</h1>

        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-white font-semibold hidden sm:block">{user.split('@')[0]}</span>
              <button onClick={handleCartClick} className="relative p-2">
                <CartIcon className="w-7 h-7 text-white" />
                {cartItemCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          ) : (
            <button 
              onClick={() => navigate('/login')} 
              className="p-2"
            >
              <UserCircleIcon className="w-8 h-8 text-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
