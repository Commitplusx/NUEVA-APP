
import React from 'react';

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
  name:string;
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

export type Page = 'home' | 'request' | 'restaurants' | 'restaurantDetail' | 'productDetail' | 'cart' | 'admin';

export type UserRole = 'admin' | 'user' | 'guest' | null;
