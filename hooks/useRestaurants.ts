import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { getRestaurants } from '../services/api';
import { Restaurant } from '../types';

export const useRestaurants = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getRestaurants();
      setRestaurants(data);
      setError(null);
    } catch (err) {
      setError('No se pudieron cargar los restaurantes.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRestaurants();

    const channel = supabase
      .channel('restaurants-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurants' }, payload => {
        fetchRestaurants();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRestaurants]);

  return { restaurants, loading, error, fetchRestaurants };
};