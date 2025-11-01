import { CartItem, Restaurant, Service, Tariff, ServiceRequest } from '../types';
import { supabase } from './supabase';

/**
 * This file contains services to interact with external APIs,
 * including a mock order confirmation.
 */

/**
 * GET SERVICES
 * Fetches the list of services from Supabase.
 * @returns {Promise<Service[]>} - A promise that resolves with the list of services.
 */
export const getServices = async (): Promise<Service[]> => {
  const { data, error } = await supabase
    .from('services')
    .select('*');

  if (error) {
    console.error('Error fetching services:', error);
    throw error;
  }

  return data;
};


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
export const addRestaurant = async (restaurant: any): Promise<Restaurant> => {
  const { data, error } = await supabase
    .from('restaurants')
    .insert([restaurant])
    .select();

  if (error) {
    console.error('Error adding restaurant:', JSON.stringify(error, null, 2));
    throw error;
  }

  return data[0];
};

export const updateRestaurant = async (id: number, updates: any): Promise<Restaurant> => {
  const { data, error } = await supabase
    .from('restaurants')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating restaurant:', JSON.stringify(error, null, 2));
    throw error;
  }

  return data[0];
};

export const updateRestaurantCategories = async (restaurantId: number, categoryIds: number[]): Promise<void> => {
  // First, delete existing relationships
  const { error: deleteError } = await supabase
    .from('restaurant_categories')
    .delete()
    .eq('restaurant_id', restaurantId);

  if (deleteError) {
    console.error('Error deleting restaurant categories:', deleteError);
    throw deleteError;
  }

  // Then, insert new relationships
  const newLinks = categoryIds.map(categoryId => ({ restaurant_id: restaurantId, category_id: categoryId }));
  const { error: insertError } = await supabase
    .from('restaurant_categories')
    .insert(newLinks);

  if (insertError) {
    console.error('Error inserting restaurant categories:', insertError);
    throw insertError;
  }
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

export const uploadImage = async (file: File): Promise<string> => {
  const fileName = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from('restaurant-images')
    .upload(fileName, file);

  if (error) {
    console.error('Error uploading image:', error);
    throw new Error('Error al subir la imagen.');
  }

  const { data: publicUrlData } = supabase.storage
    .from('restaurant-images')
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
};

// --- Category Services ---
export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase.from('categories').select('*');
  if (error) throw error;
  return data;
};

export const addCategory = async (category: Omit<Category, 'id'>): Promise<Category> => {
  const { data, error } = await supabase.from('categories').insert([category]).select();
  if (error) throw error;
  return data[0];
};

export const updateCategory = async (id: number, updates: Partial<Category>): Promise<Category> => {
  const { data, error } = await supabase.from('categories').update(updates).eq('id', id).select();
  if (error) throw error;
  return data[0];
};

export const deleteCategory = async (id: number): Promise<void> => {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
};

// --- Tariff Services ---
export const getTariffs = async (): Promise<Tariff[]> => {
  const { data, error } = await supabase.from('tariffs').select('*');
  if (error) throw error;
  return data;
};

export const addTariff = async (tariff: Omit<Tariff, 'id'>): Promise<Tariff> => {
  const { data, error } = await supabase.from('tariffs').insert([tariff]).select();
  if (error) throw error;
  return data[0];
};

export const updateTariff = async (id: number, updates: Partial<Tariff>): Promise<Tariff> => {
  const { data, error } = await supabase.from('tariffs').update(updates).eq('id', id).select();
  if (error) throw error;
  return data[0];
};

export const deleteTariff = async (id: number): Promise<void> => {
  const { error } = await supabase.from('tariffs').delete().eq('id', id);
  if (error) throw error;
};

// --- Service Request Services ---
export const getServiceRequests = async (): Promise<ServiceRequest[]> => {
  const { data, error } = await supabase.from('service_requests').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

/**
 * CREATE SERVICE REQUEST
 * Creates a new service request in Supabase.
 * @param {ServiceRequest} request - The service request to create.
 * @returns {Promise<ServiceRequest>} - A promise that resolves with the created service request.
 */
export const createServiceRequest = async (request: ServiceRequest): Promise<ServiceRequest> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("User not authenticated");
    }

    const requestWithUser = { ...request, user_id: user.id };

    const { data, error } = await supabase
        .from('service_requests')
        .insert([requestWithUser])
        .select();

    if (error) {
        console.error('Error creating service request:', error);
        throw error;
    }

    return data[0];
};
