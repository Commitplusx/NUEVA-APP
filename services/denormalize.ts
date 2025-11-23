import { supabase } from './supabase';
import { SaltIcon } from '../components/icons';
import { Restaurant, Category, MenuItem } from '../types';

export const getPublicImageUrl = (imagePath: string): string => {
  console.log('getPublicImageUrl: received imagePath:', imagePath);
  if (!imagePath || imagePath.startsWith('http')) {
    console.log('getPublicImageUrl: imagePath is already a full URL or empty, returning as is.', imagePath);
    return imagePath; // Already a full URL or empty
  }
  // Assuming 'restaurant-images' is the bucket name
  const { data } = supabase.storage.from('restaurant-images').getPublicUrl(imagePath);
  const publicUrlWithCacheBuster = `${data.publicUrl}?t=${new Date().getTime()}`;
  console.log('getPublicImageUrl: constructed publicUrl with cache buster:', publicUrlWithCacheBuster);
  return publicUrlWithCacheBuster;
};

// Combines data from different tables into a complete Restaurant object
export const denormalizeRestaurants = (
  restaurants: any[],
  categories: any[],
  restaurantCategories: { restaurant_id: number; category_id: number }[],
  menuItems: any[]
): Restaurant[] => {

  const categoryMap = new Map(categories.map((c: any) => [c.id, c]));
  const restaurantMap = new Map(restaurants.map((r: any) => [r.id, { ...r, imageUrl: r.image_url, categories: [], menu: [] }]));

  // Link categories to restaurants
  for (const rc of restaurantCategories) {
    const restaurant = restaurantMap.get(rc.restaurant_id);
    const category = categoryMap.get(rc.category_id);
    if (restaurant && category) {
      restaurant.categories.push(category);
    }
  }

  // Link menu items to restaurants
  for (const item of menuItems) {
    const restaurant = restaurantMap.get(item.restaurant_id);
    if (restaurant) {
      // Parse ingredients if they are in JSON string format
      if (typeof item.ingredients === 'string') {
        try {
          item.ingredients = JSON.parse(item.ingredients);
        } catch (error) {
          // If parsing fails, assume it's a comma-separated string
          item.ingredients = item.ingredients.split(',').map((name: string) => ({ name: name.trim(), icon: SaltIcon }));
        }
      }
      restaurant.menu.push({
        ...item,
        imageUrl: getPublicImageUrl(item.image_url || item.imageUrl || ''),
        customizationOptions: item.customization_options || [],
      });
    }
  }

  return Array.from(restaurantMap.values()).map((r: any) => ({
    ...r,
    imageUrl: getPublicImageUrl(r.imageUrl),
  }));
};

// Helper function to denormalize restaurant data (similar to useRestaurants)
export const denormalizeRestaurant = (
  restaurant: any,
  categories: any[],
  restaurantCategories: { restaurant_id: number; category_id: number }[],
  menuItems: any[]
): Restaurant | null => {
  if (!restaurant) return null;

  const categoryMap = new Map(categories.map((c: any) => [c.id, c]));
  const restaurantWithDetails: Restaurant = { ...restaurant, imageUrl: restaurant.image_url, categories: [], menu: [] };

  // Link categories to restaurant
  for (const rc of restaurantCategories) {
    if (rc.restaurant_id === restaurant.id) {
      const category = categoryMap.get(rc.category_id);
      if (category) {
        restaurantWithDetails.categories.push(category);
      }
    }
  }

  // Link menu items to restaurant
  for (const item of menuItems) {
    if (item.restaurant_id === restaurant.id) {
      // Parse ingredients if they are in JSON string format
      if (typeof item.ingredients === 'string') {
        try {
          item.ingredients = JSON.parse(item.ingredients);
        } catch (error) {
          // If parsing fails, assume it's a comma-separated string
          item.ingredients = item.ingredients.split(',').map((name: string) => ({ name: name.trim(), icon: SaltIcon }));
        }
      }
      restaurantWithDetails.menu.push({
        ...item,
        imageUrl: getPublicImageUrl(item.image_url || item.imageUrl || ''),
        customizationOptions: item.customization_options || [],
      });
    }
  }

  return {
    ...restaurantWithDetails,
    imageUrl: getPublicImageUrl(restaurantWithDetails.imageUrl),
  };
};
