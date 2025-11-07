
import React from 'react';
import { MenuIcon, CartIcon, UserCircleIcon } from './icons';
import { useAppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const { toggleSidebar, user, cartItemCount, isCartAnimating } = useAppContext();

  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-sm">
      <button onClick={toggleSidebar} className="p-2">
        <MenuIcon className="w-6 h-6 text-gray-800" />
      </button>
      <div className="font-bold text-lg text-orange-500">
        <Link to="/">Delivery</Link>
      </div>
      <div className="flex items-center">
        {user ? (
          <div className="flex items-center">
            <Link to="/profile" className="flex items-center mr-4">
              <UserCircleIcon className="w-6 h-6 text-gray-600 mr-2" />
              <span className="text-gray-800">{user}</span>
            </Link>
          </div>
        ) : (
          <Link to="/login" className="text-gray-800 mr-4">Login</Link>
        )}
        <Link to="/cart" className="relative">
          <CartIcon className={`w-6 h-6 text-gray-600 ${isCartAnimating ? 'animate-bounce' : ''}`} />
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {cartItemCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
};

export { Header };
