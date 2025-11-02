import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Restaurant } from '../types';
import { denormalizeRestaurants } from '../services/denormalize';

export const useRestaurants = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurants = useCallback(async () => {
    console.log('fetchRestaurants: setting loading to true, error to null');
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled([
        supabase.from('restaurants').select('*'),
        supabase.from('categories').select('*'),
        supabase.from('restaurant_categories').select('*'),
        supabase.from('menu_items').select('*')
      ]);

      const [restaurantResult, categoryResult, restaurantCategoryResult, menuItemsResult] = results;

      const anyRejected = results.some(result => result.status === 'rejected');
      if (anyRejected) {
        console.error('Error fetching data:', results.filter(r => r.status === 'rejected'));
        throw new Error('Failed to fetch some restaurant data'); // Throw to be caught by outer catch
      }

      // If all fulfilled, extract data
      const getFulfilledData = (result: PromiseSettledResult<any>) =>
        result.status === 'fulfilled' ? result.value.data : [];

      const denormalized = denormalizeRestaurants(
        getFulfilledData(restaurantResult),
        getFulfilledData(categoryResult),
        getFulfilledData(restaurantCategoryResult),
        getFulfilledData(menuItemsResult)
      );
      console.log('useRestaurants: denormalized restaurants (first imageUrl):', denormalized[0]?.imageUrl);

      if (denormalized.length === 0) {
        console.log('fetchRestaurants: No restaurants found, setting error.');
        setError('No se encontraron restaurantes. Por favor, agrega algunos o verifica la configuración de tu base de datos.');
      } else {
        setRestaurants(denormalized);
        setError(null); // Clear error on successful fetch
      }
    } catch (err) {
      setError('No se pudieron cargar los restaurantes. Por favor, verifica tu conexión o inténtalo de nuevo más tarde.');
      console.error(err);
    } finally {
      setLoading(false);
      console.log('fetchRestaurants: finished, loading set to false. Current error:', error);
    }
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isMounted = true; // Flag to track if the component is mounted

    const fetchDataWithTimeout = async () => {
      // Start a timeout to force an error state if fetch takes too long
      timeoutId = setTimeout(() => {
        if (isMounted) { // Only set error if component is still mounted
          setError("La carga está tardando más de lo esperado. Por favor, revisa tu conexión o inténtalo de nuevo más tarde.");
          setLoading(false);
        }
      }, 3000); // 3 second timeout

      await fetchRestaurants(); // This call inherently sets and clears loading
      if (isMounted) {
        clearTimeout(timeoutId); // Clear the timeout if fetchRestaurants completes normally
      }
    };

    fetchDataWithTimeout();

    // Set up a single subscription
    const channel = supabase
    .channel('db-changes')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'restaurants' }, payload => {
      console.log('New restaurant added, refetching...');
      fetchRestaurants();
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'restaurants' }, payload => {
      console.log('Restaurant updated, refetching...');
      fetchRestaurants();
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'restaurants' }, payload => {
      console.log('Restaurant deleted, refetching...');
      fetchRestaurants();
    })
    .subscribe();

    return () => {
      isMounted = false; // Set to false when component unmounts
      clearTimeout(timeoutId);
      supabase.removeChannel(channel);
    };
  }, [fetchRestaurants]); // fetchRestaurants is stable due to useCallback

  return { restaurants, loading, error, fetchRestaurants };
};
