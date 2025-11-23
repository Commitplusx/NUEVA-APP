import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Restaurant } from '../types';
import { useRestaurants } from '../hooks/useRestaurants';
import { useThemeColor } from '../hooks/useThemeColor';
import { SearchIcon, StarIcon, ClockIcon, AlertTriangleIcon, SlidersIcon, StoreIcon, MotorcycleIcon, SparklesIcon, PlusIcon } from './icons';
import { RestaurantCardSkeleton } from './RestaurantCardSkeleton';
import { Spinner } from './Spinner';
import { getTransformedImageUrl } from '../services/image';
import AdvancedFilters, { Filters } from './AdvancedFilters';

// --- Animation Variants ---
const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

// --- Featured Section Component ---
const FeaturedSection: React.FC<{ restaurants: Restaurant[]; onSelect: (r: Restaurant) => void }> = ({ restaurants, onSelect }) => {
  const topRated = React.useMemo(() => {
    return [...restaurants].sort((a, b) => b.rating - a.rating).slice(0, 5);
  }, [restaurants]);

  if (topRated.length === 0) return null;

  return (
    <div className="mb-8 pl-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-yellow-100 p-1.5 rounded-full">
          <SparklesIcon className="w-4 h-4 text-yellow-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Favoritos de la semana</h2>
      </div>
      <div className="flex overflow-x-auto gap-4 pb-4 pr-4 snap-x snap-mandatory hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {topRated.map(restaurant => {
          const optimizedImageUrl = getTransformedImageUrl(restaurant.imageUrl || '', 400, 300);
          return (
            <motion.button
              key={restaurant.id}
              onClick={() => onSelect(restaurant)}
              className="relative flex-shrink-0 w-64 h-40 rounded-2xl overflow-hidden snap-center shadow-md group"
              whileTap={{ scale: 0.95 }}
            >
              <img src={optimizedImageUrl} alt={restaurant.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-4 text-left w-full">
                <h3 className="text-white font-bold text-lg leading-tight mb-1 truncate">{restaurant.name}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-200">
                  <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                    <StarIcon className="w-3 h-3 text-yellow-400" />
                    {restaurant.rating}
                  </span>
                  <span>•</span>
                  <span>{restaurant.delivery_time} min</span>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  );
};

// --- Mobile View Component ---
const MobileRestaurantCard: React.FC<{ restaurant: Restaurant; onSelect: () => void; }> = ({ restaurant, onSelect }) => {
  const optimizedImageUrl = getTransformedImageUrl(restaurant.imageUrl || '', 400, 400);

  return (
    <motion.button
      onClick={onSelect}
      className="w-full text-left bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3 group active:scale-95 transition-all"
      whileTap={{ scale: 0.98 }}
      layout
    >
      {/* Image Section */}
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
        {optimizedImageUrl ? (
          <motion.img
            src={optimizedImageUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <StoreIcon className="w-10 h-10 opacity-30" />
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
          <StarIcon className="w-3 h-3 text-yellow-500" />
          <span className="text-xs font-bold text-gray-800">{restaurant.rating}</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col w-full">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{restaurant.name}</h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Starting from <span className="text-green-600 font-bold">${Number(restaurant.delivery_fee || restaurant.deliveryFee || 0).toFixed(2)}</span></p>
          </div>
          <div className="bg-yellow-400 text-white p-1.5 rounded-lg shadow-sm">
            <PlusIcon className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-3 text-xs text-gray-500 font-medium">
          <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
            <ClockIcon className="w-3 h-3 text-gray-400" />
            <span>{restaurant.delivery_time} min</span>
          </div>
          <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
            <MotorcycleIcon className="w-3 h-3 text-gray-400" />
            <span>Delivery</span>
          </div>
        </div>
      </div>
    </motion.button>
  );
};

const MobileView: React.FC<any> = ({ restaurants, loading, loadingMore, hasMore, error, loadMore, searchQuery, setSearchQuery, setIsFiltersOpen }) => {
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

  return (
    <div className="pb-20 pt-4 bg-gray-50 min-h-screen">
      <div className="px-4 mb-6 flex gap-3 sticky top-0 z-10 bg-gray-50/95 backdrop-blur-sm py-2">
        <div className="relative flex-grow shadow-[0_2px_8px_rgba(0,0,0,0.05)] rounded-full transition-shadow focus-within:shadow-md">
          <input
            type="text"
            placeholder="¿Qué se te antoja hoy?"
            className="w-full py-3.5 pl-11 pr-4 bg-white border-none rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white text-gray-700 placeholder-gray-400 text-sm transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500">
            <SearchIcon className="w-5 h-5" />
          </div>
        </div>
        <button onClick={() => setIsFiltersOpen(true)} className="p-3.5 bg-white rounded-full shadow-sm text-gray-600 active:scale-95 transition-all hover:bg-gray-100 border border-transparent hover:border-gray-200" aria-label="Filtros y Ordenación">
          <SlidersIcon className="w-5 h-5" />
        </button>
      </div>

      {!searchQuery && !loading && (
        <FeaturedSection restaurants={restaurants} onSelect={(r) => navigate(`/restaurants/${r.id}`)} />
      )}

      <section className="px-4">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-xl font-bold text-gray-900">Todos los restaurantes</h2>
          <span className="text-xs text-gray-500 font-medium mb-1 bg-gray-200 px-2 py-0.5 rounded-full">{restaurants.length} lugares</span>
        </div>

        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {loading && [...Array(6)].map((_, i) => <RestaurantCardSkeleton key={`skeleton-${i}`} />)}
            {!loading && error && <div className="text-center text-red-500 col-span-1 sm:col-span-2 md:col-span-3 py-10"><p>{error}</p></div>}
            {!loading && !error && restaurants.map((restaurant: Restaurant, index: number) => {
              const isLastElement = restaurants.length === index + 1;
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  key={restaurant.id}
                  ref={isLastElement ? lastRestaurantElementRef : null}
                >
                  <MobileRestaurantCard
                    restaurant={restaurant}
                    onSelect={() => navigate(`/restaurants/${restaurant.id}`)}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
          {loadingMore && <div className="col-span-1 sm:col-span-2 md:col-span-3"><Spinner /></div>}
          {!hasMore && restaurants.length > 0 && <p className="col-span-1 sm:col-span-2 md:col-span-3 text-center text-gray-400 text-[10px] py-4 font-medium tracking-wide uppercase">Has llegado al final</p>}
          {!loading && restaurants.length === 0 && <div className="col-span-1 sm:col-span-2 md:col-span-3 text-center text-gray-500 p-6 mt-4 bg-white rounded-xl shadow-sm mx-2"><StoreIcon className="w-10 h-10 mx-auto text-gray-300 mb-2" /><p className="text-sm">No encontramos restaurantes por aquí.</p></div>}
        </motion.div>
      </section>
    </div>
  );
};


// --- Desktop View Components ---
const DesktopRestaurantListItem: React.FC<{ restaurant: Restaurant; onSelect: () => void; isSelected: boolean; }> = ({ restaurant, onSelect, isSelected }) => {
  const optimizedImageUrl = getTransformedImageUrl(restaurant.imageUrl || '', 200, 200);
  return (
    <motion.button
      layout
      onClick={onSelect}
      className={`w-full text-left p-4 flex items-start gap-4 rounded-2xl border transition-all duration-200 group ${isSelected ? 'bg-white border-orange-200 shadow-md ring-1 ring-orange-100' : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'}`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
        <motion.img
          src={optimizedImageUrl}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      </div>

      <div className="flex-grow overflow-hidden min-w-0">
        <div className="flex justify-between items-start">
          <h4 className={`font-bold text-lg truncate transition-colors ${isSelected ? 'text-orange-600' : 'text-gray-900 group-hover:text-gray-700'}`}>{restaurant.name}</h4>
          {restaurant.rating >= 4.5 && <SparklesIcon className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
        </div>

        <p className="text-xs text-gray-500 truncate mb-2 font-medium">{restaurant.categories?.map(c => c.name).join(', ')}</p>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md">
            <StarIcon className="w-3 h-3 text-yellow-500" />
            <span className="font-bold text-gray-700">{restaurant.rating}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <ClockIcon className="w-3 h-3" />
            <span>{restaurant.delivery_time} min</span>
          </div>
        </div>
      </div>
    </motion.button>
  )
}

const DesktopDetailView: React.FC<{ restaurant: Restaurant | null }> = ({ restaurant }) => {
  const navigate = useNavigate();

  if (!restaurant) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50 rounded-2xl p-8 text-center">
        <div className="p-4 bg-gray-200 rounded-full mb-4">
          <StoreIcon className="w-12 h-12 text-gray-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">Selecciona un restaurante</h3>
        <p className="text-gray-500 mt-2 max-w-xs">Elige un restaurante de la lista para ver sus detalles, menú y empezar a ordenar.</p>
      </div>
    )
  }

  // Request a higher resolution image for desktop (1200x600) to avoid blurriness
  const optimizedImageUrl = getTransformedImageUrl(restaurant.imageUrl || '', 1200, 600);

  return (
    <div className="h-full bg-white rounded-2xl shadow-lg overflow-y-auto flex flex-col">
      {/* Increased height to h-80 for better aspect ratio on wide screens */}
      <div className="relative w-full h-80 bg-gray-200 flex-shrink-0 overflow-hidden">
        <motion.img
          src={optimizedImageUrl}
          alt={restaurant.name}
          className="w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8 }}
        />
        {/* Darker gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <h2 className="absolute bottom-6 left-8 text-white text-5xl font-bold tracking-tight drop-shadow-lg">{restaurant.name}</h2>
        <div className="absolute top-6 right-6 bg-yellow-400 text-white text-lg font-bold px-4 py-1.5 rounded-full flex items-center shadow-md">
          <StarIcon className="w-5 h-5 text-white mr-1.5" />
          {restaurant.rating}
        </div>
      </div>
      <div className="p-8 flex-grow flex flex-col">
        <div className="flex flex-wrap gap-2 mb-6">
          {restaurant.categories?.map((c, i) => (
            <motion.span
              key={c.id}
              className="text-sm bg-gray-100 text-gray-700 font-medium px-4 py-1.5 rounded-full"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * i }}
            >
              {c.name}
            </motion.span>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6 text-center my-4">
          <motion.div
            className="bg-gray-50 p-6 rounded-2xl border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="font-bold text-2xl text-green-600">{typeof restaurant.delivery_fee === 'number' ? `$${restaurant.delivery_fee.toFixed(2)}` : 'N/A'}</p>
            <p className="text-sm text-gray-500 mt-1">Costo de Entrega</p>
          </motion.div>
          <motion.div
            className="bg-gray-50 p-6 rounded-2xl border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="font-bold text-2xl text-gray-800">{restaurant.delivery_time} min</p>
            <p className="text-sm text-gray-500 mt-1">Tiempo Estimado</p>
          </motion.div>
        </div>
        <div className="mt-auto pt-6">
          <motion.button
            onClick={() => navigate(`/restaurants/${restaurant.id}`)}
            className="w-full bg-black text-white font-bold py-5 rounded-xl hover:bg-gray-800 transition-all transform hover:scale-[1.02] shadow-xl text-lg"
            whileTap={{ scale: 0.98 }}
          >
            Ver Menú y Ordenar
          </motion.button>
        </div>
      </div>
    </div>
  )
}

const DesktopView: React.FC<any> = ({ restaurants, loading, loadingMore, hasMore, error, loadMore, searchQuery, setSearchQuery, isFiltersOpen, setIsFiltersOpen, selectedRestaurant, setSelectedRestaurant }) => {
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

  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col bg-gray-100">
      <div className="flex-shrink-0 p-3 border-b bg-white">
        <div className="relative max-w-md mx-auto flex gap-3">
          <div className="relative flex-grow">
            <input type="text" placeholder="Busca tu restaurante..." className="w-full py-2 pl-10 pr-4 bg-gray-100 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon className="w-5 h-5" /></div>
          </div>
          <button onClick={() => setIsFiltersOpen(true)} className="p-2 bg-white border rounded-full flex-shrink-0 hover:bg-gray-100" aria-label="Filtros">
            <SlidersIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
      <div className="flex flex-grow overflow-hidden">
        <motion.div
          layout
          className="w-1/3 max-w-sm flex-shrink-0 overflow-y-auto p-2 space-y-1"
          variants={listVariants}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence mode="popLayout">
            {loading && [...Array(10)].map((_, i) => <RestaurantCardSkeleton key={`skel-desk-${i}`} isDesktop={true} />)}
            {!loading && error && <div className="text-center text-red-500 col-span-full py-10"><p>{error}</p></div>}
            {!loading && !error && restaurants.map((restaurant: Restaurant, index: number) => {
              const isLastElement = restaurants.length === index + 1;
              return (
                <motion.div
                  layout
                  variants={itemVariants}
                  exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                  key={restaurant.id}
                  ref={isLastElement ? lastRestaurantElementRef : null}
                >
                  <DesktopRestaurantListItem
                    restaurant={restaurant}
                    onSelect={() => setSelectedRestaurant(restaurant)}
                    isSelected={selectedRestaurant?.id === restaurant.id}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
          {loadingMore && <div className="col-span-full flex justify-center py-4"><Spinner /></div>}
          {!hasMore && restaurants.length > 0 && <p className="col-span-full text-center text-sm py-4">Fin de la lista.</p>}
          {!loading && restaurants.length === 0 && <div className="col-span-full text-center p-4 mt-4"><p>No se encontraron restaurantes.</p></div>}
        </motion.div>
        <main className="flex-grow p-4 bg-gray-100">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedRestaurant?.id || 'placeholder'}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              transition={{ duration: 0.4, ease: [0.43, 0.13, 0.23, 0.96] }}
              className="h-full"
            >
              <DesktopDetailView restaurant={selectedRestaurant} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

// --- Main Component ---
export const Restaurants: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({ sortBy: 'rating', categories: [], priceRange: [], openNow: false });
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  const { restaurants, loading, loadingMore, hasMore, error, loadMore } = useRestaurants({
    searchQuery: debouncedSearchQuery,
    filters,
  });

  useThemeColor('#f97316');

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    if (isDesktop && restaurants.length > 0 && !selectedRestaurant) {
      setSelectedRestaurant(restaurants[0]);
    }
    if (!isDesktop) {
      setSelectedRestaurant(null);
    }
  }, [isDesktop, restaurants]);

  const handleApplyFilters = (newFilters: Filters) => {
    setFilters(newFilters);
    setSelectedRestaurant(null);
  };

  const commonProps = { restaurants, loading, loadingMore, hasMore, error, loadMore, searchQuery, setSearchQuery, isFiltersOpen, setIsFiltersOpen };

  return (
    <div>
      {isDesktop ? (
        <DesktopView {...commonProps} selectedRestaurant={selectedRestaurant} setSelectedRestaurant={setSelectedRestaurant} />
      ) : (
        <MobileView {...commonProps} />
      )}
      <AdvancedFilters isOpen={isFiltersOpen} onClose={() => setIsFiltersOpen(false)} onApply={handleApplyFilters} initialFilters={filters} />
    </div>
  )
};
