import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, InfoIcon } from './icons';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string | null;
  type: ToastType;
  onClose: () => void;
}

const toastVariants = {
  initial: { opacity: 0, y: 50, scale: 0.9, x: '-50%' },
  animate: { opacity: 1, y: 0, scale: 1, x: '-50%' },
  exit: { opacity: 0, y: 20, scale: 0.9, x: '-50%', transition: { ease: 'easeOut', duration: 0.3 } },
};

const toastStyles = {
  success: { bg: 'bg-green-500', border: 'border-green-600', icon: <CheckCircleIcon className="w-6 h-6 text-white" /> },
  error: { bg: 'bg-red-500', border: 'border-red-600', icon: <XCircleIcon className="w-6 h-6 text-white" /> },
  info: { bg: 'bg-blue-500', border: 'border-blue-600', icon: <InfoIcon className="w-6 h-6 text-white" /> },
};

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const selectedStyle = toastStyles[type];

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          variants={toastVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed bottom-24 left-1/2 w-auto z-[9999]"
          onHoverEnd={onClose}
        >
          <div className={`${selectedStyle.bg} text-white font-bold py-3 px-5 rounded-xl shadow-2xl flex items-center gap-3 relative overflow-hidden border-2 ${selectedStyle.border}`}>
            {selectedStyle.icon}
            <span className="pr-2">{message}</span>
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-white/30"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 3, ease: 'linear' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};