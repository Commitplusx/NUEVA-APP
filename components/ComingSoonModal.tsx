import React from 'react';
// Removed: import { motion, AnimatePresence } from 'framer-motion';
import { WrenchIcon, XCircleIcon } from './icons';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export const ComingSoonModal: React.FC<ComingSoonModalProps> = ({ isOpen, onClose, title, message }) => {
  if (!isOpen) return null; // Re-add this for simple conditional rendering

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <XCircleIcon className="w-7 h-7" />
        </button>
        <div className="p-6 bg-orange-100 rounded-full mx-auto w-fit mb-6">
          <WrenchIcon className="w-16 h-16 text-orange-500" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mt-4">¡Próximamente!</h2>
        <p className="text-xl font-semibold text-gray-700 mt-2">{title || "Esta opción estará disponible pronto."}</p>
        <p className="mt-4 text-gray-600">
          {message || "Estamos trabajando duro para traerte esta funcionalidad. ¡Vuelve pronto para descubrirla!"}
        </p>
        <button
          onClick={onClose}
          className="mt-8 w-full py-3 bg-orange-500 text-white font-bold rounded-lg shadow-lg hover:bg-orange-600 transition-all duration-300"
        >
          Entendido
        </button>
      </div>
    </div>
  );
};