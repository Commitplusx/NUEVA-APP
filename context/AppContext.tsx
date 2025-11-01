import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { confirmarPedido } from '../services/api';
import { Restaurant, MenuItem, CartItem, Ingredient, UserRole } from '../types';
import { Toast, ToastType } from '../components/Toast';

// 1. Define the shape of the context data
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

  // Actions
  toggleSidebar: () => void;
  showToast: (message: string, type: ToastType) => void;
  handleLogin: (username: string, role: UserRole) => void;
  handleLogout: () => void;
  handleSelectRestaurant: (restaurant: Restaurant) => void;
  handleBackToRestaurants: () => void;
  handleSelectMenuItem: (item: MenuItem) => void;
  handleBackToMenu: () => void;
  handleAddToCart: (item: MenuItem, quantity: number, customizedIngredients: Ingredient[]) => void;
  handleUpdateCart: (cartItemId: string, newQuantity: number) => void;
  handleRemoveFromCart: (cartItemId: string) => void;
  handleConfirmOrder: (phoneNumber: string) => Promise<void>;
}

// 2. Create the context
const AppContext = createContext<AppContextType | undefined>(undefined);

// 3. Create the Provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('guest');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<ToastType>('success');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCartAnimating, setIsCartAnimating] = useState(false);

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

    // Initial check for session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user.email || null);
        setUserRole(session.user.email?.endsWith('@admin.com') ? 'admin' : 'user');
      }
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

  const handleLogin = (username: string, role: UserRole) => {
    setUser(username);
    setUserRole(role);
    showToast(`¡Bienvenido, ${username}!`, 'success');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserRole('guest');
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

  const handleAddToCart = (item: MenuItem, quantity: number, customizedIngredients: Ingredient[]) => {
    const cartItemId = `${item.id}-${customizedIngredients.map(i => i.name).sort().join('-')}`;
    
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === cartItemId);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === cartItemId
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      } else {
        setIsCartAnimating(true);
        setTimeout(() => setIsCartAnimating(false), 500); // Animation duration
      }
      return [...prevCart, { id: cartItemId, product: item, quantity, customizedIngredients }];
    });
    showToast("¡Añadido al carrito!", 'success');
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

  const handleConfirmOrder = async (phoneNumber: string) => {
    try {
      await confirmarPedido(cart, phoneNumber);
      showToast("¡Pedido recibido! Recibirás una confirmación por WhatsApp.", 'success');
      setCart([]);
    } catch (error) {
      console.error("Order confirmation failed:", error);
      showToast("Hubo un problema al confirmar el pedido.", 'error');
    }
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const value = {
    user, userRole, selectedRestaurant, selectedMenuItem, cart, toastMessage, toastType, isSidebarOpen, cartItemCount, isCartAnimating,
    toggleSidebar, showToast, handleLogin, handleLogout, handleSelectRestaurant, handleBackToRestaurants, handleSelectMenuItem, handleBackToMenu, handleAddToCart, handleUpdateCart, handleRemoveFromCart, handleConfirmOrder
  };

  return (
    <AppContext.Provider value={value}>
      {children}
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />
    </AppContext.Provider>
  );
};

// 4. Create a custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};