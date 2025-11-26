/**
 * @file App.tsx
 * @description Componente principal de la aplicación. Configura el enrutamiento, la navegación global
 * y la estructura general de la interfaz de usuario. Utiliza React Router DOM para la navegación
 * y Framer Motion para las transiciones de página.
 */

import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BottomNav } from './components/BottomNav';
import { Sidebar } from './components/Sidebar';
import { useAppContext } from './context/AppContext';
import { AppProvider } from './context/AppContext';
import { Spinner } from './components/Spinner';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

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
const ManageServiceRequests = lazy(() => import('./components/admin/ManageServiceRequests').then(module => ({ default: module.ManageServiceRequests })));
const UserProfile = lazy(() => import('./components/UserProfile').then(module => ({ default: module.UserProfile })));
const VerifyCode = lazy(() => import('./components/VerifyCode').then(module => ({ default: module.VerifyCode })));
const MapDemoPage = lazy(() => import('./components/MapDemoPage').then(module => ({ default: module.MapDemoPage })));
const PaymentMethod = lazy(() => import('./components/PaymentMethod').then(module => ({ default: module.PaymentMethod })));

/**
 * @component PageTransitionWrapper
 * @description Componente de envoltura para aplicar animaciones de transición a las páginas.
 * Utiliza Framer Motion para animaciones de entrada y salida.
 */
const PageTransitionWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    style={{ width: '100%' }}
  >
    {children}
  </motion.div>
);

import { usePushNotifications } from './hooks/usePushNotifications';

/**
 * @component App
 * @description Componente principal que define la estructura de la aplicación y sus rutas.
 * Gestiona la visibilidad de la cabecera y el sidebar basándose en la ruta actual y el rol del usuario.
 */
const App: React.FC = () => {
  usePushNotifications(); // Initialize Push Notifications
  const { isSidebarOpen, userRole, isCustomizationModalOpen, isProductModalOpen, isAddressModalOpen, isBottomNavVisible } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  const shouldShowBottomNav =
    location.pathname !== '/' &&
    !isCustomizationModalOpen &&
    !isProductModalOpen &&
    !isAddressModalOpen &&
    isBottomNavVisible &&
    !new URLSearchParams(location.search).has('action') &&
    !new URLSearchParams(location.search).has('modal') &&
    !new URLSearchParams(location.search).has('request_id');


  useEffect(() => {
    const setupPlatform = async () => {
      if (Capacitor.isNativePlatform()) {
        // Allow the webview to overlap the status bar for a transparent effect
        await StatusBar.setOverlaysWebView({ overlay: true });
        // Set status bar style to dark text (Light style)
        await StatusBar.setStyle({ style: Style.Light });
        // Remove explicit background color setting or set to transparent if needed
        // await StatusBar.setBackgroundColor({ color: '#00000000' });
      }
    };
    setupPlatform();
  }, []);

  // PWA install prompt logic
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event);
      setShowInstallButton(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the PWA installation');
        } else {
          console.log('User dismissed the PWA installation');
        }
        setInstallPrompt(null);
        setShowInstallButton(false);
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 pt-[env(safe-area-inset-top)]">
      <AnimatePresence mode="wait">
        {shouldShowBottomNav && <BottomNav />}
        {isSidebarOpen && userRole !== 'admin' && shouldShowBottomNav && <Sidebar />}
      </AnimatePresence>
      {/* Removed pt-10 to eliminate white space on desktop, kept flex-grow and overflow handling */}
      <main className={`flex-grow overflow-y-auto ${shouldShowBottomNav ? 'pb-28' : ''}`}>
        <AnimatePresence mode="wait">
          <Suspense fallback={<div className="flex justify-center items-center h-full"><Spinner /></div>}>
            <Routes location={location}>
              <Route path="/" element={<PageTransitionWrapper><Home /></PageTransitionWrapper>} />
              <Route path="/login" element={<PageTransitionWrapper><Login /></PageTransitionWrapper>} />
              <Route path="/verify-code" element={<PageTransitionWrapper><VerifyCode /></PageTransitionWrapper>} />
              <Route path="/restaurants" element={<PageTransitionWrapper><Restaurants /></PageTransitionWrapper>} />
              <Route path="/restaurants/:id" element={<PageTransitionWrapper><RestaurantDetail /></PageTransitionWrapper>} />
              <Route path="/request" element={<PageTransitionWrapper><RequestService /></PageTransitionWrapper>} />
              <Route path="/cart" element={<PageTransitionWrapper><Cart /></PageTransitionWrapper>} />
              <Route path="/profile" element={<PageTransitionWrapper><UserProfile /></PageTransitionWrapper>} />
              <Route path="/payment-methods" element={<PageTransitionWrapper><PaymentMethod /></PageTransitionWrapper>} />
              <Route path="/admin" element={<Admin />}>
                <Route index element={<PageTransitionWrapper><DashboardOverview /></PageTransitionWrapper>} />
                <Route path="restaurants" element={<PageTransitionWrapper><ManageRestaurants /></PageTransitionWrapper>} />
                <Route path="categories" element={<PageTransitionWrapper><ManageCategories /></PageTransitionWrapper>} />
                <Route path="tariffs" element={<PageTransitionWrapper><ManageTariffs /></PageTransitionWrapper>} />
                <Route path="requests" element={<PageTransitionWrapper><ManageServiceRequests /></PageTransitionWrapper>} />
              </Route>
              <Route path="/map-demo" element={<PageTransitionWrapper><MapDemoPage /></PageTransitionWrapper>} />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </main>


    </div>
  );
};

import { ErrorBoundary } from './components/ErrorBoundary';

/**
 * @component AppWrapper
 * @description Envuelve el componente App con BrowserRouter y AppProvider para habilitar el enrutamiento y el contexto global.
 */
const AppWrapper: React.FC = () => (
  <ErrorBoundary>
    <Router>
      <AppProvider>
        <App />
      </AppProvider>
    </Router>
  </ErrorBoundary>
);

export default AppWrapper;
