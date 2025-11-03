import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Restaurant } from '../types';
import { denormalizeRestaurants } from '../services/denormalize';

const PAGE_SIZE = 8;

interface UseRestaurantsProps {
  searchQuery?: string;
  categoryName?: string;
}

export const useRestaurants = ({ searchQuery, categoryName }: UseRestaurantsProps) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchPage = useCallback(async (pageToFetch: number, isNewFilter: boolean) => {
    if (pageToFetch === 0) setLoading(true);
    else setLoadingMore(true);
    setError(null);

    try {
      const from = pageToFetch * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let restaurantIdsForCategory: number[] | null = null;

      if (categoryName && categoryName !== 'All') {
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('id')
          .eq('name', categoryName)
          .single();
        if (catError) throw catError;

        const { data: restCatData, error: restCatError } = await supabase
          .from('restaurant_categories')
          .select('restaurant_id')
          .eq('category_id', catData.id);
        if (restCatError) throw restCatError;
        
        restaurantIdsForCategory = restCatData.map(rc => rc.restaurant_id);
        if (restaurantIdsForCategory.length === 0) {
            setRestaurants([]);
            setHasMore(false);
            return;
        }
      }

      let query = supabase.from('restaurants').select('*');

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      if (restaurantIdsForCategory) {
        query = query.in('id', restaurantIdsForCategory);
      }

      const { data: restaurantsData, error: restaurantsError } = await query.range(from, to);
      if (restaurantsError) throw restaurantsError;

      const [categoriesResult, restaurantCategoriesResult, menuItemsResult] = await Promise.all([
        supabase.from('categories').select('*'),
        supabase.from('restaurant_categories').select('*'),
        supabase.from('menu_items').select('*'),
      ]);

      const denormalized = denormalizeRestaurants(
        restaurantsData || [],
        categoriesResult.data || [],
        restaurantCategoriesResult.data || [],
        menuItemsResult.data || []
      );

      setRestaurants(prev => (pageToFetch === 0 || isNewFilter) ? denormalized : [...prev, ...denormalized]);
      setHasMore(restaurantsData.length === PAGE_SIZE);

    } catch (err: any) {
      setError('No se pudieron cargar los restaurantes.');
      setRestaurants([]); // Clear restaurants on error
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchQuery, categoryName]);

  useEffect(() => {
    setRestaurants([]);
    setPage(0);
    setHasMore(true);
    fetchPage(0, true);
  }, [searchQuery, categoryName, fetchPage]);

  const loadMore = () => {
    if (loading || loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPage(nextPage, false);
  };

  return { restaurants, loading, loadingMore, error, hasMore, loadMore };
};
