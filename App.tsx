import React, { useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { Home } from './components/Home';
import { RequestService } from './components/RequestService';
import { Restaurants } from './components/Restaurants';
import { RestaurantDetail } from './components/RestaurantDetail';
import { ProductDetail } from './components/ProductDetail';
import { Cart } from './components/Cart';
import { Toast } from './components/Toast';
import { SupportChat } from './components/SupportChat';
import { confirmarPedido } from './services/api';

// --- Types ---
export interface Ingredient {
  name: string;
  icon: React.FC<{className?: string}>;
}
export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  rating?: number;
  reviews?: number;
  ingredients?: Ingredient[];
  isPopular?: boolean;
}

export interface Restaurant {
  id: number;
  name: string;
  category: string;
  imageUrl: string;
  rating: number;
  deliveryFee: string;
  deliveryTime: string;
  menu: MenuItem[];
}

export interface CartItem {
  id: string; // Unique identifier for product + customization combo
  product: MenuItem;
  quantity: number;
  customizedIngredients: Ingredient[];
}

export type Page = 'home' | 'request' | 'restaurants' | 'restaurantDetail' | 'productDetail' | 'cart' | 'support';


const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('restaurants');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000); // Hide after 3 seconds
  };

  const handleSelectRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setCurrentPage('restaurantDetail');
  };
  
  const handleBackToRestaurants = () => {
    setSelectedRestaurant(null);
    setCurrentPage('restaurants');
  };

  const handleSelectMenuItem = (item: MenuItem) => {
    setSelectedMenuItem(item);
    setCurrentPage('productDetail');
  };

  const handleBackToMenu = () => {
    setSelectedMenuItem(null);
    setCurrentPage('restaurantDetail');
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
      }
      return [...prevCart, { id: cartItemId, product: item, quantity, customizedIngredients }];
    });
    showToast("¡Añadido al carrito!");
    setCurrentPage('restaurantDetail'); // Go back to menu after adding
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
      showToast("¡Pedido recibido! Recibirás una confirmación por WhatsApp.");
      setCart([]);
      setCurrentPage('restaurants');
    } catch (error) {
      console.error("Order confirmation failed:", error);
      showToast("Hubo un problema al confirmar el pedido.");
    }
  };


  const renderContent = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={() => setCurrentPage('request')} />;
      case 'request':
        return <RequestService />;
      case 'restaurants':
        return <Restaurants onSelectRestaurant={handleSelectRestaurant} />;
      case 'restaurantDetail':
        if (selectedRestaurant) {
          return <RestaurantDetail restaurant={selectedRestaurant} onSelectItem={handleSelectMenuItem} onBack={handleBackToRestaurants} />;
        }
        return <Restaurants onSelectRestaurant={handleSelectRestaurant} />;
      case 'productDetail':
        if (selectedMenuItem && selectedRestaurant) {
          return <ProductDetail item={selectedMenuItem} restaurant={selectedRestaurant} onAddToCart={handleAddToCart} onBack={handleBackToMenu} />
        }
        return <Restaurants onSelectRestaurant={handleSelectRestaurant} />; // Fallback
      case 'cart':
        return <Cart cartItems={cart} onUpdateCart={handleUpdateCart} onNavigate={setCurrentPage} onConfirmOrder={handleConfirmOrder} />;
       case 'support':
        return <SupportChat />;
      default:
        return <Restaurants onSelectRestaurant={handleSelectRestaurant} />;
    }
  };
  
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-gray-200 min-h-screen font-sans flex items-center justify-center">
      <div className="relative w-full max-w-sm h-[844px] max-h-[844px] bg-white shadow-2xl rounded-3xl border-4 border-black overflow-hidden flex flex-col">
        <main className="flex-grow overflow-y-auto bg-gray-50">
           <div key={currentPage} className="animate-fade-in">
             {renderContent()}
           </div>
        </main>
        {currentPage !== 'productDetail' && (
          <BottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} cartItemCount={cartItemCount} />
        )}
        <Toast message={toastMessage} />
      </div>
    </div>
  );
};

export default App;