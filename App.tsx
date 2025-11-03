/**
 * @file App.tsx
 * @description Componente principal de la aplicación. Configura el enrutamiento, la navegación global
 * y la estructura general de la interfaz de usuario. Utiliza React Router DOM para la navegación
 * y Framer Motion para las transiciones de página.
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { MainHeader } from './components/MainHeader';
import { BottomNav } from './components/BottomNav';
import { Sidebar } from './components/Sidebar';
import { useAppContext } from './context/AppContext';
import { AppProvider } from './context/AppContext';
import UserRouteGuard from './components/UserRouteGuard';
import { Spinner } from './components/Spinner';

// Lazy load de los componentes de página
const Home = lazy(() => import('./components/Home').then(module => ({ default: module.Home })));
const Restaurants = lazy(() => import('./components/Restaurants').then(module => ({ default: module.Restaurants })));
const RestaurantDetail = lazy(() => import('./components/RestaurantDetail').then(module => ({ default: module.RestaurantDetail })));
const Cart = lazy(() => import('./components/Cart').then(module => ({ default: module.Cart })));
const Admin = lazy(() => import('./components/Admin').then(module => ({ default: module.Admin })));
const Login = lazy(() => import('./components/Login').then(module => ({ default: module.Login })));
const RequestService = lazy(() => import('./components/RequestService').then(module => ({ default: module.RequestService })));
const DashboardOverview = lazy(() => import('./components/admin/DashboardOverview').then(module => ({ default: module.DashboardOverview })));
const ManageRestaurants = lazy(() => import('./components/admin/ManageRestaurants').then(module => ({ default: module.ManageRestaurants })));
const ManageCategories = lazy(() => import('./components/admin/ManageCategories').then(module => ({ default: module.ManageCategories })));
const ManageTariffs = lazy(() => import('./components/admin/ManageTariffs').then(module => ({ default: module.ManageTariffs })));

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
  const location = useLocation();
  const hideHeaderPaths = ['/login', '/'];
  const shouldShowHeader = !hideHeaderPaths.includes(location.pathname);
  const shouldShowBottomNav = location.pathname !== '/';

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {shouldShowHeader && <MainHeader />}
      {shouldShowBottomNav && <BottomNav />}
      <AnimatePresence mode="wait">
        {isSidebarOpen && userRole !== 'admin' && shouldShowBottomNav && <Sidebar />}
      </AnimatePresence>
      <main className={`flex-grow overflow-y-auto ${shouldShowBottomNav ? 'pb-28' : ''}`}>
        <AnimatePresence mode="wait">
          <Suspense fallback={<div className="flex justify-center items-center h-full"><Spinner /></div>}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageTransitionWrapper><Home /></PageTransitionWrapper>} />
              <Route path="/login" element={<PageTransitionWrapper><Login /></PageTransitionWrapper>} />
              <Route path="/restaurants" element={<PageTransitionWrapper><Restaurants /></PageTransitionWrapper>} />
              <Route path="/restaurants/:id" element={<PageTransitionWrapper><RestaurantDetail /></PageTransitionWrapper>} />
              <Route path="/request" element={<PageTransitionWrapper><RequestService /></PageTransitionWrapper>} />
              <Route element={<UserRouteGuard />}>
                <Route path="/cart" element={<PageTransitionWrapper><Cart /></PageTransitionWrapper>} />
              </Route>
              <Route path="/admin" element={<Admin />}>
                <Route index element={<PageTransitionWrapper><DashboardOverview /></PageTransitionWrapper>} />
                <Route path="restaurants" element={<PageTransitionWrapper><ManageRestaurants /></PageTransitionWrapper>} />
                <Route path="categories" element={<PageTransitionWrapper><ManageCategories /></PageTransitionWrapper>} />
                <Route path="tariffs" element={<PageTransitionWrapper><ManageTariffs /></PageTransitionWrapper>} />
              </Route>
            </Routes>
          </Suspense>
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