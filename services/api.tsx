import { CartItem, Restaurant } from '../types';
import { supabase } from './supabase';

/**
 * This file contains services to interact with external APIs,
 * including a mock order confirmation.
 */

/**
 * MOCK ORDER CONFIRMATION
 * Simulates sending an order to a backend. In a real app, this would
 * make an HTTP request to a server.
 * @param {CartItem[]} cart - The items in the user's cart.
 * @param {string} phoneNumber - The user's WhatsApp number.
 * @returns {Promise<{success: boolean}>} - A promise that resolves if the order is confirmed.
 */
export const confirmarPedido = async (cart: CartItem[], phoneNumber: string): Promise<{success: boolean}> => {
  console.log("Simulating order confirmation...");
  if (!phoneNumber || cart.length === 0) {
      console.error("Order confirmation failed: Phone number and cart items are required.");
      throw new Error("Phone number and cart items are required.");
  }
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('Order confirmed for:', { phoneNumber, cart });
  // Return a success message
  return { success: true };
};

/**
 * GET RESTAURANTS
 * Fetches the list of restaurants from Supabase.
 * @returns {Promise<Restaurant[]>} - A promise that resolves with the list of restaurants.
 */
export const getRestaurants = async (): Promise<Restaurant[]> => {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*');

  if (error) {
    console.error('Error fetching restaurants:', error);
    throw error;
  }

  return data;
};

/**
 * ADD RESTAURANT
 * Adds a new restaurant to Supabase.
 * @param {Omit<Restaurant, 'id' | 'rating' | 'menu'>} restaurant - The restaurant to add.
 * @returns {Promise<Restaurant>} - A promise that resolves with the added restaurant.
 */
export const addRestaurant = async (restaurant: Omit<Restaurant, 'id' | 'rating' | 'menu'>): Promise<Restaurant> => {
  const { data, error } = await supabase
    .from('restaurants')
    .insert([restaurant])
    .select();

  if (error) {
    console.error('Error adding restaurant:', error);
    throw error;
  }

  return data[0];
};

export const updateRestaurant = async (id: number, updates: Partial<Restaurant>): Promise<Restaurant> => {
  const { data, error } = await supabase
    .from('restaurants')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating restaurant:', error);
    throw error;
  }

  return data[0];
};

export const deleteRestaurant = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('restaurants')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting restaurant:', error);
    throw error;
  }
};
