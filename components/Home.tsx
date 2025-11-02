import React, { useState, TouchEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from "lottie-react";
import { FoodIcon, ShoppingIcon, DeliveryBoxIcon, UserCircleIcon, ArrowRightIcon, ChevronDownIcon, RestaurantIcon } from './icons';
import { useAppContext } from '../context/AppContext';
import { ServiceCard } from './ServiceCard';
import deliveryAnimation from './animations/delivery-animation.json';
import foodAnimation from './animations/food-animation.json';
import deliveryManAnimation from './animations/delivery-man-animation.json';

interface ServiceData {
  icon: React.ReactElement;
  title: string;
  description: string;
  path: string;
}

const services: ServiceData[] = [
  {
    icon: <FoodIcon />,
    title: "Antojos y Comida",
    description: "Tu comida favorita, caliente y a tiempo.",
    path: "/restaurants",
  },
  {
    icon: <ShoppingIcon />,
    title: "Mandados y Súper",
    description: "Hacemos las compras por ti, de la A a la Z.",
    path: "/coming-soon",
  },
  {
    icon: <DeliveryBoxIcon />,
    title: "Paquetería y Trámites",
    description: "Recogemos y entregamos tus paquetes.",
    path: "/coming-soon",
  }
];

const sectionVariants = {
  hidden: (direction: number) => ({
    opacity: 0,
    rotateY: direction > 0 ? 90 : -90,
    z: -100
  }),
  visible: {
    opacity: 1,
    rotateY: 0,
    z: 0
  },
  exit: (direction: number) => ({
    opacity: 0,
    rotateY: direction < 0 ? 90 : -90,
    z: -100
  })
};

export const Home: React.FC = () => {
  const { user: username } = useAppContext();
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [direction, setDirection] = useState(0);

  const minSwipeDistance = 50;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isSwipeUp = distance > minSwipeDistance;
    const isSwipeDown = distance < -minSwipeDistance;

    if (isSwipeUp) {
      setDirection(1);
      setCurrentSection(prev => Math.min(prev + 1, 2));
    } else if (isSwipeDown) {
      setDirection(-1);
      setCurrentSection(prev => Math.max(prev - 1, 0));
    }
  };

  return (
    <motion.div 
      className="fixed top-0 left-0 w-full h-full bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div style={{ perspective: '1000px', position: 'relative', width: '100%', height: '100%' }}>
        <AnimatePresence mode="wait" custom={direction}>
          {currentSection === 0 && (
            <motion.div
              key="welcome"
              custom={direction}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative p-6 w-full h-full flex flex-col justify-center items-center text-center"
            >
              <div className="flex justify-between items-center w-full max-w-md absolute top-6 px-6">
                <h1 className="text-2xl font-bold text-gray-800">¡Hola, {username || 'invitado'}!</h1>
                <UserCircleIcon className="w-8 h-8 text-gray-800" />
              </div>
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
                <Lottie animationData={deliveryManAnimation} loop={true} style={{ width: 150, height: 150 }} />
              </motion.div>
              <motion.h2 
                className="text-5xl font-extrabold leading-tight mb-4 mt-8 text-gray-800"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                Pide, recibe y disfruta
              </motion.h2>
              <motion.p 
                className="text-gray-600 text-lg mb-8 max-w-md"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                Todo lo que necesitas, a la puerta de tu casa en minutos.
              </motion.p>
              <motion.div 
                className="absolute bottom-10 flex flex-col items-center text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <span className="text-xs mb-1">Desliza</span>
                <ChevronDownIcon className="w-6 h-6" />
              </motion.div>
            </motion.div>
          )}

          {currentSection === 1 && (
            <motion.div
              key="services"
              custom={direction}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="px-4 py-8 w-full h-full flex flex-col justify-center"
            >
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
                <Lottie animationData={deliveryAnimation} loop={true} style={{ width: 150, height: 150 }} />
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">Nuestros Servicios</h2>
              <p className="text-gray-600 text-lg mb-8 max-w-md text-center">
                Te ofrecemos una amplia gama de servicios para hacerte la vida más fácil.
              </p>
            </motion.div>
          )}

          {currentSection === 2 && (
            <motion.div
              key="explore"
              custom={direction}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="px-4 py-8 pb-16 w-full h-full flex flex-col justify-center items-center text-center"
            >
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
                <Lottie animationData={foodAnimation} loop={true} style={{ width: 150, height: 150 }} />
              </motion.div>
              <motion.h2 
                className="text-5xl font-extrabold leading-tight mb-8 mt-8 text-gray-800"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                Descubre un mundo de sabores
              </motion.h2>
              <motion.button
                onClick={() => navigate('/restaurants')}
                className="bg-orange-500 text-white font-bold py-4 px-8 rounded-full flex items-center justify-center gap-2 group hover:bg-orange-600 transition-colors shadow-lg"
                whileTap={{ scale: 0.95 }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <span>Explorar Restaurantes</span>
                <ArrowRightIcon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};