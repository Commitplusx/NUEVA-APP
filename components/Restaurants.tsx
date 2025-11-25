import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Restaurant } from '../types';
import { useRestaurants } from '../hooks/useRestaurants';
import { useThemeColor } from '../hooks/useThemeColor';
import { SearchIcon, StarIcon, ClockIcon, AlertTriangleIcon, SlidersIcon, StoreIcon, MotorcycleIcon, SparklesIcon, PlusIcon, ChevronRightIcon, GridIcon } from './icons';
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
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 }
  },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

// --- Categories Component ---
const Categories: React.FC = () => {
  const categories = [
    { id: 1, name: 'Sandwich', image: '/images/sandwitch.jpg', active: true },
    { id: 2, name: 'Pizza', image: '/images/pizza.jpg', active: false },
    { id: 3, name: 'Burger', image: '/images/burger.jpg', active: false },
    { id: 4, name: 'Drinks', image: '', icon: <StoreIcon className="w-8 h-8 text-gray-400" />, active: false },
  ];

  return (
    <div className="mb-8 px-4">
      <h2 className="text-xl font-bold text-gray-900 mb-5">Categories</h2>
      <div className="flex gap-5 overflow-x-auto pb-8 pt-2 px-1 snap-x snap-mandatory hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {categories.map((category) => (
          <motion.div
            key={category.id}
            className={`relative flex-shrink-0 w-28 h-40 rounded-[2rem] flex flex-col items-center justify-between py-4 snap-center cursor-pointer overflow-visible transition-all duration-300 ${category.active
              ? 'bg-green-500 shadow-[0_10px_20px_rgba(34,197,94,0.3)]'
              : 'bg-white shadow-[0_10px_30px_rgba(0,0,0,0.05)]'
              }`}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-20 h-20 -mt-2 relative z-10 flex items-center justify-center">
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-contain drop-shadow-xl filter"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-full">
                  {category.icon}
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-3 w-full">
              <span className={`font-bold text-sm ${category.active ? 'text-white' : 'text-gray-800'}`}>
                {category.name}
              </span>

              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${category.active ? 'bg-yellow-400 text-white' : 'bg-gray-800 text-white'
                }`}>
                <ChevronRightIcon className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// --- Mobile Restaurant Card (New Design) ---
const MobileRestaurantCard: React.FC<{ restaurant: Restaurant; onSelect: () => void; }> = ({ restaurant, onSelect }) => {
  const optimizedImageUrl = getTransformedImageUrl(restaurant.imageUrl || '', 400, 400);

  return (
    <div
      onClick={onSelect}
      className="w-full text-left bg-white rounded-[2rem] p-3 flex flex-col gap-3 group active:scale-95 transition-transform relative cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
      role="button"
      tabIndex={0}
    >
      {/* Image Section */}
      <div className="relative w-full aspect-[1.1/1] rounded-2xl overflow-hidden bg-gray-50">
        {optimizedImageUrl ? (
          <img
            src={optimizedImageUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover transition-opacity duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <StoreIcon className="w-10 h-10 opacity-30" />
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-col w-full px-1 pb-1">
        <h3 className="font-bold text-gray-900 line-clamp-1 text-lg mb-0.5">{restaurant.name}</h3>

        <div className="flex justify-between items-end mt-1">
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-400 font-medium mb-0.5">Starting From</span>
            <span className="text-green-600 font-bold text-lg">${Number(restaurant.delivery_fee || restaurant.deliveryFee || 0).toFixed(2)}</span>
          </div>
          <div className="bg-yellow-400 text-white w-8 h-8 rounded-xl flex items-center justify-center shadow-sm mb-1">
            <PlusIcon className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};



// --- Mobile View Component ---
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
    <div className="pb-20 pt-4 bg-white min-h-screen font-sans">
      <div className="px-4 pt-2 mb-6 flex justify-between items-center">
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
          {/* Placeholder for user avatar - using a generic image or the user's profile image if available */}
          <img src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop" alt="User" className="w-full h-full object-cover" />
        </div>
        <button className="p-2 text-gray-600">
          <GridIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="px-4 mb-6">
        <h1 className="text-3xl text-gray-800">Food</h1>
        <h1 className="text-3xl font-extrabold text-gray-900">Delivery!</h1>
      </div>

      <div className="px-4 mb-8 flex gap-3">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search"
            className="w-full py-4 pl-12 pr-4 bg-gray-100 border-none rounded-2xl focus:outline-none focus:ring-0 text-gray-600 placeholder-gray-400 text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <SearchIcon className="w-6 h-6" />
          </div>
        </div>
        <button onClick={() => setIsFiltersOpen(true)} className="p-4 bg-green-500 text-white rounded-2xl shadow-none active:scale-95 transition-all flex-shrink-0" aria-label="Filtros">
          <SlidersIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Featured Section Removed as per design */}

      <Categories />

      <section className="px-4">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recommended</h2>
          <span className="text-xs text-gray-500 font-medium mb-1 bg-gray-100 px-2 py-0.5 rounded-full">{restaurants.length} lugares</span>
        </div>

        <div
          className="grid grid-cols-2 gap-4"
        >
          {loading && [...Array(6)].map((_, i) => <RestaurantCardSkeleton key={`skeleton-${i}`} />)}
          {!loading && error && <div key="error-msg" className="text-center text-red-500 col-span-2 py-10"><p>{error}</p></div>}
          {!loading && !error && restaurants.map((restaurant: Restaurant, index: number) => {
            const isLastElement = restaurants.length === index + 1;
            return (
              <div
                key={restaurant.id}
                ref={isLastElement ? lastRestaurantElementRef : null}
              >
                <MobileRestaurantCard
                  restaurant={restaurant}
                  onSelect={() => navigate(`/restaurants/${restaurant.id}`)}
                />
              </div>
            );
          })}
          {loadingMore && <div className="col-span-2"><Spinner /></div>}
          {!hasMore && restaurants.length > 0 && <p className="col-span-2 text-center text-gray-400 text-[10px] py-4 font-medium tracking-wide uppercase">Has llegado al final</p>}
          {!loading && restaurants.length === 0 && <div className="col-span-2 text-center text-gray-500 p-6 mt-4 bg-gray-50 rounded-xl shadow-sm mx-2"><StoreIcon className="w-10 h-10 mx-auto text-gray-300 mb-2" /><p className="text-sm">No encontramos restaurantes por aquí.</p></div>}
        </div>
      </section>
    </div>
  );
};


// --- Desktop View Components ---
const DesktopRestaurantListItem: React.FC<{ restaurant: Restaurant; onSelect: () => void; isSelected: boolean; }> = ({ restaurant, onSelect, isSelected }) => {
  const optimizedImageUrl = getTransformedImageUrl(restaurant.imageUrl || '', 200, 200);
  return (
    <motion.div
      layout
      onClick={onSelect}
      className={`w-full text-left p-4 flex items-start gap-4 rounded-2xl border transition-all duration-200 group cursor-pointer ${isSelected ? 'bg-white border-orange-200 shadow-md ring-1 ring-orange-100' : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'}`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      role="button"
      tabIndex={0}
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
    </motion.div>
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
            {!loading && error && <div key="error-msg-desktop" className="text-center text-red-500 col-span-full py-10"><p>{error}</p></div>}
            {!loading && !error && restaurants.map((restaurant: Restaurant, index: number) => {
              const isLastElement = restaurants.length === index + 1;
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
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
          {loadingMore && <div className="py-4"><Spinner /></div>}
          {!hasMore && restaurants.length > 0 && <p className="text-center text-gray-400 text-xs py-4">No hay más restaurantes</p>}
        </motion.div>

        <main className="flex-grow p-4 overflow-hidden">
          <DesktopDetailView restaurant={selectedRestaurant} />
        </main>
      </div>
    </div>
  );
};

// --- Main Component ---
export const Restaurants: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Partial<Filters>>({});

  const {
    restaurants,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
  } = useRestaurants({ searchQuery, filters });

  const updateFilter = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({});
  };

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  useThemeColor('#ffffff'); // White background for new design

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-select first restaurant on desktop if none selected
  useEffect(() => {
    if (isDesktop && !selectedRestaurant && restaurants.length > 0) {
      setSelectedRestaurant(restaurants[0]);
    }
  }, [isDesktop, restaurants, selectedRestaurant]);

  return (
    <>
      {isDesktop ? (
        <DesktopView
          restaurants={restaurants}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          error={error}
          loadMore={loadMore}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isFiltersOpen={isFiltersOpen}
          setIsFiltersOpen={setIsFiltersOpen}
          selectedRestaurant={selectedRestaurant}
          setSelectedRestaurant={setSelectedRestaurant}
        />
      ) : (
        <MobileView
          restaurants={restaurants}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          error={error}
          loadMore={loadMore}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setIsFiltersOpen={setIsFiltersOpen}
        />
      )}

      <AdvancedFilters
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        filters={filters}
        onUpdateFilter={updateFilter}
        onResetFilters={resetFilters}
      />
    </>
  );
};
