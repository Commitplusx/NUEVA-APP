
import React from 'react';
import { MenuIcon } from './icons';
import { useAppContext } from '../context/AppContext';

const Header: React.FC = () => {
  const { toggleSidebar } = useAppContext();
  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-sm">
      <button onClick={toggleSidebar} className="p-2">
        <MenuIcon className="w-6 h-6 text-gray-800" />
      </button>
      <div className="font-bold text-lg text-orange-500">Delivery</div>
      <div className="w-8"></div>
    </header>
  );
};

export { Header };
