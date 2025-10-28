import React from 'react';
import { WrenchIcon } from './icons';

export const ComingSoon: React.FC<{title: string}> = ({title}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 text-gray-600">
      <div className="p-6 bg-orange-100 rounded-full">
        <WrenchIcon className="w-16 h-16 text-orange-500" />
      </div>
      <h1 className="text-3xl font-bold text-gray-800 mt-6">¡Próximamente!</h1>
      <h2 className="text-xl font-semibold text-gray-700 mt-2">{title}</h2>
      <p className="mt-4 max-w-sm">
        Estamos trabajando duro para traerte una nueva experiencia increíble. ¡Estamos construyendo algo chido para ti! Vuelve pronto.
      </p>
    </div>
  );
};
