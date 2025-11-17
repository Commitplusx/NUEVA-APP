/**
 * @file AppContext.tsx
 * @description Define el contexto global de la aplicación para gestionar el estado compartido
 * como la autenticación del usuario, el carrito de compras, el restaurante y el artículo seleccionados,
 * y las notificaciones Toast. Proporciona un proveedor (`AppProvider`) y un hook (`useAppContext`)
 * para acceder a este estado y a las funciones para modificarlo.
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import { useJsApiLoader } from '@react-google-maps/api';

import { supabase } from '../services/supabase';

import { confirmarPedido, getTariffs, getProfile } from '../services/api';

import { Restaurant, MenuItem, CartItem, UserRole, Tariff, OrderUserDetails, Profile, PaymentMethodType } from '../types';

import { Toast, ToastType } from '../components/Toast';

import { ConfirmModal } from '../components/ConfirmModal'; // <-- Import new modal

import { User } from '@supabase/supabase-js';



const libraries: ('places' | 'maps')[] = ['places', 'maps'];





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

  

      // Acciones que pueden ser invocadas desde cualquier componente consumidor del contexto

  

      toggleSidebar: () => void;

  

      showToast: (message: string, type: ToastType) => void;

  

      requestConfirmation: (title: string, message: string, onConfirm: () => void) => void;

  

      handleLogin: (username: string, role: UserRole) => void;

  

      handleLogout: () => void;

  

      handleSelectRestaurant: (restaurant: Restaurant) => void;

  

      handleBackToRestaurants: () => void;

  

      handleSelectMenuItem: (item: MenuItem) => void;

  

      handleBackToMenu: () => void;

  

      handleAddToCart: (item: MenuItem, quantity: number, customizedIngredients: string[], restaurant: Restaurant) => void;

  

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



    const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);



    const [cart, setCart] = useState<CartItem[]>([]);



    const [toastMessage, setToastMessage] = useState<string | null>(null);



    const [toastType, setToastType] = useState<ToastType>('success');



    const [isSidebarOpen, setIsSidebarOpen] = useState(false);



    const [isCartAnimating, setIsCartAnimating] = useState(false);



    const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false);



        const [isProductModalOpen, setIsProductModalOpen] = useState(false);



        const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);



        const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType>('cash');



    



        const [baseFee, setBaseFee] = useState(45);



    



            const [profile, setProfile] = useState<Profile | null>(null);



    



                    const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null);



    



                    const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);



    



                    const [bottomNavCustomContent, setBottomNavCustomContent] = useState<ReactNode | null>(null);



    



              



                const { isLoaded: isMapsLoaded, loadError } = useJsApiLoader({



                  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',



                  libraries,



                });



    



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



          



            const handleAddToCart = (item: MenuItem, quantity: number, customizedIngredients: string[], restaurant: Restaurant) => {



          



                          const cartRestaurantId = cart.length > 0 ? cart[0].restaurant.id : null;



          



                      



          



                          const addItemToCart = (isNewCart = false) => {



          



                            // ID se genera a partir del array de strings, que es correcto



          



                            const cartItemId = `${item.id}-${customizedIngredients.sort().join('-')}`;



          



                            



          



                            // Convertimos el string[] de vuelta a Ingredient[] para que sea compatible con el estado del carrito



          



                            const ingredientsForCart: Ingredient[] = customizedIngredients.map(name => ({ name, icon: '' }));



          



            



          



                            if (isNewCart) {



          



                              const newCartItem = { id: cartItemId, product: item, quantity, customizedIngredients: ingredientsForCart, restaurant };



          



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



          



                                return [...prevCart, { id: cartItemId, product: item, quantity, customizedIngredients: ingredientsForCart, restaurant }];



          



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



                await confirmarPedido(cart, userDetails, deliveryFee);



                showToast("¡Pedido recibido! Recibirás una confirmación por WhatsApp.", 'success');



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



          



                                  isBottomNavVisible,



          



                                  bottomNavCustomContent,



          



                                  selectedPaymentMethod,



          



                                  toggleSidebar, showToast, requestConfirmation, handleLogin, handleLogout, handleSelectRestaurant, handleBackToRestaurants, handleSelectMenuItem, handleBackToMenu, handleAddToCart, handleUpdateCart, handleRemoveFromCart, handleConfirmOrder, setIsCustomizationModalOpen,



          



                                  setIsProductModalOpen,



          



                                  setIsAddressModalOpen,



          



                                  setBottomNavVisible: setIsBottomNavVisible,



          



                                  setBottomNavCustomContent,



          



                                  handleSetPaymentMethod



          



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
