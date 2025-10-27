
import React from 'react';
import { SearchIcon, UserIcon } from './icons';

interface InputWithIconProps {
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSearch?: boolean;
}

export const InputWithIcon: React.FC<InputWithIconProps> = ({ placeholder, value, onChange, isSearch = false }) => {
  return (
    <div className="relative flex items-center">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full py-3 pl-4 pr-10 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
      />
      <div className="absolute right-3 text-gray-500">
        {isSearch ? <SearchIcon className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
      </div>
    </div>
  );
};
