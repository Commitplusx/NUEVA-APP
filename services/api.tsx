import { CartItem, Restaurant, Service, Tariff, ServiceRequest, Profile } from '../types';
import { supabase } from './supabase';
import { getPublicImageUrl } from './denormalize';

// --- Profile Services ---
export const getProfile = async (): Promise<Profile | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116: no rows found
    console.error('Error fetching profile:', error);
    throw error;
  }

  return data;
};

export const updateProfile = async (profile: Partial<Profile>): Promise<Profile> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const updates = {
    ...profile,
    user_id: user.id,
    updated_at: new Date(),
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert(updates)
    .select();

  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }

  return data[0];
};

// Helper function to extract a user-friendly error message from Supabase errors
export const getErrorMessage = (error: any): string => {
  if (error && error.message) {
    // Supabase errors often have a 'message' property
    if (error.code && error.code === '23505') {
      // Unique constraint violation (e.g., duplicate entry)
      return 'Ya existe un registro con esta información. Por favor, verifica los datos.';
    }
    return error.message;
  }
  return 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
};

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
export const confirmarPedido = async (cart: CartItem[], userDetails: OrderUserDetails): Promise<{success: boolean}> => {
  console.log("Simulating order confirmation...");
  if (!userDetails.phone || cart.length === 0) {
      console.error("Order confirmation failed: Phone number and cart items are required.");
      throw new Error("Phone number and cart items are required.");
  }
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('Order confirmed for:', { userDetails, cart });
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
export const addRestaurant = async (restaurant: Omit<Restaurant, 'id' | 'rating' | 'menu' | 'categories'>): Promise<Restaurant> => {
  const restaurantToInsert = { ...restaurant };
  if (restaurantToInsert.imageUrl) {
    restaurantToInsert.imageUrl = getPublicImageUrl(restaurantToInsert.imageUrl);
  }
  const { data, error } = await supabase
    .from('restaurants')
    .insert([restaurantToInsert])
    .select();

  if (error) {
    console.error('Error adding restaurant:', error);
    throw error;
  }

  return data[0];
};

export const updateRestaurant = async (id: number, updates: Partial<Omit<Restaurant, 'categories'>>): Promise<Restaurant> => {
  const updatesToApply = { ...updates };
  if (updatesToApply.imageUrl) {
    updatesToApply.imageUrl = getPublicImageUrl(updatesToApply.imageUrl);
  }
  console.log('Updating restaurant with imageUrl:', updatesToApply.imageUrl);
  const { data, error } = await supabase
    .from('restaurants')
    .update(updatesToApply)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating restaurant:', error);
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
  console.log('Uploading image with fileName:', fileName);
  const { data, error } = await supabase.storage
    .from('restaurant-images')
    .upload(fileName, file);

  if (error && error.message) {
    console.error('Error uploading image:', error);
    throw new Error('Error al subir la imagen: ' + error.message);
  }

  const { data: publicUrlData } = supabase.storage
    .from('restaurant-images')
    .getPublicUrl(data.path);

  console.log('Image uploaded, public URL:', publicUrlData.publicUrl);
  return publicUrlData.publicUrl;
};

// --- Category Services ---
export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase.from('categories').select('*');
  if (error) throw error;
  return data;
};

export const addCategory = async (category: Omit<Category, 'id'>): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .insert([category])
    .select();

  if (error) {
    console.error('Error adding restaurant:', error);
    throw error;
  }

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

// --- Menu Item Services ---
export const getMenuItems = async (restaurantId?: number): Promise<MenuItem[]> => {
  let query = supabase.from('menu_items').select('*');
  if (restaurantId) {
    query = query.eq('restaurant_id', restaurantId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const addMenuItem = async (item: Omit<MenuItem, 'id'>): Promise<MenuItem> => {
  const itemToInsert = { ...item };
  if (itemToInsert.image_url) {
    itemToInsert.image_url = getPublicImageUrl(itemToInsert.image_url);
  }
  const { data, error } = await supabase
    .from('menu_items')
    .insert([itemToInsert])
    .select();

  if (error) {
    console.error('Error adding menu item:', error);
    throw error;
  }

  return data[0];
};

export const updateMenuItem = async (id: number, updates: Partial<MenuItem>): Promise<MenuItem> => {
  const updatesToApply = { ...updates };
  if (updatesToApply.image_url) {
    updatesToApply.image_url = getPublicImageUrl(updatesToApply.image_url);
  }
  const { data, error } = await supabase.from('menu_items').update(updatesToApply).eq('id', id).select();
  if (error) {
    console.error('Error updating menu item:', error);
    throw error;
  }
  return data[0];
};

export const deleteMenuItem = async (id: number): Promise<void> => {
  const { error } = await supabase.from('menu_items').delete().eq('id', id);
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

// --- Geocoding Service ---
export const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  if (!address) return null;
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error(`Nominatim API returned status ${response.status}`);
    }
    const data = await response.json();
    if (data && data.length > 0) {
      const { lat, lon } = data[0];
      return { lat: parseFloat(lat), lng: parseFloat(lon) };
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};
