import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import * as Icons from './icons';

// --- Reusable Components ---
const Header: React.FC<{ title: string; onBack: () => void; onAdd?: () => void; showAdd?: boolean }> = ({ title, onBack, onAdd, showAdd = false }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50">
    <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
      <Icons.ChevronLeftIcon className="w-7 h-7 text-gray-800" />
    </button>
    <h1 className="text-xl font-bold text-gray-900 absolute left-1/2 -translate-x-1/2">{title}</h1>
    {showAdd ? (
      <button onClick={onAdd} className="w-10 h-10 rounded-full bg-green-200 hover:bg-green-300 flex items-center justify-center text-green-800 shadow-sm transition-transform active:scale-90">
        <Icons.PlusIcon className="w-7 h-7" />
      </button>
    ) : (
      <div className="w-10 h-10" /> // Placeholder for alignment
    )}
  </div>
);

// --- Main Page Components ---
const CashPaymentCard = () => (
  <motion.div 
    className="relative rounded-2xl bg-gradient-to-br from-green-400 to-teal-500 p-6 text-white shadow-lg mx-4 my-2 overflow-hidden h-40 flex flex-col justify-between"
    layoutId="cash-card"
  >
    <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
    <div className="flex items-center space-x-3 z-10">
      <div className="w-10 h-10 rounded-full bg-white/25 flex items-center justify-center">
        <Icons.CurrencyDollarIcon className="w-6 h-6" />
      </div>
    </div>
    <p className="text-2xl font-bold z-10">Efectivo</p>
  </motion.div>
);

const SettingsListItem: React.FC<{ label: string; onClick?: () => void }> = ({ label, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center justify-between px-4 py-4 bg-transparent hover:bg-gray-100 transition-colors duration-200 rounded-xl">
      <span className="text-base font-medium text-gray-800">{label}</span>
      <Icons.ChevronRightIcon className="w-5 h-5 text-gray-400" />
    </button>
  );

// --- Add Method Page Components ---
const AddPaymentOption: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  logos?: React.ReactNode; 
  isSimple?: boolean;
}> = ({ icon, label, logos, isSimple = false }) => (
  <motion.div 
    className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow duration-300"
    whileTap={{ scale: 0.98 }}
  >
    <div className="flex items-center">
      <div className={`${isSimple ? 'w-8' : 'w-10'} h-10 flex items-center justify-center mr-4`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-base text-gray-900">{label}</p>
        {logos && <div className="flex items-center space-x-2 mt-1.5">{logos}</div>}
      </div>
    </div>
    <Icons.ChevronRightIcon className="w-6 h-6 text-gray-300" />
  </motion.div>
);

// --- SVG Logo Components ---
const MastercardLogo = () => (
    <div className="w-6 h-4 flex items-center relative">
        <div className="w-4 h-4 rounded-full bg-red-600"></div>
        <div className="w-4 h-4 rounded-full bg-yellow-500 opacity-80 absolute left-2"></div>
    </div>
);

const AmexLogo = () => (
    <div className="w-6 h-4 flex items-center justify-center bg-[#006fcf] rounded-sm">
        <span className="text-white font-semibold text-[6px]">AMEX</span>
    </div>
);

const VisaLogo = () => (<div className="w-6 h-4 font-serif font-bold text-xl text-[#1a1f71] flex items-center"><i>VISA</i></div>);

const PayPalLogo = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.328 11.353c0-3.374 2.498-5.918 5.86-5.918 1.936 0 3.553.81 4.35 2.401l.135.295.396-2.457H17.4L15.688 16.5h-3.15l.69-4.252c-.52-.338-1.127-.52-1.802-.52-1.92 0-3.41 1.444-3.465 3.328H3.328z" fill="#003087"></path><path d="M8.19 5.435c3.362 0 5.86 2.544 5.86 5.918 0 2.213-1.144 4.144-2.887 5.147l-1.026.59-1.48-9.143c-.22-.86-.88-1.512-1.745-1.512H3.593l-.265 1.643c1.076-1.11 2.58-1.785 4.316-1.785l.546.143z" fill="#009cde"></path><path d="M11.96 16.5c-1.743 0-3.238-.674-4.314-1.784L7.38 16.36c-.147.907.49 1.64 1.41 1.64h3.149l1.714-10.557h-3.373l-.63 3.842c.52.337 1.127.52 1.802.52 1.92 0 3.41-1.444 3.465-3.328h4.636c-.18 3.374-2.678 5.918-6.04 5.918z" fill="#005ea6"></path></svg>
);

const MercadoPagoLogo = () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.394 4.453l-5.65 5.65-2.825-2.825L4.27 13.597a1 1 0 000 1.414l4.242 4.243a1 1 0 001.414 0L15.575 13.6l2.825 2.825 5.65-5.65-5.65-5.65zM12.75 11.5l3-3 1.5 1.5-3 3-1.5-1.5z" fill="#00AEEF"></path><path d="M18.41 15.6l-2.826-2.825-5.65 5.65 2.825 2.826 5.65-5.65z" fill="#00AEEF"></path></svg>
);

const VoucherPill: React.FC<{text: string, className?: string}> = ({ text, className }) => (
    <div className={`px-1.5 py-0.5 rounded-sm text-white text-[10px] font-bold ${className}`}>{text}</div>
);

// --- Main Component ---

export const PaymentMethod: React.FC<{ onBack: () => void; }> = ({ onBack }) => {
  const [view, setView] = useState<'main' | 'add'>('main');

  const pageVariants = {
    initial: { x: '100%', opacity: 0 },
    animate: { x: '0%', opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
  };

  const renderMainView = () => (
    <motion.div 
        key="main" 
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ type: 'tween', duration: 0.35, ease: 'easeInOut' }}
        className="absolute w-full"
    >
      <Header title="Tus métodos de pago" onBack={onBack} onAdd={() => setView('add')} showAdd />
      <CashPaymentCard />
      <div className="px-4 mt-6 space-y-3">
        <SettingsListItem label="Pagos pendientes" />
        <SettingsListItem label="Método de reembolso" />
      </div>
    </motion.div>
  );

  const renderAddView = () => (
    <motion.div 
        key="add" 
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ type: 'tween', duration: 0.35, ease: 'easeInOut' }}
        className="absolute w-full"
    >
      <Header title="Agregar método de pago" onBack={() => setView('main')} />
      <div className="p-4 space-y-3">
        <AddPaymentOption 
          icon={<Icons.CreditCardIcon className="w-7 h-7 text-gray-600"/>}
          label="Tarjeta de Crédito/Débito"
          logos={
            <div className='flex items-center space-x-2'>
              <VisaLogo />
              <MastercardLogo />
              <AmexLogo />
            </div>
          }
        />
        <AddPaymentOption 
          icon={<Icons.TicketIcon className="w-7 h-7 text-gray-600"/>}
          label="Voucher"
          logos={
            <div className='flex items-center space-x-1.5'>
                <VoucherPill text="Up" className="bg-orange-500" />
                <MastercardLogo />
            </div>
          }
        />
        <AddPaymentOption 
          icon={<PayPalLogo />}
          label="PayPal"
          isSimple
        />
         <AddPaymentOption 
          icon={<MercadoPagoLogo />}
          label="Mercado Pago"
          isSimple
        />
      </div>
    </motion.div>
  );

  return (
    <div className="bg-gray-50 min-h-screen relative overflow-x-hidden">
      <AnimatePresence initial={false} custom={view} mode="wait">
        {view === 'main' ? renderMainView() : renderAddView()}
      </AnimatePresence>
    </div>
  );
};
