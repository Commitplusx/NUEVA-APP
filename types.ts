
import React from 'react';



// --- Types ---



// Database-related types

export interface Category {

  id: number;

  name: string;

  icon: string;

}



export interface Ingredient {

  name: string;

  icon: string; // Icon name as a string

}



export interface MenuItem {

  id: number;

  restaurant_id: number;

  name: string;

  description: string;

  price: number;

  image_url?: string;

  rating?: number;

  reviews?: number;

  ingredients?: Ingredient[];

  is_popular?: boolean;

}



export interface Restaurant {

  id: number;

  name: string;

  image_url: string;

  rating: number;

  delivery_fee: number;

  delivery_time: number;

  // Denormalized for easier access in the frontend

  categories?: Category[]; 

  menu?: MenuItem[];

}



// Frontend-specific types

export interface CartItem {

  id: string; // Unique identifier for product + customization combo

  product: MenuItem;

  quantity: number;

  customizedIngredients: Ingredient[];

}



export type Page = 'home' | 'request' | 'restaurants' | 'restaurantDetail' | 'productDetail' | 'cart' | 'admin' | 'login';



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

    tariff_id: number;

    user_id?: string;

    scheduled_at?: string | null;

    status?: string;

}


