import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { UserCircleIcon, XCircleIcon, HomeIcon, ShoppingIcon, PackageIcon, CogIcon, LogoutIcon } from './icons';

const sidebarVariants = {
  hidden: { 
    clipPath: 'circle(0% at 2.5rem 2.5rem)',
    transition: { duration: 0.5, ease: 'easeInOut' }
  },
  visible: { 
    clipPath: 'circle(150% at 2.5rem 2.5rem)',
    transition: { duration: 0.5, ease: 'easeInOut' }
  }
};

const navContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delay: 0.3, // Wait for the main reveal animation to start
      staggerChildren: 0.08, // Animate each child with this delay
    },
  },
};

const navItemVariants = {
  hidden: { opacity: 0, y: -15 },
  visible: { opacity: 1, y: 0 },
};

const Sidebar: React.FC = () => {
  const { 
    toggleSidebar, 
    user, 
    userRole, 
    handleLogout 
  } = useAppContext();
  const navigate = useNavigate();

  console.log('Sidebar render - user:', user, 'userRole:', userRole);

  const handleLogoutClick = () => {
    handleLogout();
    toggleSidebar();
    navigate('/login'); // Navigate to login page on logout
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-black bg-opacity-50 z-40"
      onClick={toggleSidebar}
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <div 
        className="fixed top-0 left-0 w-72 h-full bg-white shadow-lg z-50 p-6 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <UserCircleIcon className="w-10 h-10 text-gray-400" />
              <div>
                <p className="font-bold text-gray-800">{user || 'Invitado'}</p>
                <p className="text-xs text-gray-500 capitalize">{userRole}</p>
              </div>
            </div>
            <button 
              onClick={toggleSidebar} 
              className="p-1.5 rounded-full transition-all duration-200 ease-in-out hover:bg-gray-100 active:scale-90"
            >
              <XCircleIcon className="w-6 h-6 text-gray-800" />
            </button>
          </div>
        </div>

        <nav className="flex-grow">
          <motion.ul
            variants={navContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.li className="mb-4" variants={navItemVariants}>
              <Link to="/" onClick={toggleSidebar} className="flex items-center gap-3 text-gray-700 hover:text-orange-500 font-semibold">
                <HomeIcon className="w-6 h-6" />
                <span>Inicio</span>
              </Link>
            </motion.li>
            <motion.li className="mb-4" variants={navItemVariants}>
              <Link to="/restaurants" onClick={toggleSidebar} className="flex items-center gap-3 text-gray-700 hover:text-orange-500 font-semibold">
                <ShoppingIcon className="w-6 h-6" />
                <span>Restaurantes</span>
              </Link>
            </motion.li>
            <motion.li className="mb-4" variants={navItemVariants}>
              <Link to="/request" onClick={toggleSidebar} className="flex items-center gap-3 text-gray-700 hover:text-orange-500 font-semibold">
                <PackageIcon className="w-6 h-6" />
                <span>Solicitar Servicio</span>
              </Link>
            </motion.li>
            {userRole === 'admin' && (
              <motion.li className="mb-4" variants={navItemVariants}>
                <Link to="/admin" onClick={toggleSidebar} className="flex items-center gap-3 text-gray-700 hover:text-orange-500 font-semibold">
                  <CogIcon className="w-6 h-6" />
                  <span>Admin Panel</span>
                </Link>
              </motion.li>
            )}
          </motion.ul>
        </nav>

        <motion.div 
          className="flex-shrink-0"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {user && (
            <button onClick={handleLogoutClick} className="flex items-center gap-3 text-red-500 hover:text-red-700 font-semibold">
              <LogoutIcon className="w-6 h-6" />
              <span>Cerrar Sesión</span>
            </button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export { Sidebar };
