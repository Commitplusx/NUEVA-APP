import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HomeIcon, ShoppingIcon, UserIcon, PackageIcon, CogIcon, CartIcon } from './icons';
import { useAppContext } from '../context/AppContext';

const NavItem: React.FC<{ to: string, label: string, icon: React.ReactNode, showCartCount?: boolean }> = ({ to, label, icon, showCartCount = false }) => {
  const location = useLocation();
  const isCurrent = location.pathname === to;
  const { cartItemCount } = useAppContext();

  return (
    <Link to={to} className="flex flex-col items-center justify-center w-full h-full relative">
      <motion.div
        className={`flex flex-col items-center justify-center w-full h-full pt-2 pb-1 ${isCurrent ? 'text-orange-500' : 'text-gray-500'}`}
        initial={false}
        animate={{ scale: isCurrent ? 1.1 : 1, color: isCurrent ? 'rgb(249 115 22)' : 'rgb(107 114 128)' }}
        whileHover={{ scale: 1.1, color: 'rgb(249 115 22)' }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {icon}
        <span className="text-xs font-medium">{label}</span>
        {showCartCount && cartItemCount > 0 && (
          <motion.span
            className="absolute top-1 right-4 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {cartItemCount}
          </motion.span>
        )}
      </motion.div>
    </Link>
  );
};

export const BottomNav: React.FC = () => {
  const { cartItemCount, userRole } = useAppContext();
  const isLoggedIn = userRole !== 'guest';

  const basePages = [
    { to: '/', label: 'Inicio', icon: <HomeIcon className="w-6 h-6 mb-1" /> },
    { to: '/restaurants', label: 'Comercios', icon: <ShoppingIcon className="w-6 h-6 mb-1" /> },
    { to: '/request', label: 'Solicitar', icon: <PackageIcon className="w-6 h-6 mb-1" /> },
  ];

  const cartPage = { to: '/cart', label: 'Carrito', icon: <CartIcon className="w-6 h-6 mb-1" />, showCartCount: true };
  const profilePage = { to: '/profile', label: 'Perfil', icon: <UserIcon className="w-6 h-6 mb-1" /> };
  const adminPage = { to: '/admin', label: 'Admin', icon: <CogIcon className="w-6 h-6 mb-1" /> };

  let pagesToRender = [...basePages];

  // Always add the cart page
  pagesToRender.push(cartPage);

  // Conditionally add the profile page if logged in
  if (isLoggedIn) {
    pagesToRender.push(profilePage);
  }

  // Conditionally add the admin page if admin
  if (userRole === 'admin') {
    pagesToRender.push(adminPage);
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] md:max-w-sm mx-auto bg-white/80 backdrop-blur-sm shadow-lg rounded-full border border-gray-200/80" style={{ zIndex: 9999 }}>
      <div className="flex justify-around items-center h-16">
        {pagesToRender.map((page) => (
          <NavItem key={page.to} {...page} />
        ))}
      </div>
    </div>
  );
};