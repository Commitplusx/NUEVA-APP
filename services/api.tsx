/// <reference types="vite/client" />
import { CartItem, Restaurant, Service, Tariff, ServiceRequest, Profile, OrderUserDetails, Order, Category, MenuItem } from '../types';
import { supabase } from './supabase';
import { getPublicImageUrl } from './denormalize';
import { Capacitor } from '@capacitor/core';

// --- Geocoding Services (Reescrito para Mapbox) ---

const MAPBOX_API_KEY = import.meta.env.VITE_MAPBOX_TOKEN;

export const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  console.log('Checking MAPBOX_API_KEY:', MAPBOX_API_KEY ? 'Defined' : 'Undefined'); // DEBUG LOG
  if (!address || !MAPBOX_API_KEY) return null;

  const biasedAddress = `${address}, Comitán de Domínguez, Chiapas, Mexico`;
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(biasedAddress)}.json?access_token=${MAPBOX_API_KEY}&country=MX&limit=1`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Mapbox Geocoding API returned status ${response.status}`);
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      return { lat, lng };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Mapbox Geocoding error:", error);
    return null;
  }
};

export const reverseGeocode = async (lat: number, lng: number): Promise<{
  address: string;
  neighborhood: string;
  postalCode: string;
  city: string;
  state: string;
} | null> => {
  console.log('reverseGeocode called with:', { lat, lng }); // DEBUG LOG
  if (!MAPBOX_API_KEY) return null;

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Mapbox Reverse Geocoding API returned status ${response.status}`);
    const data = await response.json();
    console.log('Mapbox Reverse Geocode Response:', data); // DEBUG LOG

    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const context = feature.context || [];

      let neighborhood = '';
      let postalCode = '';
      let city = '';
      let state = '';

      // Mapbox context types: neighborhood, postcode, place, region, country
      context.forEach((c: any) => {
        if (c.id.startsWith('neighborhood')) neighborhood = c.text;
        if (c.id.startsWith('postcode')) postalCode = c.text;
        if (c.id.startsWith('place')) city = c.text;
        if (c.id.startsWith('region')) state = c.text;
        if (c.id.startsWith('locality') && !neighborhood) neighborhood = c.text; // Fallback to locality if neighborhood is missing
      });

      // If neighborhood is still empty, try to use the city or a part of the address
      if (!neighborhood && city) {
        // Sometimes small towns don't have defined neighborhoods in Mapbox, so we might leave it empty or use the city name as a fallback if desired.
        // For now, we'll leave it empty to allow user input, or we could try to parse it from the place_name.
      }

      const result = {
        address: feature.place_name.split(',')[0], // Just the street address
        neighborhood,
        postalCode,
        city,
        state
      };
      console.log('Parsed Address Data:', result); // DEBUG LOG
      return result;
    }
  } catch (error) {
    console.error("Mapbox Reverse Geocoding error:", error);
  }

  return null;
};


// --- El resto de los servicios (sin cambios) ---

export const getProfile = async (): Promise<Profile> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

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

  if ('avatar_url' in updates) {
    delete (updates as any).avatar_url;
  }

  if ('avatar' in updates) {
    delete (updates as any).avatar;
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert(updates, { onConflict: 'user_id' })
    .select();

  if (error) {
    throw error;
  }

  return data[0];
};

export const getErrorMessage = (error: any): string => {
  if (error && error.message) {
    if (error.code && error.code === '23505') {
      return 'Ya existe un registro con esta información. Por favor, verifica los datos.';
    }
    return error.message;
  }
  return 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
};

export const getServices = async (): Promise<Service[]> => {
  const { data, error } = await supabase.from('services').select('*');
  if (error) throw error;
  return data;
};

export const confirmarPedido = async (cart: CartItem[], userDetails: OrderUserDetails, deliveryFee: number, destinationCoords: { lat: number; lng: number } | null): Promise<Order> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  if (!userDetails.phone || cart.length === 0) {
    throw new Error("Phone number and cart items are required.");
  }

  const subtotalAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalAmount = subtotalAmount + deliveryFee;
  const restaurantId = cart.length > 0 ? cart[0].restaurant.id : null;

  let originLat = null;
  let originLng = null;

  if (restaurantId) {
    const { data: restaurantData } = await supabase
      .from('restaurants')
      .select('lat, lng')
      .eq('id', restaurantId)
      .single();

    if (restaurantData) {
      originLat = restaurantData.lat;
      originLng = restaurantData.lng;
    }
  }

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
      origin_lat: originLat,
      origin_lng: originLng,
      destination_lat: destinationCoords?.lat,
      destination_lng: destinationCoords?.lng,
    })
    .select()
    .single();

  if (orderError) {
    throw orderError;
  }

  const order = orderData as Order;

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
    await supabase.from('orders').delete().eq('id', order.id);
    throw itemsError;
  }

  return order;
};

export const getRestaurants = async (): Promise<Restaurant[]> => {
  const { data, error } = await supabase.from('restaurants').select('*');
  if (error) throw error;
  return data;
};

export const addRestaurant = async (restaurant: Omit<Restaurant, 'id' | 'rating' | 'menu' | 'categories'>): Promise<Restaurant> => {
  const restaurantToInsert: any = {
    name: restaurant.name,
    image_url: restaurant.imageUrl,
    delivery_fee: restaurant.deliveryFee,
    delivery_time: restaurant.deliveryTime,
    street_address: restaurant.street_address,
    neighborhood: restaurant.neighborhood,
    city: restaurant.city,
    postal_code: restaurant.postal_code,
    lat: restaurant.lat,
    lng: restaurant.lng,
    rating: 0
  };

  if (restaurantToInsert.image_url) {
    restaurantToInsert.image_url = getPublicImageUrl(restaurantToInsert.image_url);
  }
  const { data, error } = await supabase
    .from('restaurants')
    .insert([restaurantToInsert])
    .select();

  if (error) throw error;
  return data[0];
};

export const updateRestaurant = async (id: number, updates: Partial<Omit<Restaurant, 'categories'>>): Promise<Restaurant> => {
  const updatesToApply: any = { ...updates };

  // Map camelCase to snake_case for DB
  if (updates.imageUrl !== undefined) {
    updatesToApply.image_url = getPublicImageUrl(updates.imageUrl);
    delete updatesToApply.imageUrl;
  }
  if (updates.deliveryFee !== undefined) {
    updatesToApply.delivery_fee = updates.deliveryFee;
    delete updatesToApply.deliveryFee;
  }
  if (updates.deliveryTime !== undefined) {
    updatesToApply.delivery_time = updates.deliveryTime;
    delete updatesToApply.deliveryTime;
  }

  const { data, error } = await supabase
    .from('restaurants')
    .update(updatesToApply)
    .eq('id', id)
    .select();

  if (error) throw error;
  return data[0];
};

export const updateRestaurantCategories = async (restaurantId: number, categoryIds: number[]): Promise<void> => {
  await supabase.from('restaurant_categories').delete().eq('restaurant_id', restaurantId);
  const newLinks = categoryIds.map(categoryId => ({ restaurant_id: restaurantId, category_id: categoryId }));
  const { error } = await supabase.from('restaurant_categories').insert(newLinks);
  if (error) throw error;
};

export const deleteRestaurant = async (id: number): Promise<void> => {
  const { error } = await supabase.from('restaurants').delete().eq('id', id);
  if (error) throw error;
};

export const uploadImage = async (file: File): Promise<string> => {
  const fileName = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from('restaurant-images')
    .upload(fileName, file);

  if (error) {
    throw new Error('Error al subir la imagen: ' + error.message);
  }

  const { data: publicUrlData } = supabase.storage
    .from('restaurant-images')
    .getPublicUrl(data!.path);

  return publicUrlData.publicUrl;
};

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

export const getMenuItems = async (restaurantId?: number): Promise<MenuItem[]> => {
  let query = supabase.from('menu_items').select('*');
  if (restaurantId) {
    query = query.eq('restaurant_id', restaurantId);
  }
  const { data, error } = await query;
  if (error) throw error;

  // Map snake_case to camelCase for frontend
  return data.map((item: any) => ({
    ...item,
    customizationOptions: item.customization_options || [],
  }));
};

export const addMenuItem = async (item: Omit<MenuItem, 'id'>): Promise<MenuItem> => {
  const itemToInsert: any = { ...item };

  // Map camelCase to snake_case for DB
  if (itemToInsert.imageUrl) {
    itemToInsert.imageUrl = getPublicImageUrl(itemToInsert.imageUrl);
  }
  if (itemToInsert.customizationOptions !== undefined) {
    itemToInsert.customization_options = itemToInsert.customizationOptions;
    delete itemToInsert.customizationOptions;
  }

  const { data, error } = await supabase.from('menu_items').insert([itemToInsert]).select();
  if (error) throw error;
  return data[0];
};

export const updateMenuItem = async (id: number, updates: Partial<MenuItem>): Promise<MenuItem> => {
  const updatesToApply: any = { ...updates };

  // Map camelCase to snake_case for DB
  if (updatesToApply.imageUrl) {
    updatesToApply.imageUrl = getPublicImageUrl(updatesToApply.imageUrl);
  }
  if (updatesToApply.customizationOptions !== undefined) {
    updatesToApply.customization_options = updatesToApply.customizationOptions;
    delete updatesToApply.customizationOptions;
  }

  const { data, error } = await supabase.from('menu_items').update(updatesToApply).eq('id', id).select();
  if (error) throw error;
  return data[0];
};

export const deleteMenuItem = async (id: number): Promise<void> => {
  const { error } = await supabase.from('menu_items').delete().eq('id', id);
  if (error) throw error;
};

export const getServiceRequests = async (): Promise<ServiceRequest[]> => {
  const { data, error } = await supabase.from('service_requests').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const createServiceRequest = async (request: ServiceRequest): Promise<ServiceRequest> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");
  const requestWithUser = { ...request, user_id: user.id };
  const { data, error } = await supabase.from('service_requests').insert([requestWithUser]).select();
  if (error) throw error;
  return data[0];
};

export const updateServiceRequestStatus = async (id: string, status: string): Promise<ServiceRequest> => {
  const { data, error } = await supabase.from('service_requests').update({ status }).eq('id', id).select();
  if (error) throw error;
  return data[0];
};

interface MapPoint {
  latitude: number;
  longitude: number;
}

export const calculateAndShowNativeRoute = async (
  origin: MapPoint,
  destination: MapPoint
): Promise<number | null> => {
  if (Capacitor.getPlatform() === 'web') {
    console.warn("Navegación web no disponible sin Google Maps");
    return null;
  }

  try {
    // Acceder al plugin NativeMap registrado en MainActivity.java
    const NativeMap = (Capacitor as any).Plugins.NativeMap;

    if (!NativeMap) {
      throw new Error('Plugin NativeMap no está disponible');
    }

    const result = await NativeMap.calculateRoute({ origin, destination });
    const distance = result?.distance || null;
    return distance;
  } catch (error) {
    console.error('Error al calcular o mostrar la ruta nativa:', error);
    return null;
  }
};
