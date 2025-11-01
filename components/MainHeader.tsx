import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { MenuIcon, UserCircleIcon } from './icons';

export const MainHeader: React.FC = () => {
  const { toggleSidebar, user } = useAppContext();
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-orange-500 to-red-600 p-4 shadow-lg sticky top-0 z-10">
      <div className="flex justify-between items-center">
        <button 
          onClick={toggleSidebar} 
          className="p-2"
        >
          <MenuIcon className="w-6 h-6 text-white" />
        </button>
        
        <h1 className="text-xl font-bold text-white">Delivery</h1>

        {/* Conditionally render the login button */}
        {!user ? (
          <button 
            onClick={() => navigate('/login')} 
            className="p-2"
          >
            <UserCircleIcon className="w-8 h-8 text-white" />
          </button>
        ) : (
          // Placeholder to keep the title centered
          <div className="w-12 h-12" />
        )}
      </div>
    </div>
  );
};
