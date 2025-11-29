import { useState, useEffect, useCallback } from 'react';
import { useAppState } from './useAppState';
import { supabase } from '../services/supabase';
import { Restaurant } from '../types';
import { denormalizeRestaurants } from '../services/denormalize';
import { Filters } from '../components/AdvancedFilters';
import { Preferences } from '@capacitor/preferences';

const PAGE_SIZE = 8;
const CACHE_KEY = 'app-restaurants-cache';

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

  // Load from cache on mount
  useEffect(() => {
    const loadCache = async () => {
      // Only load cache if no search/filters
      if (searchQuery || (filters.categories && filters.categories.length > 0) || filters.sortBy) return;

      try {
        const { value } = await Preferences.get({ key: CACHE_KEY });
        if (value) {
          const cachedData = JSON.parse(value);
          if (Array.isArray(cachedData) && cachedData.length > 0) {
            setRestaurants(cachedData);
            setLoading(false); // Show cached data immediately
          }
        }
      } catch (e) {
        console.error("Error loading cache", e);
      }
    };
    loadCache();
  }, []);

  const fetchPage = useCallback(async (pageToFetch: number, isNewFilter: boolean) => {
    // If loading page 0 and we already have data (from cache), don't set loading to true to avoid flicker
    // unless it's a new filter/search
    if (pageToFetch === 0) {
      if (isNewFilter || restaurants.length === 0) setLoading(true);
    } else {
      setLoadingMore(true);
    }
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

      const [categoriesResult, restaurantCategoriesResult, menuItemsResult, schedulesResult] = await Promise.all([
        supabase.from('categories').select('*'),
        supabase.from('restaurant_categories').select('*'),
        supabase.from('menu_items').select('*'),
        supabase.from('restaurant_schedules').select('*'),
      ]);

      const denormalized = denormalizeRestaurants(
        restaurantsData || [],
        categoriesResult.data || [],
        restaurantCategoriesResult.data || [],
        menuItemsResult.data || []
      ).map(r => ({
        ...r,
        schedules: (schedulesResult.data || []).filter(s => s.restaurant_id === r.id)
      }));

      setRestaurants(prev => {
        const newData = (pageToFetch === 0 || isNewFilter) ? denormalized : [...prev, ...denormalized];

        // Cache the data if it's the first page and default view
        if (pageToFetch === 0 && !searchQuery && (!filters.categories || filters.categories.length === 0) && !filters.sortBy) {
          Preferences.set({ key: CACHE_KEY, value: JSON.stringify(newData) }).catch(e => console.error("Cache save error", e));
        }

        return newData;
      });

      setHasMore(restaurantsData.length === PAGE_SIZE);

    } catch (err: any) {
      setError('No se pudieron cargar los restaurantes.');
      // Keep existing data if fetch fails (fallback to cache/previous state)
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchQuery, filters]);

  useEffect(() => {
    // Reset and fetch when filters change
    // Note: We don't clear restaurants immediately here to avoid flash if we have cache or previous data
    // The fetchPage will handle the replacement
    setPage(0);
    setHasMore(true);
    fetchPage(0, true);
  }, [searchQuery, filters, fetchPage]);

  useAppState(() => {
    console.log('App came to foreground, refreshing restaurants...');
    fetchPage(0, true);
  });

  // Real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('public:restaurants')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'restaurants',
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          const newRecord = payload.new;

          setRestaurants(prev => prev.map(r => {
            if (r.id === newRecord.id) {
              // Merge updates. We preserve existing joined data (categories, menu) 
              // and update only the fields present in the restaurants table.
              return {
                ...r,
                name: newRecord.name,
                description: newRecord.description,
                is_active: newRecord.is_active,
                imageUrl: newRecord.image_url || newRecord.logo_url || r.imageUrl,
                rating: newRecord.rating,
                deliveryTime: newRecord.delivery_time,
                deliveryFee: newRecord.delivery_fee,
                // Update snake_case props if they exist in the type
                delivery_time: newRecord.delivery_time,
                delivery_fee: newRecord.delivery_fee,
                street_address: newRecord.street_address,
                neighborhood: newRecord.neighborhood,
                city: newRecord.city,
                postal_code: newRecord.postal_code,
                lat: newRecord.lat,
                lng: newRecord.lng,
              };
            }
            return r;
          }));
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Listening for updates on restaurants table...');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadMore = () => {
    if (loading || loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPage(nextPage, false);
  };

  return { restaurants, loading, loadingMore, error, hasMore, loadMore };
};
