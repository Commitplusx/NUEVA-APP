import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Restaurant } from '../types';
import { denormalizeRestaurant } from '../services/denormalize';

export const useRestaurantDetail = (id: string) => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('No restaurant ID provided.');
      setLoading(false);
      return;
    }

    const fetchRestaurant = async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await Promise.allSettled([
          supabase.from('restaurants').select('*').eq('id', id).single(),
          supabase.from('categories').select('*'),
          supabase.from('restaurant_categories').select('*'),
          supabase.from('menu_items').select('*')
        ]);

        const [restaurantResult, categoryResult, restaurantCategoryResult, menuItemsResult] = results;

        const anyRejected = results.some(result => result.status === 'rejected');
        if (anyRejected) {
          console.error('Error fetching restaurant detail data:', results.filter(r => r.status === 'rejected'));
          throw new Error('Failed to fetch some restaurant detail data');
        }

        const getFulfilledData = (result: PromiseSettledResult<any>) =>
          result.status === 'fulfilled' ? result.value.data : [];

        const fetchedRestaurant = getFulfilledData(restaurantResult);
        const fetchedCategories = getFulfilledData(categoryResult);
        const fetchedRestaurantCategories = getFulfilledData(restaurantCategoryResult);
        const fetchedMenuItems = getFulfilledData(menuItemsResult);

        if (!fetchedRestaurant) {
          setError('Restaurant not found.');
          setRestaurant(null);
        } else {
          const denormalized = denormalizeRestaurant(
            fetchedRestaurant,
            fetchedCategories,
            fetchedRestaurantCategories,
            fetchedMenuItems
          );
          setRestaurant(denormalized);
          setError(null);
        }
      } catch (err) {
        setError('Failed to load restaurant details. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [id]);

  return { restaurant, loading, error };
};