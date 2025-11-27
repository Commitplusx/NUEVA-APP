import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Category } from '../types';
import { Preferences } from '@capacitor/preferences';

const CACHE_KEY = 'app-categories-cache';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isMounted = true; // Flag to track if the component is mounted

    const fetchDataWithTimeout = async () => {
      // Try to load from cache first
      try {
        const { value } = await Preferences.get({ key: CACHE_KEY });
        if (value && isMounted) {
          const cachedData = JSON.parse(value);
          if (Array.isArray(cachedData) && cachedData.length > 0) {
            setCategories(cachedData);
            setLoading(false); // Show cached data immediately
          }
        }
      } catch (e) {
        console.error("Error loading categories cache", e);
      }

      // Start a timeout to force an error state if fetch takes too long
      timeoutId = setTimeout(() => {
        if (isMounted && loading) { // Only set error if component is still mounted and still loading (if cache didn't load)
          // If we have cached data, we might not want to show an error, but for now let's keep the logic
          // actually if we have categories (from cache), we shouldn't show a timeout error blocking the UI
          if (categories.length === 0) {
            setError("La carga de categorías está tardando más de lo esperado. Por favor, revisa tu conexión o inténtalo de nuevo más tarde.");
            setLoading(false);
          }
        }
      }, 3000); // 3 second timeout

      try {
        if (categories.length === 0) setLoading(true); // Only set loading if we don't have cached data

        const { data, error } = await supabase.from('categories').select('*').order('id');
        if (error) throw error;

        if (isMounted) {
          if (data && data.length === 0) {
            if (categories.length === 0) setError('No se encontraron categorías. Por favor, agrega algunas o verifica la configuración de tu base de datos.');
          } else {
            setCategories(data || []);
            setError(null); // Clear error on successful fetch
            // Save to cache
            Preferences.set({ key: CACHE_KEY, value: JSON.stringify(data) }).catch(e => console.error("Cache save error", e));
          }
        }
      } catch (err) {
        if (isMounted) {
          // Only show error if we don't have cached data
          if (categories.length === 0) {
            setError('No se pudieron cargar las categorías. Por favor, verifica tu conexión o inténtalo de nuevo más tarde.');
          }
          console.error(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          clearTimeout(timeoutId); // Clear the timeout if fetchCategories completes normally
        }
      }
    };

    fetchDataWithTimeout();

    return () => {
      isMounted = false; // Set to false when component unmounts
      clearTimeout(timeoutId);
    };
  }, []); // Remove dependency on categories to avoid loop, logic inside handles updates

  return { categories, loading, error };
};
