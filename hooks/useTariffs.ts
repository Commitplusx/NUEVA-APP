import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Tariff } from '../types';

export const useTariffs = () => {
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isMounted = true; // Flag to track if the component is mounted

    const fetchDataWithTimeout = async () => {
      // Start a timeout to force an error state if fetch takes too long
      timeoutId = setTimeout(() => {
        if (isMounted) { // Only set error if component is still mounted
          setError("La carga de tarifas está tardando más de lo esperado. Por favor, revisa tu conexión o inténtalo de nuevo más tarde.");
          setLoading(false);
        }
      }, 1000); // 1 second timeout

      try {
        setLoading(true);
        const { data, error } = await supabase.from('tariffs').select('*').order('id');
        console.log('Supabase tariffs data:', data);
        console.log('Supabase tariffs error:', error);
        if (error) throw error;
        
        if (isMounted) {
          if (data && data.length === 0) {
            setError('No se encontraron tarifas. Por favor, agrega algunas o verifica la configuración de tu base de datos.');
          } else {
            setTariffs(data || []);
            setError(null); // Clear error on successful fetch
          }
        }
      } catch (err) {
        if (isMounted) {
          setError('No se pudieron cargar las tarifas. Por favor, verifica tu conexión o inténtalo de nuevo más tarde.');
          console.error(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          clearTimeout(timeoutId); // Clear the timeout if fetchTariffs completes normally
        }
        }
    };

    fetchDataWithTimeout();

    return () => {
      isMounted = false; // Set to false when component unmounts
      clearTimeout(timeoutId);
    };
  }, []);

  return { tariffs, loading, error };
};