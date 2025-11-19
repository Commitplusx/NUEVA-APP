
import React from 'react';

// --- Types ---

// Database-related types

export interface Category {
  id: number;
  name: string;
  icon: string;
}

export interface MenuItem {
  id: number;
  restaurant_id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  rating?: number;
  reviews?: number;
  ingredients?: string[];
  isPopular?: boolean;
}

export interface Restaurant {
  id: number;
  name: string;
  imageUrl: string;
  rating: number;
  deliveryFee: number;
  deliveryTime: number;
  street_address?: string;
  neighborhood?: string;
  city?: string;
  postal_code?: string;
  lat?: number;
  lng?: number;
  categories?: Category[]; 
  menu?: MenuItem[];
}

// Frontend-specific types

export interface CartItem {
  id: string; // Unique identifier for product + customization combo
  product: MenuItem;
  quantity: number;
  customizedIngredients: Ingredient[];
  restaurant: Restaurant;
}

export type Page = 'home' | 'request' | 'restaurants' | 'restaurantDetail' | 'productDetail' | 'cart' | 'admin' | 'login';

export type PaymentMethodType = string;

export type UserRole = 'admin' | 'user' | 'guest' | null;

export interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface Tariff {
  id: number;
  name: string;
  price: number;
  icon: string;
}

export interface ServiceRequest {
    id?: number;
    origin: string;
    destination: string;
    description: string;
    price?: number;
    distance?: number;
    user_id?: string;
    scheduled_at?: string | null;
    status?: string;
    phone?: string;
    origin_lat?: number;
    origin_lng?: number;
    destination_lat?: number;
    destination_lng?: number;
}

export interface Profile {
  user_id: string;
  full_name?: string;
  street_address?: string;
  neighborhood?: string;
  city?: string;
  postal_code?: string;
  lat?: number;
  lng?: number;
  avatar?: string;
  email?: string;
  phone?: string;
  // New fields for detailed address
  address_type?: 'depto' | 'casa' | 'otro'; // Depto., Casa, Otro
  building_name?: string; // Nombre del edificio
  address_line_2?: string; // Depto./Unidad/Piso
  access_code?: string; // Código de acceso
}

export interface OrderUserDetails {
  name: string;
  address: string;
  postalCode: string;
  neighborhood: string;
  phone: string;
}
