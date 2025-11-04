/**
 * @file AppContext.tsx
 * @description Define el contexto global de la aplicación para gestionar el estado compartido
 * como la autenticación del usuario, el carrito de compras, el restaurante y el artículo seleccionados,
 * y las notificaciones Toast. Proporciona un proveedor (`AppProvider`) y un hook (`useAppContext`)
 * para acceder a este estado y a las funciones para modificarlo.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { confirmarPedido, getTariffs } from '../services/api';
import { Restaurant, MenuItem, CartItem, Ingredient, UserRole, Tariff, OrderUserDetails } from '../types';
import { Toast, ToastType } from '../components/Toast';

/**
 * @interface AppContextType
 * @description Define la forma de los datos y acciones disponibles a través del contexto de la aplicación.
 */
interface AppContextType {
  user: string | null;
  userRole: UserRole;
  selectedRestaurant: Restaurant | null;
  selectedMenuItem: MenuItem | null;
  cart: CartItem[];
  toastMessage: string | null;
  toastType: ToastType;
  isSidebarOpen: boolean;
  cartItemCount: number;
  isCartAnimating: boolean;
  isCustomizationModalOpen: boolean;
  baseFee: number;

  // Acciones que pueden ser invocadas desde cualquier componente consumidor del contexto
  toggleSidebar: () => void;
  showToast: (message: string, type: ToastType) => void;
  handleLogin: (username: string, role: UserRole) => void;
  handleLogout: () => void;
  handleSelectRestaurant: (restaurant: Restaurant) => void;
  handleBackToRestaurants: () => void;
  handleSelectMenuItem: (item: MenuItem) => void;
  handleBackToMenu: () => void;
  handleAddToCart: (item: MenuItem, quantity: number, customizedIngredients: Ingredient[], restaurant: Restaurant) => void;
  handleUpdateCart: (cartItemId: string, newQuantity: number) => void;
  handleRemoveFromCart: (cartItemId: string) => void;
  handleConfirmOrder: (userDetails: OrderUserDetails) => Promise<void>;
  setIsCustomizationModalOpen: (isOpen: boolean) => void;
}

/**
 * @constant AppContext
 * @description Crea el objeto Contexto de React. Su valor por defecto es `undefined`,
 * lo que fuerza a los consumidores a estar dentro de un `AppProvider`.
 */
