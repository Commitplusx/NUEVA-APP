import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Restaurant } from '../types';
import { useRestaurants } from '../hooks/useRestaurants';
import { useThemeColor } from '../hooks/useThemeColor';
import { SearchIcon, StarIcon, ClockIcon, AlertTriangleIcon, SlidersIcon } from './icons';
import { RestaurantCardSkeleton } from './RestaurantCardSkeleton';
import { Spinner } from './Spinner';
import { getTransformedImageUrl } from '../services/image';
import AdvancedFilters, { Filters } from './AdvancedFilters';

const RestaurantCard: React.FC<{ restaurant: Restaurant; onSelect: () => void; }> = ({ restaurant, onSelect }) => {
  const optimizedImageUrl = getTransformedImageUrl(restaurant.imageUrl || '', 400, 300);
  return (
    <motion.button 
      onClick={onSelect} 
      className="w-full text-left bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 transition-all duration-300 ease-in-out"
      whileHover={{ scale: 1.03, y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      <div className="relative w-full bg-gray-200" style={{ aspectRatio: '16 / 9' }}>
        {optimizedImageUrl ? (
          <img src={optimizedImageUrl} alt={restaurant.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
        )}
        <div className="absolute top-2 right-2 bg-yellow-400 text-white text-sm font-bold px-3 py-1 rounded-full flex items-center shadow-md">
          <StarIcon className="w-4 h-4 text-white mr-1" />
          {restaurant.rating}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-1">{restaurant.name}</h3>
        <div className="flex flex-wrap gap-2 mb-2">
          {restaurant.categories?.map(c => (
            <span key={c.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {c.name}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between text-sm text-gray-700 mt-3">
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-700">Entrega: </span>
            <span className="font-bold text-green-600">
              {typeof restaurant.delivery_fee === 'number' ? `$${restaurant.delivery_fee.toFixed(2)}` : 'N/A'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <ClockIcon className="w-4 h-4 text-gray-500" />
            <span className="font-semibold text-sm text-gray-700">{restaurant.delivery_time} min</span>
          </div>
        </div>
      </div>
    </motion.button>
  );
};

const RestaurantList: React.FC<{
  restaurants: Restaurant[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => void;
}> = ({ restaurants, loading, loadingMore, hasMore, error, loadMore }) => {
  const navigate = useNavigate();
  const observer = React.useRef<IntersectionObserver>();

  const lastRestaurantElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        loadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore, loadMore]);

  if (error && restaurants.length === 0) {
    return (
      <div className="text-center text-red-500 col-span-1 py-10 bg-red-50 rounded-lg">
        <AlertTriangleIcon className="w-12 h-12 mx-auto mb-4 text-red-400" />
        <h3 className="text-lg font-semibold mb-2">Error al Cargar</h3>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6">
        {[...Array(6)].map((_, i) => <RestaurantCardSkeleton key={i} />)}
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="text-center text-gray-500 p-4 mt-4 bg-gray-100 rounded-lg">
        <p>No se encontraron restaurantes con esos criterios.</p>
        <p className="text-sm mt-2">Intenta con otra búsqueda o categoría.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {restaurants.map((restaurant, index) => {
        const isLastElement = restaurants.length === index + 1;
        return (
          <div key={restaurant.id} ref={isLastElement ? lastRestaurantElementRef : null}>
            <RestaurantCard
              restaurant={restaurant}
              onSelect={() => navigate(`/restaurants/${restaurant.id}`)}
            />
          </div>
        );
      })}
      {loadingMore && <div className="col-span-1"><Spinner /></div>}
      {!hasMore && restaurants.length > 0 && (
        <p className="col-span-1 text-center text-gray-500 text-sm py-4">Has llegado al final de la lista.</p>
      )}
    </div>
  );
};

export const Restaurants: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    sortBy: 'rating',
    categories: [],
    priceRange: [],
    openNow: false,
  });

  const { restaurants, loading, loadingMore, hasMore, error, loadMore } = useRestaurants({
    searchQuery: debouncedSearchQuery,
    filters,
  });

  useThemeColor('#f97316');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const handleApplyFilters = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  return (
    <div className="p-4">
      <div className="px-4 mb-4 flex gap-2">
        <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Busca tu restaurante..."
              className="w-full py-3 pl-10 pr-4 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <SearchIcon className="w-5 h-5"/>
            </div>
        </div>
        <button onClick={() => setIsFiltersOpen(true)} className="p-3 bg-white border border-gray-200 rounded-full" aria-label="Filtros y Ordenación">
          <SlidersIcon className="w-5 h-5 text-gray-600"/>
        </button>
      </div>

      <section className="px-4">
        <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold text-gray-800">
              Restaurantes
            </h2>
        </div>
        
        <RestaurantList
          restaurants={restaurants}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          error={error}
          loadMore={loadMore}
        />
      </section>

      <AdvancedFilters
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        onApply={handleApplyFilters}
        initialFilters={filters}
      />
    </div>
  );
};
