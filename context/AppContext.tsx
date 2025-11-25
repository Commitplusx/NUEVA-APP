/**
 * @file AppContext.tsx
 * @description Define el contexto global de la aplicación para gestionar el estado compartido
 * como la autenticación del usuario, el carrito de compras, el restaurante y el artículo seleccionados,
 * y las notificaciones Toast. Proporciona un proveedor (`AppProvider`) y un hook (`useAppContext`)
 * para acceder a este estado y a las funciones para modificarlo.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';



import { supabase } from '../services/supabase';

import { confirmarPedido, getTariffs, getProfile } from '../services/api';

import { Restaurant, MenuItem, CartItem, UserRole, Tariff, OrderUserDetails, Profile, PaymentMethodType, Ingredient } from '../types';

import { Toast, ToastType } from '../components/Toast';

import { ConfirmModal } from '../components/ConfirmModal';
import { Preferences } from '@capacitor/preferences';
// import { useAppState } from '../hooks/useAppState'; // Removed to fix hook error

import { User } from '@supabase/supabase-js';









/**

 * @interface AppContextType

 * @description Define la forma de los datos y acciones disponibles a través del contexto de la aplicación.

 */

interface AppContextType {

  user: User | null;

  userRole: UserRole;

  isLoadingAuth: boolean;

  selectedRestaurant: Restaurant | null;

  selectedMenuItem: MenuItem | null;

  cart: CartItem[];

  toastMessage: string | null;

  toastType: ToastType;

  isSidebarOpen: boolean;

  cartItemCount: number;

  isCartAnimating: boolean;

  profile: Profile | null;

  baseFee: number;

  isMapsLoaded: boolean;

  loadError?: Error;

  isProductModalOpen: boolean;

  isAddressModalOpen: boolean;

  isBottomNavVisible: boolean;

  bottomNavCustomContent: ReactNode | null;

  selectedPaymentMethod: PaymentMethodType;

  destinationCoords: { lat: number; lng: number } | null;

  activeOrderId: number | null;
  setActiveOrderId: (id: number | null) => void;
  isActiveOrderLoaded: boolean;



  // Acciones que pueden ser invocadas desde cualquier componente consumidor del contexto



  setDestinationCoords: (coords: { lat: number; lng: number } | null) => void;

  toggleSidebar: () => void;



  showToast: (message: string, type: ToastType) => void;



  requestConfirmation: (title: string, message: string, onConfirm: () => void) => void;



  handleLogin: (username: string, role: UserRole) => void;



  handleLogout: () => void;



  handleSelectRestaurant: (restaurant: Restaurant) => void;



  handleBackToRestaurants: () => void;



  handleSelectMenuItem: (item: MenuItem) => void;



  handleBackToMenu: () => void;



  handleAddToCart: (item: MenuItem, quantity: number, customizedIngredients: string[], selectedOptions?: Record<string, string[]>) => void;



  handleUpdateCart: (cartItemId: string, newQuantity: number) => void;



  handleRemoveFromCart: (cartItemId: string) => void;



  handleConfirmOrder: (userDetails: OrderUserDetails, deliveryFee: number) => Promise<void>;



  setIsCustomizationModalOpen: (isOpen: boolean) => void;



  setIsProductModalOpen: (isOpen: boolean) => void;

  setIsAddressModalOpen: (isOpen: boolean) => void;



  setBottomNavVisible: (isVisible: boolean) => void;

  setBottomNavCustomContent: (content: ReactNode | null) => void;

  handleSetPaymentMethod: (method: PaymentMethodType) => void;

}







/**



 * @constant AppContext



 * @description Crea el objeto Contexto de React. Su valor por defecto es `undefined`,



 * lo que fuerza a los consumidores a estar dentro de un `AppProvider`.



 */



const AppContext = createContext<AppContextType | undefined>(undefined);







// Type for the confirmation modal state



interface ConfirmationState {



  isOpen: boolean;



  title: string;



  message: string;



  onConfirm: () => void;



}







/**



 * @component AppProvider



 * @description Componente proveedor del contexto de la aplicación. Envuelve a los componentes hijos



 * y les proporciona acceso al estado global y a las funciones de manipulación de este estado.



 * Gestiona la autenticación con Supabase, el carrito de compras y las notificaciones.



 */



