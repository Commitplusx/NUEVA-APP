import { CartItem, Restaurant, Service, Tariff, ServiceRequest, Profile, OrderUserDetails, Order, Category } from '../types';
import { supabase } from './supabase';
import { getPublicImageUrl } from './denormalize';

// --- Profile Services ---
export const getProfile = async (): Promise<Profile> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') { // PGRST116: no rows found
    console.error('Error fetching profile:', error);
    console.error('Supabase fetch error details:', error.message, error.details, error.hint); // Added detailed logging
    throw error;
  }

  // If no profile is found, return a default profile object with the user_id
  if (!data) {
    return {
      user_id: user.id,
      full_name: '',
      street_address: '',
      neighborhood: '',
      city: '',
      postal_code: '',
      lat: null,
      lng: null,
      avatar: '',
      phone: '',
    };
  }

  return data;
};

export const updateProfile = async (profile: Partial<Profile>): Promise<Profile> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const updates: Partial<Profile> = {
    ...profile,
    user_id: user.id,
    updated_at: new Date().toISOString(),
  };

  // Ensure 'avatar_url' is not sent, as the column is now 'avatar'
  if ('avatar_url' in updates) {
    delete (updates as any).avatar_url;
  }

  // Explicitly remove 'avatar' from updates as per new requirement
  if ('avatar' in updates) {
    delete (updates as any).avatar;
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert(updates, { onConflict: 'user_id' }) // Specify onConflict for upsert
    .select();

  if (error) {
    console.error('Error updating profile:', error);
    console.error('Supabase update error details:', error.message, error.details, error.hint);
    console.error('Supabase update error object:', error); // Added this line
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
 * REAL ORDER CONFIRMATION
 * Sends an order to the Supabase backend.
 * @param {CartItem[]} cart - The items in the user's cart.
 * @param {OrderUserDetails} userDetails - The user's details for the order.
 * @returns {Promise<Order>} - A promise that resolves with the newly created order.
 */
export const confirmarPedido = async (cart: CartItem[], userDetails: OrderUserDetails, deliveryFee: number): Promise<Order> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  if (!userDetails.phone || cart.length === 0) {
    throw new Error("Phone number and cart items are required.");
  }

  const subtotalAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalAmount = subtotalAmount + deliveryFee;
  const restaurantId = cart.length > 0 ? cart[0].restaurant.id : null;

  // 1. Create the order
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      customer_name: userDetails.name,
      customer_phone: userDetails.phone,
      delivery_address: `${userDetails.address}, ${userDetails.neighborhood}, ${userDetails.postalCode}`,
      total_amount: totalAmount,
      delivery_fee: deliveryFee,
      restaurant_id: restaurantId,
      status: 'pending',
    })
    .select()
    .single();

  if (orderError) {
    console.error('Error creating order in Supabase:', orderError);
    throw orderError;
  }

  const order = orderData as Order;

  // 2. Create the order items
  const orderItems = cart.map(item => ({
    order_id: order.id,
    menu_item_id: item.product.id,
    quantity: item.quantity,
    price: item.product.price,
    customized_ingredients: item.customizedIngredients,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    console.error('Error creating order items in Supabase:', itemsError);
    // Optionally, you might want to delete the order here if items fail to be created
    await supabase.from('orders').delete().eq('id', order.id);
    throw itemsError;
  }

  console.log('Order confirmed for:', { userDetails, cart });
  return order;
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

export const updateServiceRequestStatus = async (id: string, status: string): Promise<ServiceRequest> => {
  const { data, error } = await supabase
    .from('service_requests')
    .update({ status })
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating service request status:', error);
    throw error;
  }

  return data[0];
};

// --- Geocoding Service ---
export const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  if (!address) return null;

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("Google Maps API key is missing. Make sure it's in your .env file as VITE_GOOGLE_MAPS_API_KEY.");
    return null;
  }

  // Bias the search towards the specific region
  const biasedAddress = `${address}, Comitán de Domínguez, Chiapas, Mexico`;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(biasedAddress)}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Geocoding API returned status ${response.status}`);
    }
    const data = await response.json();
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    } else {
      console.warn(`Geocoding failed for address: "${address}". Status: ${data.status}`);
      if (data.error_message) {
        console.error(`Google API Error: ${data.error_message}`);
      }
      return null;
    }
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};

export const reverseGeocodeCoordinates = async (lat: number, lng: number): Promise<{ street_address: string; neighborhood: string; city: string; postal_code: string; } | null> => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("Google Maps API key is missing.");
    return null;
  }

  // 1. Intenta con Places API a través del proxy local para evitar CORS
  const placesUrl = `/api/google-places-proxy?lat=${lat}&lng=${lng}`;
  try {
    const placesResponse = await fetch(placesUrl);
    const placesData = await placesResponse.json();

    if (placesData.status === 'OK' && placesData.results.length > 0) {
      const place = placesData.results[0];
      const placeName = place.name;
      const vicinity = place.vicinity; // La dirección aproximada que da Places API

      // Places API no da todos los componentes de dirección, así que los obtenemos con Geocoding
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=es`;
      const geocodeResponse = await fetch(geocodeUrl);
      const geocodeData = await geocodeResponse.json();

      if (geocodeData.status === 'OK' && geocodeData.results.length > 0) {
        const addressComponents = geocodeData.results[0].address_components;
        const neighborhood = addressComponents.find(c => c.types.includes('neighborhood'))?.long_name || '';
        const city = addressComponents.find(c => c.types.includes('locality'))?.long_name || '';
        const postal_code = addressComponents.find(c => c.types.includes('postal_code'))?.long_name || '';

        // Combina el nombre del lugar con su dirección si son diferentes
        const street_address = (vicinity && !placeName.includes(vicinity.split(',')[0]))
          ? `${placeName}, ${vicinity}`
          : placeName;

        return {
          street_address,
          neighborhood,
          city,
          postal_code,
        };
      }
    }
  } catch (error) {
    console.error("Places API call failed, falling back to geocoding.", error);
  }

  // 2. Si Places API falla o no da resultados, usa el método de Geocoding anterior como respaldo
  console.log("Fallback to Geocoding API");
  const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=es`;
  try {
    const response = await fetch(geocodeUrl);
    const data = await response.json();
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const result = data.results[0];
      const addressComponents = result.address_components;
      
      const neighborhood = addressComponents.find(c => c.types.includes('neighborhood'))?.long_name || '';
      const city = addressComponents.find(c => c.types.includes('locality'))?.long_name || '';
      const postal_code = addressComponents.find(c => c.types.includes('postal_code'))?.long_name || '';

      let street_address = '';
      const fullFormattedAddress = result.formatted_address;

      if (city && fullFormattedAddress.includes(city)) {
        street_address = fullFormattedAddress.substring(0, fullFormattedAddress.indexOf(city)).replace(/,\s*$/, '').trim();
      } else {
        street_address = fullFormattedAddress.split(',')[0];
      }

      if (!street_address && data.results.length > 1) {
         street_address = data.results[1].formatted_address.split(',')[0];
      }

      return { street_address, neighborhood, city, postal_code };
    }
  } catch (error) {
    console.error("Reverse geocoding error:", error);
  }

  return null; // Devuelve null si todo falla
};
