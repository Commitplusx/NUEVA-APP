import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from "lottie-react";
import { FoodIcon, ShoppingIcon, DeliveryBoxIcon, UserCircleIcon, ArrowRightIcon, ChevronDownIcon, ChevronUpIcon, RestaurantIcon } from './icons';
import { useAppContext } from '../context/AppContext';
import { ServiceCard } from './ServiceCard';
import secondPageAnimation from './animations/2dapagina.json';
import firstPageAnimation from './animations/1ra.json';
import thirdPageAnimation from './animations/3ra.json';

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
  const { user: userObject, userRole, profile } = useAppContext();
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(0);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const interval = setInterval(() => {
      setCurrentSection(prevSection => {
        if (prevSection < 2) {
          return prevSection + 1;
        }
        clearInterval(interval);
        return prevSection;
      });
    }, 3000); // Cambia cada 3 segundos

    return () => {
      document.body.style.overflow = 'auto';
      clearInterval(interval); // Limpiar el intervalo al desmontar el componente
    };
  }, []);

  return (
    <motion.div 
      className="fixed top-0 left-0 w-full h-full bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ perspective: '1000px', position: 'relative', width: '100%', height: '100%' }}>
        <AnimatePresence mode="wait" custom={1}>
          {currentSection === 0 && (
            <motion.div
              key="welcome"
              custom={1}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ type: "tween", duration: 0.4 }}
              className="relative p-6 w-full h-full flex flex-col justify-center items-center text-center"
            >
              <div className="flex justify-between items-center w-full max-w-md absolute top-6 px-6">
                <h1 className="text-2xl font-bold text-gray-800">¡Hola, {userRole === 'admin' ? 'Administrador' : profile?.full_name || 'Bienvenido/a'}!</h1>
                <UserCircleIcon className="w-8 h-8 text-gray-800" />
              </div>
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
                <Lottie animationData={firstPageAnimation} loop={true} style={{ width: 150, height: 150 }} />
              </motion.div>
                            <motion.h2
                              className="text-5xl font-extrabold leading-tight mb-4 mt-8 text-gray-800"
                              initial={{ y: -20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.4, duration: 0.5 }}
                            >
                              Servicios a tu medida, entregados con excelencia.
                            </motion.h2>
                                          <motion.p
                className="text-gray-600 text-lg mb-8 max-w-md"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                Todo lo que necesitas, a la puerta de tu casa con rapidez y eficiencia.
              </motion.p>
            </motion.div>
          )}

          {currentSection === 1 && (
            <motion.div
              key="services"
              custom={1}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ type: "tween", duration: 0.4 }}
              className="relative px-4 py-8 w-full h-full flex flex-col justify-center"
            >
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
                <Lottie animationData={secondPageAnimation} loop={true} style={{ width: 150, height: 150 }} />
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">Descubre Nuestros Servicios Integrales</h2>
              <p className="text-gray-600 text-lg mb-8 max-w-md text-center">
                Diseñados para simplificar tu día a día, nuestra plataforma te conecta con soluciones rápidas y confiables.
              </p>
            </motion.div>
          )}

          {currentSection === 2 && (
            <motion.div
              key="explore"
              custom={1}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ type: "tween", duration: 0.4 }}
              className="relative px-4 py-8 pb-16 w-full h-full flex flex-col justify-center items-center text-center"
            >
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
                <Lottie animationData={thirdPageAnimation} loop={true} style={{ width: 150, height: 150 }} />
              </motion.div>
                            <motion.h2
                              className="text-5xl font-extrabold leading-tight mb-8 mt-8 text-gray-800"
                              initial={{ y: -20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.4, duration: 0.5 }}
                            >
                              Tu próxima experiencia te espera.
                            </motion.h2>              {userRole !== 'admin' ? (
                <motion.button
                  onClick={() => navigate('/restaurants')}
                  className="bg-orange-500 text-white font-bold py-4 px-8 rounded-full flex items-center justify-center gap-2 group hover:bg-orange-600 transition-colors shadow-lg"
                  whileTap={{ scale: 0.95 }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <span>Explorar Opciones Culinarias</span>
                  <ArrowRightIcon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </motion.button>
              ) : (
                <motion.button
                  onClick={() => navigate('/admin')}
                  className="bg-blue-600 text-white font-bold py-4 px-8 rounded-full flex items-center justify-center gap-2 group hover:bg-blue-700 transition-colors shadow-lg"
                  whileTap={{ scale: 0.95 }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <span>Acceder al Panel de Administración</span>
                  <ArrowRightIcon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};