const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * @component AppProvider
 * @description Componente proveedor del contexto de la aplicación. Envuelve a los componentes hijos
 * y les proporciona acceso al estado global y a las funciones de manipulación de este estado.
 * Gestiona la autenticación con Supabase, el carrito de compras y las notificaciones.
 */
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Estados locales para gestionar la información global de la aplicación
  const [user, setUser] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('guest');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<ToastType>('success');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCartAnimating, setIsCartAnimating] = useState(false);
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false);
  const [baseFee, setBaseFee] = useState(45); // Default value in case fetch fails

  useEffect(() => {
    const fetchBaseFee = async () => {
      try {
        const tariffs = await getTariffs();
        const baseTariff = tariffs.find(t => t.name === 'Tarifa Base');
        if (baseTariff) {
          setBaseFee(baseTariff.price);
        } else {
            console.warn('"Tarifa Base" not found in database, using default value.');
        }
      } catch (error) {
        console.error("Failed to fetch tariffs:", error);
      }
    };

    fetchBaseFee();
  }, []);

  /**
   * @function useEffect
   * @description Hook para manejar los cambios de estado de autenticación de Supabase.
   * Actualiza el usuario y su rol en el contexto cuando el estado de autenticación cambia.
   */
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user.email || null);
        setUserRole(session.user.email?.endsWith('@admin.com') ? 'admin' : 'user');
        console.log('AppContext: Auth state changed - User logged in:', session.user.email);
      } else {
        setUser(null);
        setUserRole('guest');
        console.log('AppContext: Auth state changed - User logged out.');
      }
    });

    // Verificación inicial de la sesión al cargar la aplicación
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user.email || null);
        setUserRole(session.user.email?.endsWith('@admin.com') ? 'admin' : 'user');
      }
    });

    // Limpieza del listener al desmontar el componente
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  /**
   * @function toggleSidebar
   * @description Alterna la visibilidad del sidebar de navegación.
   */
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  /**
   * @function showToast
   * @description Muestra un mensaje Toast en la interfaz de usuario.
   * @param {string} message - El mensaje a mostrar.
   * @param {ToastType} type - El tipo de Toast (e.g., 'success', 'error', 'info').
   */
  const showToast = (message: string, type: ToastType) => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  /**
   * @function handleLogin
   * @description Maneja el inicio de sesión del usuario, actualizando el estado del contexto.
   * @param {string} username - El nombre de usuario o email.
   * @param {UserRole} role - El rol del usuario (e.g., 'admin', 'user').
   */
  const handleLogin = (username: string, role: UserRole) => {
    setUser(username);
    setUserRole(role);
    setIsSidebarOpen(false); // Cerrar el sidebar al iniciar sesión
    showToast(`¡Bienvenido, ${username}!`, 'success');
  };

  /**
   * @function handleLogout
   * @description Maneja el cierre de sesión del usuario, limpiando el estado del contexto
   * y cerrando la sesión en Supabase.
   */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserRole('guest');
    setIsSidebarOpen(false); // Cerrar el sidebar al cerrar sesión
    showToast('Has cerrado sesión.', 'info');
  };

  /**
   * @function handleSelectRestaurant
   * @description Establece el restaurante seleccionado en el estado global.
   * @param {Restaurant} restaurant - El objeto restaurante seleccionado.
   */
  const handleSelectRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
  };
  
  /**
   * @function handleBackToRestaurants
   * @description Limpia el restaurante seleccionado, volviendo a la vista de lista de restaurantes.
   */
  const handleBackToRestaurants = () => {
    setSelectedRestaurant(null);
  };

  /**
   * @function handleSelectMenuItem
   * @description Establece el artículo del menú seleccionado en el estado global.
   * @param {MenuItem} item - El objeto MenuItem seleccionado.
   */
  const handleSelectMenuItem = (item: MenuItem) => {
    setSelectedMenuItem(item);
  };

  /**
   * @function handleBackToMenu
   * @description Limpia el artículo del menú seleccionado, volviendo a la vista del menú del restaurante.
   */
  const handleBackToMenu = () => {
    setSelectedMenuItem(null);
  };

  /**
   * @function handleAddToCart
   * @description Añade un artículo al carrito de compras o actualiza su cantidad si ya existe.
   * @param {MenuItem} item - El artículo del menú a añadir.
   * @param {number} quantity - La cantidad a añadir.
   * @param {Ingredient[]} customizedIngredients - Ingredientes personalizados para el artículo.
   */
  const handleAddToCart = (item: MenuItem, quantity: number, customizedIngredients: Ingredient[], restaurant: Restaurant) => {
    // Genera un ID único para el artículo del carrito basado en el producto y sus personalizaciones
    const cartItemId = `${item.id}-${customizedIngredients.map(i => i.name).sort().join('-')}`;
    
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === cartItemId);
      if (existingItem) {
        // Si el artículo ya existe, actualiza su cantidad
        return prevCart.map(cartItem =>
          cartItem.id === cartItemId
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      } else {
        // Si es un nuevo artículo, lo añade y activa la animación del carrito
        setIsCartAnimating(true);
        setTimeout(() => setIsCartAnimating(false), 500); // Duración de la animación
      }
      return [...prevCart, { id: cartItemId, product: item, quantity, customizedIngredients, restaurant }];
    });
    showToast("¡Añadido al carrito!", 'success');
  };

  /**
   * @function handleUpdateCart
   * @description Actualiza la cantidad de un artículo específico en el carrito.
   * Si la nueva cantidad es 0 o menos, el artículo se elimina del carrito.
   * @param {string} cartItemId - El ID único del artículo en el carrito.
   * @param {number} newQuantity - La nueva cantidad para el artículo.
   */
  const handleUpdateCart = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
       handleRemoveFromCart(cartItemId);
    } else {
      setCart(cart => cart.map(item => item.id === cartItemId ? { ...item, quantity: newQuantity } : item));
    }
  };

  /**
   * @function handleRemoveFromCart
   * @description Elimina un artículo del carrito de compras.
   * @param {string} cartItemId - El ID único del artículo a eliminar del carrito.
   */
  const handleRemoveFromCart = (cartItemId: string) => {
    setCart(cart => cart.filter(item => item.id !== cartItemId));
  };

  /**
   * @function handleConfirmOrder
   * @description Simula la confirmación de un pedido y limpia el carrito.
   * Muestra un Toast de éxito o error.
   * @param {string} phoneNumber - El número de teléfono del usuario para la confirmación.
   */
  const handleConfirmOrder = async (userDetails: OrderUserDetails) => {
    try {
      await confirmarPedido(cart, userDetails);
      showToast("¡Pedido recibido! Recibirás una confirmación por WhatsApp.", 'success');
      setCart([]); // Vaciar el carrito después de confirmar el pedido
    } catch (error) {
      console.error("Order confirmation failed:", error);
      showToast("Hubo un problema al confirmar el pedido.", 'error');
    }
  };

  // Calcula el número total de artículos en el carrito
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Objeto de valor que se proporcionará a los consumidores del contexto
  const value = {
    user, userRole, selectedRestaurant, selectedMenuItem, cart, toastMessage, toastType, isSidebarOpen, cartItemCount, isCartAnimating, isCustomizationModalOpen, baseFee,
    toggleSidebar, showToast, handleLogin, handleLogout, handleSelectRestaurant, handleBackToRestaurants, handleSelectMenuItem, handleBackToMenu, handleAddToCart, handleUpdateCart, handleRemoveFromCart, handleConfirmOrder, setIsCustomizationModalOpen
  };

  return (
    <AppContext.Provider value={value}>
      {children}
      {/* Componente Toast para mostrar notificaciones */}
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />
    </AppContext.Provider>
  );
};

/**
 * @function useAppContext
 * @description Hook personalizado para consumir el contexto de la aplicación.
 * Asegura que el hook se use dentro de un `AppProvider`.
 * @returns {AppContextType} El objeto de contexto con el estado y las acciones.
 * @throws {Error} Si se usa fuera de un `AppProvider`.
 */
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};