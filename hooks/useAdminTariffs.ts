import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { getTariffs, addTariff, updateTariff, deleteTariff } from '../services/api';
import { Tariff } from '../types';

export const useAdminTariffs = () => {
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTariffs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTariffs();
      if (data.length === 0) {
        setError('No se encontraron tarifas.');
      }
      setTariffs(data);
    } catch (err) {
      setError('No se pudieron cargar las tarifas.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTariffs();

    const channel = supabase
      .channel('admin-tariffs-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tariffs' }, () => {
        fetchTariffs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTariffs]);

  return { tariffs, loading, error, fetchTariffs, addTariff, updateTariff, deleteTariff };
};
