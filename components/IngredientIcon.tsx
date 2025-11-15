import React from 'react';
import { FaLeaf, FaPepperHot, FaCarrot, FaDrumstickBite } from 'react-icons/fa';
import { GiPineapple, GiBroccoli, GiMushroom } from 'react-icons/gi';

// Define un tipo para las props del componente
type IngredientIconProps = {
  name: string;
  className?: string;
};

// Creamos un mapa que asocia el nombre del ingrediente (en minúsculas) con su icono
const iconMap: { [key: string]: React.ReactElement } = {
  'piña': <GiPineapple />,
  'broccoli': <GiBroccoli />,
  'champiñon': <GiMushroom />,
  'pimiento': <FaPepperHot />,
  'zanahoria': <FaCarrot />,
  'hoja': <FaLeaf />, // Un icono genérico para vegetales de hoja
  'pollo': <FaDrumstickBite />,
  // Agrega aquí todos los ingredientes que necesites
};

const IngredientIcon: React.FC<IngredientIconProps> = ({ name, className }) => {
  // Busca el icono en el mapa (convirtiendo el nombre a minúsculas para ser flexible)
  const icon = iconMap[name.toLowerCase()];

  // Si no se encuentra un icono, no se renderiza nada.
  // Podrías devolver un icono por defecto si lo prefieres.
  if (!icon) {
    return null;
  }

  // Clona el elemento del icono para añadirle clases de estilo
  return React.cloneElement(icon, { className });
};

export default IngredientIcon;