export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {



  // Estados locales para gestionar la información global de la aplicación



  const [user, setUser] = useState<User | null>(null);



  const [userRole, setUserRole] = useState<UserRole>('guest');



  const [isLoadingAuth, setIsLoadingAuth] = useState(true);



  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isRestaurantLoaded, setIsRestaurantLoaded] = useState(false);

  useEffect(() => {
    const loadRestaurant = async () => {
      try {
        const { value } = await Preferences.get({ key: 'app-selected-restaurant' });
        if (value) setSelectedRestaurant(JSON.parse(value));
      } catch (error) {
        console.error("Error loading restaurant:", error);
      } finally {
        setIsRestaurantLoaded(true);
      }
    };
    loadRestaurant();
  }, []);

  useEffect(() => {
    if (!isRestaurantLoaded) return;
    const saveRestaurant = async () => {
      try {
        if (selectedRestaurant) {
          await Preferences.set({ key: 'app-selected-restaurant', value: JSON.stringify(selectedRestaurant) });
        } else {
          await Preferences.remove({ key: 'app-selected-restaurant' });
        }
      } catch (error) {
        console.error("Error saving restaurant:", error);
      }
    };
    saveRestaurant();
  }, [selectedRestaurant, isRestaurantLoaded]);



  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);



  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartLoaded, setIsCartLoaded] = useState(false);

  useEffect(() => {
    const loadCart = async () => {
      try {
        const { value } = await Preferences.get({ key: 'app-cart' });
        if (value) setCart(JSON.parse(value));
      } catch (error) {
        console.error("Error loading cart:", error);
      } finally {
        setIsCartLoaded(true);
      }
    };
    loadCart();
  }, []);

  useEffect(() => {
    if (!isCartLoaded) return;
    const saveCart = async () => {
      try {
        await Preferences.set({ key: 'app-cart', value: JSON.stringify(cart) });
      } catch (error) {
        console.error("Error saving cart:", error);
      }
    };
    saveCart();
  }, [cart, isCartLoaded]);



  const [toastMessage, setToastMessage] = useState<string | null>(null);



  const [toastType, setToastType] = useState<ToastType>('success');



  const [isSidebarOpen, setIsSidebarOpen] = useState(false);



  const [isCartAnimating, setIsCartAnimating] = useState(false);



  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false);



  const [isProductModalOpen, setIsProductModalOpen] = useState(false);



  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);















  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType>('cash');
  const [isPaymentMethodLoaded, setIsPaymentMethodLoaded] = useState(false);

  useEffect(() => {
    const loadPaymentMethod = async () => {
      try {
        const { value } = await Preferences.get({ key: 'app-payment-method' });
        if (value) setSelectedPaymentMethod(JSON.parse(value));
      } catch (error) {
        console.error("Error loading payment method:", error);
      } finally {
        setIsPaymentMethodLoaded(true);
      }
    };
    loadPaymentMethod();
  }, []);

  useEffect(() => {
    if (!isPaymentMethodLoaded) return;
    const savePaymentMethod = async () => {
      try {
        await Preferences.set({ key: 'app-payment-method', value: JSON.stringify(selectedPaymentMethod) });
      } catch (error) {
        console.error("Error saving payment method:", error);
      }
    };
    savePaymentMethod();
  }, [selectedPaymentMethod, isPaymentMethodLoaded]);

  const [activeOrderId, setActiveOrderId] = useState<number | null>(null);
  const [isActiveOrderLoaded, setIsActiveOrderLoaded] = useState(false);

  useEffect(() => {
    const loadActiveOrder = async () => {
      try {
        const { value } = await Preferences.get({ key: 'app-active-order-id' });
        if (value) setActiveOrderId(parseInt(value, 10));
      } catch (error) {
        console.error("Error loading active order:", error);
      } finally {
        setIsActiveOrderLoaded(true);
      }
    };
    loadActiveOrder();
  }, []);

  useEffect(() => {
    if (!isActiveOrderLoaded) return;
    const saveActiveOrder = async () => {
      try {
        if (activeOrderId) {
          await Preferences.set({ key: 'app-active-order-id', value: activeOrderId.toString() });
        } else {
          await Preferences.remove({ key: 'app-active-order-id' });
        }
      } catch (error) {
        console.error("Error saving active order:", error);
      }
    };
    saveActiveOrder();
  }, [activeOrderId, isActiveOrderLoaded]);

  useEffect(() => {
    if (!isPaymentMethodLoaded) return;
    const savePaymentMethod = async () => {
      try {
        await Preferences.set({ key: 'app-payment-method', value: JSON.stringify(selectedPaymentMethod) });
      } catch (error) {
        console.error("Error saving payment method:", error);
      }
    };
    savePaymentMethod();
  }, [selectedPaymentMethod, isPaymentMethodLoaded]);







  useEffect(() => {



    try {



      window.localStorage.setItem('app-payment-method', JSON.stringify(selectedPaymentMethod));



    } catch (error) {



      console.error("Error saving payment method to localStorage", error);



    }



  }, [selectedPaymentMethod]);























  const [baseFee, setBaseFee] = useState(45);







  const [profile, setProfile] = useState<Profile | null>(null);







  const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null);







  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);







  const [bottomNavCustomContent, setBottomNavCustomContent] = useState<ReactNode | null>(null);























  // FIX: Se reemplaza el hook de google maps por una constante para no romper la lógica existente.
  const isMapsLoaded = true;
  const loadError = undefined;















  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>(null);















  const handleSetPaymentMethod = (method: PaymentMethodType) => {







    setSelectedPaymentMethod(method);







    showToast(`Método de pago cambiado a ${method}`, 'info');







  };























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















  useEffect(() => {







    const fetchUserProfile = async () => {
      if (user) {







        try {







          const userProfile = await getProfile();







          setProfile(userProfile);







        } catch (error) {







          console.error("Error fetching user profile in AppContext:", error);







          setProfile(null);







        }







      } else {







        setProfile(null);







      }







    };

    fetchUserProfile();
  }, [user]);

  // --- App State / Foreground Check (Inlined to fix hook error) ---
  useEffect(() => {
    let handle: any; // PluginListenerHandle

    const setupListener = async () => {
      // Import dynamically or assume App is available if imported at top
      const { App } = await import('@capacitor/app');

      handle = await App.addListener('appStateChange', (state) => {
        if (state.isActive) {
          console.log('App state changed to active (foreground)');
          if (user) {
            console.log('Refreshing profile...');
            const refreshProfile = async () => {
              try {
                const userProfile = await getProfile();
                setProfile(userProfile);
              } catch (error) {
                console.error("Error refreshing user profile on foreground:", error);
              }
            };
            refreshProfile();
          }
        }
      });
    };

    setupListener();

    return () => {
      if (handle) {
        handle.remove();
      }
    };
  }, [user]);

  useEffect(() => {







    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {







      if (session?.user) {







        setUser(session.user || null);







        setUserRole(session.user.email?.endsWith('@admin.com') ? 'admin' : 'user');







      } else {







        setUser(null);







        setUserRole('guest');







      }







      setIsLoadingAuth(false);







    });















    supabase.auth.getSession().then(({ data: { session } }) => {







      if (session?.user) {







        setUser(session.user || null);







        setUserRole(session.user.email?.endsWith('@admin.com') ? 'admin' : 'user');







      }







      setIsLoadingAuth(false);







    });















    return () => {







      authListener.subscription.unsubscribe();







    };







  }, []);















  const toggleSidebar = () => {







    setIsSidebarOpen(!isSidebarOpen);







  };















  const showToast = (message: string, type: ToastType) => {







    setToastMessage(message);







    setToastType(type);







    setTimeout(() => {







      setToastMessage(null);







    }, 3000);







  };















  const requestConfirmation = (title: string, message: string, onConfirm: () => void) => {







    setConfirmation({







      isOpen: true,







      title,







      message,







      onConfirm,







    });







  };















  const handleLogin = (username: string, role: UserRole) => {







    setUserRole(role);







    setIsSidebarOpen(false);







    showToast(`¡Bienvenido, ${username}!`, 'success');







  };















  const handleLogout = async () => {







    await supabase.auth.signOut();







    setUser(null);







    setUserRole('guest');







    setIsSidebarOpen(false);







    showToast('Has cerrado sesión.', 'info');







  };















  const handleSelectRestaurant = (restaurant: Restaurant) => {







    setSelectedRestaurant(restaurant);







  };















  const handleBackToRestaurants = () => {







    setSelectedRestaurant(null);







  };















  const handleSelectMenuItem = (item: MenuItem) => {







    setSelectedMenuItem(item);







  };















  const handleBackToMenu = () => {







    setSelectedMenuItem(null);







  };















  const handleAddToCart = (item: MenuItem, quantity: number, customizedIngredients: string[], selectedOptions?: Record<string, string[]>) => {
    // Obtener el restaurante del contexto
    const restaurant = selectedRestaurant;
    if (!restaurant) {
      showToast('Error: No hay restaurante seleccionado', 'error');
      return;
    }

    const cartRestaurantId = cart.length > 0 ? cart[0].restaurant.id : null;
































    const addItemToCart = (isNewCart: boolean) => {
      // Generate ID including selected options to differentiate customizations
      const optionsString = selectedOptions
        ? Object.entries(selectedOptions)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([key, values]) => `${key}:${values.sort().join(',')}`)
          .join('|')
        : '';

      const cartItemId = `${item.id}-${customizedIngredients.sort().join('-')}-${optionsString}`;




































      // Convertimos el string[] de vuelta a Ingredient[] para que sea compatible con el estado del carrito















      const ingredientsForCart: Ingredient[] = customizedIngredients.map(name => ({ name, icon: '' }));































      if (isNewCart) {















        const newCartItem = { id: cartItemId, product: item, quantity, customizedIngredients: ingredientsForCart, selectedOptions, restaurant };















        setCart([newCartItem]);















      } else {















        setCart(prevCart => {















          const existingItem = prevCart.find(cartItem => cartItem.id === cartItemId);















          if (existingItem) {















            return prevCart.map(cartItem =>















              cartItem.id === cartItemId















                ? { ...cartItem, quantity: cartItem.quantity + quantity }















                : cartItem















            );















          }















          return [...prevCart, { id: cartItemId, product: item, quantity, customizedIngredients: ingredientsForCart, selectedOptions, restaurant }];















        });















      }































      setIsCartAnimating(true);















      setTimeout(() => setIsCartAnimating(false), 500);















      showToast(isNewCart ? "Carrito anterior eliminado. ¡Nuevo producto añadido!" : "¡Añadido al carrito!", 'success');















    };































    if (cartRestaurantId && cartRestaurantId !== restaurant.id) {















      requestConfirmation(















        'Vaciar Carrito',















        'Ya tienes productos de otro restaurante en tu carrito. ¿Quieres vaciarlo y agregar este nuevo producto?',















        () => addItemToCart(true) // onConfirm















      );















    } else {















      addItemToCart(false);















    }















  };















  const handleUpdateCart = (cartItemId: string, newQuantity: number) => {







    if (newQuantity <= 0) {







      handleRemoveFromCart(cartItemId);







    } else {







      setCart(cart => cart.map(item => item.id === cartItemId ? { ...item, quantity: newQuantity } : item));







    }







  };















  const handleRemoveFromCart = (cartItemId: string) => {







    setCart(cart => cart.filter(item => item.id !== cartItemId));







  };















  const handleConfirmOrder = async (userDetails: OrderUserDetails, deliveryFee: number) => {







    try {







      const order = await confirmarPedido(cart, userDetails, deliveryFee, destinationCoords);
      showToast("¡Pedido recibido! Recibirás una confirmación por WhatsApp.", 'success');
      setCart([]);
      return order;







      setCart([]);







    } catch (error) {







      console.error("Order confirmation failed:", error);







      showToast("Hubo un problema al confirmar el pedido.", 'error');







    }







  };















  const handleModalConfirm = () => {







    if (confirmation?.onConfirm) {







      confirmation.onConfirm();







    }







    setConfirmation(null);







  };















  const handleModalCancel = () => {







    setConfirmation(null);







  };















  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);















  const value = {















    user, userRole, isLoadingAuth, selectedRestaurant, selectedMenuItem, cart, toastMessage, toastType, isSidebarOpen, cartItemCount, isCartAnimating, profile, isCustomizationModalOpen, baseFee, isMapsLoaded, loadError,















    isProductModalOpen,















    isAddressModalOpen,































    bottomNavCustomContent,















    selectedPaymentMethod,







    destinationCoords,















    toggleSidebar, showToast, requestConfirmation, handleLogin, handleLogout, handleSelectRestaurant, handleBackToRestaurants, handleSelectMenuItem, handleBackToMenu, handleAddToCart, handleUpdateCart, handleRemoveFromCart, handleConfirmOrder, setIsCustomizationModalOpen,















    setIsProductModalOpen,















    setIsAddressModalOpen,















    isBottomNavVisible,
    setBottomNavVisible: setIsBottomNavVisible,















    setBottomNavCustomContent,















    handleSetPaymentMethod,

    setDestinationCoords,

    setSelectedRestaurant,

    activeOrderId,
    setActiveOrderId,
    isActiveOrderLoaded







  };



  return (

    <AppContext.Provider value={value}>

      {children}

      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />

      {confirmation && (

        <ConfirmModal

          isOpen={confirmation.isOpen}

          title={confirmation.title}

          message={confirmation.message}

          onConfirm={handleModalConfirm}

          onCancel={handleModalCancel}

          confirmText="Sí, vaciar"

          cancelText="No, cancelar"

        />

      )}

    </AppContext.Provider>

  );

};



export const useAppContext = () => {

  const context = useContext(AppContext);

  if (context === undefined) {

    throw new Error('useAppContext must be used within an AppProvider');

  }

  return context;

};
