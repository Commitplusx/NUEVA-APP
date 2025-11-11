import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Restaurant } from '../types';
import { denormalizeRestaurants } from '../services/denormalize';
import { Filters } from '../components/AdvancedFilters';

const PAGE_SIZE = 8;

interface UseRestaurantsProps {
  searchQuery?: string;
  filters?: Partial<Filters>;
}

const EMPTY_FILTERS: Partial<Filters> = {};

export const useRestaurants = ({ searchQuery, filters = EMPTY_FILTERS }: UseRestaurantsProps = {}) => {
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

      let restaurantIdsForCategories: number[] | null = null;

      if (filters.categories && filters.categories.length > 0) {
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('id')
          .in('name', filters.categories);
        if (catError) throw catError;

        const categoryIds = catData.map(c => c.id);

        const { data: restCatData, error: restCatError } = await supabase
          .from('restaurant_categories')
          .select('restaurant_id')
          .in('category_id', categoryIds);
        if (restCatError) throw restCatError;
        
        restaurantIdsForCategories = [...new Set(restCatData.map(rc => rc.restaurant_id))];
        if (restaurantIdsForCategories.length === 0) {
            setRestaurants([]);
            setHasMore(false);
            return;
        }
      }

      let query = supabase.from('restaurants').select('*');

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      if (restaurantIdsForCategories) {
        query = query.in('id', restaurantIdsForCategories);
      }

      // Sorting
      if (filters.sortBy) {
        const isDescending = filters.sortBy === 'rating';
        query = query.order(filters.sortBy, { ascending: !isDescending });
      } else {
        // Default sort
        query = query.order('rating', { ascending: false });
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
  }, [searchQuery, filters]);

  useEffect(() => {
    setRestaurants([]);
    setPage(0);
    setHasMore(true);
    fetchPage(0, true);
  }, [searchQuery, filters, fetchPage]);

  const loadMore = () => {
    if (loading || loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPage(nextPage, false);
  };

  return { restaurants, loading, loadingMore, error, hasMore, loadMore };
};
