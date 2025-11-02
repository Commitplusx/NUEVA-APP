import React, { useState, TouchEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FoodIcon, ShoppingIcon, DeliveryBoxIcon, UserCircleIcon, ArrowRightIcon, ChevronDownIcon } from './icons';
import { useAppContext } from '../context/AppContext';
import { ServiceCard } from './ServiceCard';

interface ServiceData {
  icon: React.ReactElement;
  title: string;
  description: string;
  color: string;
  path: string;
}

const services: ServiceData[] = [
  {
    icon: <FoodIcon />,
    title: "Antojos y Comida",
    description: "Tu comida favorita, caliente y a tiempo.",
    color: "bg-white/20",
    path: "/restaurants",
  },
  {
    icon: <ShoppingIcon />,
    title: "Mandados y Súper",
    description: "Hacemos las compras por ti, de la A a la Z.",
    color: "bg-white/20",
    path: "/coming-soon",
  },
  {
    icon: <DeliveryBoxIcon />,
    title: "Paquetería y Trámites",
    description: "Recogemos y entregamos tus paquetes.",
    color: "bg-white/20",
    path: "/coming-soon",
  }
];

const sectionVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 }
};

const backgroundColors = [
  "from-orange-400 to-red-500",
  "from-orange-400 to-red-500",
  "from-purple-400 to-pink-500",
];

export const Home: React.FC = () => {
  const { user: username } = useAppContext();
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

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
      setCurrentSection(prev => Math.min(prev + 1, 2));
    } else if (isSwipeDown) {
      setCurrentSection(prev => Math.max(prev - 1, 0));
    }
  };

  return (
    <motion.div 
      className={`fixed top-0 left-0 w-full h-full bg-gradient-to-br text-white transition-all duration-500 ${backgroundColors[currentSection]}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence mode="wait">
        {currentSection === 0 && (
          <motion.div
            key="welcome"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative p-6 w-full h-full flex flex-col justify-center items-center text-center"
          >
            <div className="flex justify-between items-center w-full max-w-md absolute top-6 px-6">
              <h1 className="text-2xl font-bold">¡Hola, {username || 'invitado'}!</h1>
              <UserCircleIcon className="w-8 h-8" />
            </div>
            <motion.h2 
              className="text-4xl font-extrabold leading-tight mb-2 mt-20"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              ¿Qué se te antoja hoy?
            </motion.h2>
            <motion.p 
              className="text-orange-100 text-lg mb-6 max-w-md"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Explora una variedad de opciones y recibe lo que necesitas en la puerta de tu casa.
            </motion.p>
            <motion.button
              onClick={() => navigate('/restaurants')}
              className="bg-white/20 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 group hover:bg-white/30 transition-colors shadow-lg mt-4"
              whileTap={{ scale: 0.95 }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <span>Ver Restaurantes</span>
              <ArrowRightIcon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </motion.button>
            <motion.div 
              className="absolute bottom-10 flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, y: [0, -20, 0] }}
              transition={{ delay: 1, duration: 1.5, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
            >
              <span className="text-xs mb-1">Desliza</span>
              <ChevronDownIcon className="w-6 h-6" />
            </motion.div>
          </motion.div>
        )}

        {currentSection === 1 && (
          <motion.div
            key="services"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="px-4 py-8 w-full h-full flex flex-col justify-center"
          >
            <h2 className="text-sm font-bold text-blue-100 uppercase tracking-wider mb-4 px-2">¿Qué podemos hacer por ti?</h2>
            <div className="space-y-3">
              {services.map((service, index) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <ServiceCard
                    icon={service.icon}
                    title={service.title}
                    description={service.description}
                    color={service.color}
                    onClick={() => navigate(service.path)}
                  />
                </motion.div>
              ))}
            </div>
             <motion.div 
              className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, y: [0, -20, 0], scale: [1, 1.1, 1] }}
              transition={{ delay: 1, duration: 1.5, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
            >
              <ChevronDownIcon className="w-6 h-6" />
            </motion.div>
          </motion.div>
        )}

        {currentSection === 2 && (
          <motion.div
            key="explore"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="px-4 py-8 pb-16 w-full h-full flex flex-col justify-center items-center"
          >
            <motion.h2 
              className="text-4xl font-extrabold leading-tight mb-4 text-center"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Todo lo que buscas, en un solo lugar.
            </motion.h2>
            <motion.button
              onClick={() => navigate('/restaurants')}
              className="w-full max-w-md bg-white/20 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 group hover:bg-white/30 transition-colors shadow-lg"
              whileTap={{ scale: 0.95 }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <span>Explorar Todos los Restaurantes</span>
              <ArrowRightIcon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};