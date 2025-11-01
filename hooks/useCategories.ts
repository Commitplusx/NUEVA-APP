import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Category } from '../types';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isMounted = true; // Flag to track if the component is mounted

    const fetchDataWithTimeout = async () => {
      // Start a timeout to force an error state if fetch takes too long
      timeoutId = setTimeout(() => {
        if (isMounted) { // Only set error if component is still mounted
          setError("La carga de categorías está tardando más de lo esperado. Por favor, revisa tu conexión o inténtalo de nuevo más tarde.");
          setLoading(false);
        }
      }, 1000); // 1 second timeout

      try {
        setLoading(true);
        const { data, error } = await supabase.from('categories').select('*').order('id');
        if (error) throw error;
        
        if (isMounted) {
          if (data && data.length === 0) {
            setError('No se encontraron categorías. Por favor, agrega algunas o verifica la configuración de tu base de datos.');
          } else {
            setCategories(data || []);
            setError(null); // Clear error on successful fetch
          }
        }
      } catch (err) {
        if (isMounted) {
          setError('No se pudieron cargar las categorías. Por favor, verifica tu conexión o inténtalo de nuevo más tarde.');
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
  }, []);

  return { categories, loading, error };
};
