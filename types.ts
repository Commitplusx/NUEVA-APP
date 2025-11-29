
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
  restaurant_id?: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  rating?: number;
  reviews?: number;
  ingredients?: Ingredient[];
  isPopular?: boolean;
  category?: string;
  category_id?: number;
  customizationOptions?: MenuItemOptionGroup[];
}

export interface MenuItemOption {
  name: string;
  price?: number;
}

export interface MenuItemOptionGroup {
  id: string;
  name: string;
  minSelect: number;
  maxSelect?: number;
  includedItems: number;
  pricePerExtra: number;
  options: MenuItemOption[];
}

export interface Schedule {
  id: string;
  restaurant_id: string;
  day_of_week: number; // 1=Monday, 7=Sunday
  open_time: string;
  close_time: string;
  is_enabled: boolean;
}

export interface Restaurant {
  id: number;
  name: string;
  category?: string;
  imageUrl: string;
  rating: number;
  deliveryFee: number;
  deliveryTime: number;
  // Snake case versions for compatibility
  delivery_fee?: number;
  delivery_time?: number;
  street_address?: string;
  neighborhood?: string;
  city?: string;
  postal_code?: string;
  lat?: number;
  lng?: number;
  categories?: Category[];
  menu?: MenuItem[];
  description?: string;
  is_active?: boolean;
  schedules?: Schedule[];
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
  avatar_url?: string;
  email?: string;
  phone?: string;
  // New fields for detailed address
  address_type?: 'depto' | 'casa' | 'otro'; // Depto., Casa, Otro
  building_name?: string; // Nombre del edificio
  address_line_2?: string; // Depto./Unidad/Piso
  access_code?: string; // Código de acceso
  updated_at?: string;
  fcm_token?: string;
}

export interface OrderUserDetails {
  name: string;
  address: string;
  postalCode: string;
  neighborhood: string;
  phone: string;
}

export interface Ingredient {
  name: string;
  icon: any;
}

export interface Order {
  id: number;
  user_id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  total_amount: number;
  delivery_fee: number;
  restaurant_id: number | null;
  status: string;
  origin_lat?: number | null;
  origin_lng?: number | null;
  destination_lat?: number | null;
  destination_lng?: number | null;
  driver_id?: string | null;
  created_at?: string;
}

export interface Favorite {
  id: number;
  user_id: string;
  menu_item_id: number;
  created_at: string;
  menu_item?: MenuItem; // For joining data
}
