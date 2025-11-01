import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { getCategories, addCategory, updateCategory, deleteCategory } from '../services/api';
import { Category } from '../types';

export const useAdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCategories();
      if (data.length === 0) {
        setError('No se encontraron categorías.');
      }
      setCategories(data);
    } catch (err) {
      setError('No se pudieron cargar las categorías.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();

    const channel = supabase
      .channel('admin-categories-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        fetchCategories();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCategories]);

  return { categories, loading, error, fetchCategories, addCategory, updateCategory, deleteCategory };
};
