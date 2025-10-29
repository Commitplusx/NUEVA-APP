import React from 'react';
import { CheckCircleIcon, XCircleIcon } from './icons';

export type ToastType = 'success' | 'error';

interface ToastProps {
  message: string | null;
  type: ToastType;
}

export const Toast: React.FC<ToastProps> = ({ message, type }) => {
  if (!message) {
    return null;
  }

  const toastStyles = {
    success: {
      bg: 'bg-green-500',
      icon: <CheckCircleIcon className="w-6 h-6 text-white" />,
    },
    error: {
      bg: 'bg-red-500',
      icon: <XCircleIcon className="w-6 h-6 text-white" />,
    },
  };

  const selectedStyle = toastStyles[type];

  return (
    <div className="absolute top-5 left-1/2 -translate-x-1/2 w-auto animate-fade-in-down">
      <div className={`${selectedStyle.bg} text-white font-semibold py-3 px-6 rounded-full shadow-lg flex items-center space-x-2`}>
        {selectedStyle.icon}
        <span>{message}</span>
      </div>
    </div>
  );
};