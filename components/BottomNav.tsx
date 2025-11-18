import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HomeIcon, ShoppingIcon, UserIcon, PackageIcon, CogIcon, CartIcon, ChartBarIcon, BuildingStorefrontIcon, TagIcon, CurrencyDollarIcon, LogoutIcon } from './icons';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const NavItem: React.FC<{ to: string, label: string, icon: React.ReactNode, showCartCount?: boolean }> = ({ to, label, icon, showCartCount = false }) => {
  const location = useLocation();
  // Check if the current path starts with the 'to' prop (for nested routes like /restaurants/:id)
  // Exception for root path '/' to avoid matching everything
  const isCurrent = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
  const { cartItemCount, isCartAnimating } = useAppContext();

  const cartAnimation = {
    shake: {
      rotate: [0, -15, 15, -15, 15, 0],
      transition: { duration: 0.5 },
    },
  };

  return (
    <Link to={to} className="flex flex-col items-center justify-center w-full h-full relative z-10 group">
      {isCurrent && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-black rounded-full -z-10 my-2 mx-2"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
      <motion.div
        className={`flex flex-col items-center justify-center w-full h-full pt-2 pb-1 transition-colors duration-200 ${isCurrent ? 'text-white' : 'text-gray-500 group-hover:text-gray-900'}`}
        initial={false}
        animate={isCartAnimating && showCartCount ? 'shake' : ''}
        variants={cartAnimation}
        whileTap={{ scale: 0.9 }}
      >
        {icon}
        <span className="text-[10px] font-medium mt-0.5">{label}</span>
        {showCartCount && cartItemCount > 0 && (
          <motion.span
            className="absolute top-2 right-4 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white"
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
  const { cartItemCount, userRole, handleLogout, isBottomNavVisible, bottomNavCustomContent } = useAppContext();
  const navigate = useNavigate();
  const isLoggedIn = userRole !== 'guest';

  if (!isBottomNavVisible) {
    return null;
  }

  const basePages = [
    { to: '/restaurants', label: 'Comercios', icon: <ShoppingIcon className="w-6 h-6" /> },
    { to: '/request', label: 'Solicitar', icon: <PackageIcon className="w-6 h-6" /> },
  ];

  const adminPages = [
    { to: '/admin', label: 'Resumen', icon: <ChartBarIcon className="w-6 h-6" /> },
    { to: '/admin/restaurants', label: 'Restaurantes', icon: <BuildingStorefrontIcon className="w-6 h-6" /> },
    { to: '/admin/categories', label: 'Categorías', icon: <TagIcon className="w-6 h-6" /> },
    { to: '/admin/tariffs', label: 'Tarifas', icon: <CurrencyDollarIcon className="w-6 h-6" /> },
  ];

  const cartPage = { to: '/cart', label: 'Carrito', icon: <CartIcon className="w-6 h-6" />, showCartCount: true };
  const profilePage = { to: '/profile', label: 'Perfil', icon: <UserIcon className="w-6 h-6" /> };
  const loginPage = { to: '/login', label: 'Login', icon: <UserIcon className="w-6 h-6" /> };

  const pagesToRender = userRole === 'admin'
    ? adminPages
    : [...basePages, cartPage, isLoggedIn ? profilePage : loginPage];

  return (
    <motion.div
      // Fix: Include x: "-50%" in Framer Motion props to handle centering correctly
      // removing conflict with Tailwind's translate classes
      initial={{ y: 100, x: "-50%" }}
      animate={{ y: 0, x: "-50%" }}
      exit={{ y: 100, x: "-50%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      // Removed -translate-x-1/2 from className as it's handled by motion now
      // Added safe-area handling for bottom
      className="bottom-nav fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 w-[85%] md:max-w-sm mx-auto bg-white/90 backdrop-blur-lg shadow-2xl rounded-full border border-gray-100 lg:hidden" 
      style={{ zIndex: 9999 }}
    >
      <div className="flex justify-between items-center h-16 px-2">
        {bottomNavCustomContent ? (
          bottomNavCustomContent
        ) : (
          <>
            {pagesToRender.map((page) => (
              <NavItem key={page.to} {...page} />
            ))}
            {userRole === 'admin' && (
              <button
                onClick={() => {
                  handleLogout();
                  navigate('/login');
                }}
                className="flex flex-col items-center justify-center w-full h-full pt-2 pb-1 text-red-500"
              >
                <LogoutIcon className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-medium">Salir</span>
              </button>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};