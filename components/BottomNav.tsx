import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HomeIcon, ShoppingIcon, UserIcon, PackageIcon, CogIcon, CartIcon, ChartBarIcon, BuildingStorefrontIcon, TagIcon, CurrencyDollarIcon, LogoutIcon } from './icons';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const NavItem: React.FC<{ to: string, label: string, icon: React.ReactNode, showCartCount?: boolean }> = ({ to, label, icon, showCartCount = false }) => {
  const location = useLocation();

  // Logic for active state:
  // 1. Exact match for root '/'
  // 2. Exact match for '/admin' to avoid conflict with other admin routes
  // 3. StartsWith for others (e.g. /restaurants/123 should match /restaurants)
  const isCurrent =
    to === '/' ? location.pathname === '/' :
      to === '/admin' ? location.pathname === '/admin' :
        location.pathname.startsWith(to);

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
          className="absolute inset-0 bg-black rounded-full -z-10 my-2 mx-2 shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-white/10"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
      {!isCurrent && (
        <div className="absolute inset-0 bg-gray-100 rounded-full -z-10 my-2 mx-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      )}
      <motion.div
        className={`flex flex-col items-center justify-center w-full h-full pt-2 pb-1 transition-colors duration-200 ${isCurrent ? 'text-white' : 'text-gray-500 group-hover:text-gray-900'}`}
        initial={false}
        animate={isCartAnimating && showCartCount ? 'shake' : ''}
        variants={cartAnimation}
        whileTap={{ scale: 0.9 }}
      >
        <motion.div
          animate={isCurrent ? { scale: 1.25, y: -3 } : { scale: 1, y: 0 }}
          whileHover={{
            scale: 1.2,
            rotate: isCurrent ? 0 : [0, -10, 10, 0],
            transition: {
              type: "spring",
              stiffness: 400,
              damping: 10,
              rotate: {
                type: "keyframes",
                duration: 0.25
              }
            }
          }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          {icon}
        </motion.div>
        <span className="text-[10px] font-medium mt-0.5">{label}</span>
        {showCartCount && cartItemCount > 0 && (
          <motion.span
            className="absolute top-2 right-4 w-4 h-4 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white"
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