import React from 'react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) {
    return null;
  }

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-auto animate-fade-in">
      <div className="bg-gray-800 text-white font-semibold py-3 px-6 rounded-full shadow-lg">
        {message}
      </div>
    </div>
  );
};