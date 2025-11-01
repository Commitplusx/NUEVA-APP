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
import { DashboardOverview } from './components/admin/DashboardOverview';
import { ManageRestaurants } from './components/admin/ManageRestaurants';
import { ManageCategories } from './components/admin/ManageCategories';
import { ManageTariffs } from './components/admin/ManageTariffs';

const PageTransitionWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, x: 100 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -100 }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
    style={{ width: '100%' }}
  >
    {children}
  </motion.div>
);

const App: React.FC = () => {
  const { isSidebarOpen, userRole } = useAppContext();
  const location = useLocation(); // use useLocation hook inside Router
  const hideHeaderPaths = ['/login'];
  const shouldShowHeader = !hideHeaderPaths.includes(location.pathname);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {shouldShowHeader && <MainHeader />}
      <BottomNav />
      <AnimatePresence mode="wait">
        {isSidebarOpen && userRole !== 'admin' && <Sidebar />}
      </AnimatePresence>
      <main className="flex-grow overflow-y-auto pb-28">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransitionWrapper><Home /></PageTransitionWrapper>} />
            <Route path="/login" element={<PageTransitionWrapper><Login /></PageTransitionWrapper>} />
            <Route path="/restaurants" element={<PageTransitionWrapper><Restaurants /></PageTransitionWrapper>} />
            <Route path="/restaurants/:id" element={<PageTransitionWrapper><RestaurantDetail /></PageTransitionWrapper>} />
            <Route path="/cart" element={<PageTransitionWrapper><Cart /></PageTransitionWrapper>} />
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
      {/* <BottomNav /> */}
    </div>
  );
};

const AppWrapper: React.FC = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;
