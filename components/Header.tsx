
import React from 'react';
import { MenuIcon } from './icons';

export const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      <div className="flex items-center space-x-2">
        <svg
          className="w-8 h-8 text-red-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
        <span className="font-bold text-lg tracking-tighter">ESTRELLA</span>
      </div>
      <button className="text-gray-800">
        <MenuIcon className="w-7 h-7" />
      </button>
    </header>
  );
};
