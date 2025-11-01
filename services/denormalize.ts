import { Restaurant, Category, MenuItem } from '../types';

// Combines data from different tables into a complete Restaurant object
export const denormalizeRestaurants = (
  restaurants: Restaurant[], 
  categories: Category[], 
  restaurantCategories: { restaurant_id: number; category_id: number }[],
  menuItems: MenuItem[]
): Restaurant[] => {
  
  const categoryMap = new Map(categories.map(c => [c.id, c]));
  const restaurantMap = new Map(restaurants.map(r => [r.id, { ...r, categories: [], menu: [] }]));

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
          item.ingredients = item.ingredients.split(',').map(name => ({ name: name.trim(), icon: 'default_icon' }));
        }
      }
      restaurant.menu.push(item);
    }
  }

  return Array.from(restaurantMap.values());
};

// Helper function to denormalize restaurant data (similar to useRestaurants)
export const denormalizeRestaurant = (
  restaurant: any,
  categories: Category[],
  restaurantCategories: { restaurant_id: number; category_id: number }[],
  menuItems: MenuItem[]
): Restaurant | null => {
  if (!restaurant) return null;

  const categoryMap = new Map(categories.map(c => [c.id, c]));
  const restaurantWithDetails: Restaurant = { ...restaurant, categories: [], menu: [] };

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
          item.ingredients = item.ingredients.split(',').map(name => ({ name: name.trim(), icon: 'default_icon' }));
        }
      }
      restaurantWithDetails.menu.push(item);
    }
  }

  return restaurantWithDetails;
};
