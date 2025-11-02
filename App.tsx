/**
 * @file App.tsx
 * @description Componente principal de la aplicación. Configura el enrutamiento, la navegación global
 * y la estructura general de la interfaz de usuario. Utiliza React Router DOM para la navegación
 * y Framer Motion para las transiciones de página.
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Home } from './components/Home';
import { Restaurants } from './components/Restaurants';
import { RestaurantDetail } from './components/RestaurantDetail';
import { Cart } from './components/Cart';
import { Admin } from './components/Admin';
import { Login } from './components/Login';
import { MainHeader } from './components/MainHeader';
import { BottomNav } from './components/BottomNav';
import { Sidebar } from './components/Sidebar';
import { RequestService } from './components/RequestService';
import { useAppContext } from './context/AppContext';
import { AppProvider } from './context/AppContext'; // Import AppProvider
import { DashboardOverview } from './components/admin/DashboardOverview';
import { ManageRestaurants } from './components/admin/ManageRestaurants';
import { ManageCategories } from './components/admin/ManageCategories';
import { ManageTariffs } from './components/admin/ManageTariffs';

/**
 * @component PageTransitionWrapper
 * @description Componente de envoltura para aplicar animaciones de transición a las páginas.
 * Utiliza Framer Motion para animaciones de entrada y salida.
 */
const PageTransitionWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, x: 100 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -100 }}
    transition={{ type: "tween", duration: 0.2 }}
    style={{ width: '100%' }}
  >
    {children}
  </motion.div>
);

/**
 * @component App
 * @description Componente principal que define la estructura de la aplicación y sus rutas.
 * Gestiona la visibilidad de la cabecera y el sidebar basándose en la ruta actual y el rol del usuario.
 */
const App: React.FC = () => {
  const { isSidebarOpen, userRole } = useAppContext();
  const location = useLocation(); // Hook para obtener la ubicación actual de la ruta
  const hideHeaderPaths = ['/login', '/']; // Rutas donde la cabecera principal no debe mostrarse
  const shouldShowHeader = !hideHeaderPaths.includes(location.pathname);
  const shouldShowBottomNav = location.pathname !== '/';

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Cabecera principal, visible en la mayoría de las rutas */}
      {shouldShowHeader && <MainHeader />}
      {/* Barra de navegación inferior */}
      {shouldShowBottomNav && <BottomNav />}
      {/* Sidebar, visible si está abierto y el usuario no es admin */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && userRole !== 'admin' && shouldShowBottomNav && <Sidebar />}
      </AnimatePresence>
      {/* Contenido principal de la aplicación */}
      <main className={`flex-grow overflow-y-auto ${shouldShowBottomNav ? 'pb-28' : ''}`}>
        {/* AnimatePresence para animaciones de transición entre rutas */}
        <AnimatePresence mode="wait">
          {/* Definición de rutas de la aplicación */}
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransitionWrapper><Home /></PageTransitionWrapper>} />
            <Route path="/login" element={<PageTransitionWrapper><Login /></PageTransitionWrapper>} />
            <Route path="/restaurants" element={<PageTransitionWrapper><Restaurants /></PageTransitionWrapper>} />
            <Route path="/restaurants/:id" element={<PageTransitionWrapper><RestaurantDetail /></PageTransitionWrapper>} />
            <Route path="/cart" element={<PageTransitionWrapper><Cart /></PageTransitionWrapper>} />
            {/* Rutas anidadas para el panel de administración */}
            <Route path="/admin" element={<Admin />}>
              <Route index element={<PageTransitionWrapper><DashboardOverview /></PageTransitionWrapper>} />
              <Route path="restaurants" element={<PageTransitionWrapper><ManageRestaurants /></PageTransitionWrapper>} />
              <Route path="categories" element={<PageTransitionWrapper><ManageCategories /></PageTransitionWrapper>} />
              <Route path="tariffs" element={<PageTransitionWrapper><ManageTariffs /></PageTransitionWrapper>} />
            </Route>
            <Route path="/request" element={<PageTransitionWrapper><RequestService /></PageTransitionWrapper>} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
};

/**
 * @component AppWrapper
 * @description Envuelve el componente App con BrowserRouter y AppProvider para habilitar el enrutamiento y el contexto global.
 */
const AppWrapper: React.FC = () => (
  <Router>
    <AppProvider>
      <App />
    </AppProvider>
  </Router>
);

export default AppWrapper;