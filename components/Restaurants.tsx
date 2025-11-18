import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Restaurant } from '../types';
import { useRestaurants } from '../hooks/useRestaurants';
import { useThemeColor } from '../hooks/useThemeColor';
import { SearchIcon, StarIcon, ClockIcon, AlertTriangleIcon, SlidersIcon, StoreIcon, MotorcycleIcon } from './icons';
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

// --- Mobile View Component ---
const MobileRestaurantCard: React.FC<{ restaurant: Restaurant; onSelect: () => void; }> = ({ restaurant, onSelect }) => {
  const optimizedImageUrl = getTransformedImageUrl(restaurant.imageUrl || '', 400, 300);
  return (
    <motion.button 
      onClick={onSelect} 
      className="w-full text-left bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 ease-in-out h-full flex flex-col group"
      whileHover={{ y: -2, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
      whileTap={{ scale: 0.98 }}
      layout 
    >
      {/* Reduced height for a compact card (h-32) */}
      <div className="relative w-full h-32 bg-gray-100 flex-shrink-0" style={{ aspectRatio: '2 / 1' }}>
        {optimizedImageUrl ? (
          <motion.img 
            src={optimizedImageUrl} 
            alt={restaurant.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <StoreIcon className="w-8 h-8 opacity-50" />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center shadow-sm border border-white/50">
          <StarIcon className="w-3 h-3 text-yellow-500 mr-1" />
          {restaurant.rating}
        </div>
        {typeof restaurant.delivery_fee === 'number' && restaurant.delivery_fee === 0 && (
             <div className="absolute bottom-2 left-2 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">
                 ENVÍO GRATIS
             </div>
        )}
      </div>
      
      {/* Compact padding and content */}
      <div className="p-3 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-base text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors">{restaurant.name}</h3>
        </div>
        <div className="flex flex-wrap gap-1 mb-2 min-h-[1.25rem]">
          {restaurant.categories?.slice(0, 2).map(c => (
            <span key={c.id} className="text-[9px] font-medium bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded-md border border-gray-100">
              {c.name}
            </span>
          ))}
        </div>
        <div className="mt-auto pt-2 border-t border-gray-50 flex items-center justify-between text-[10px] text-gray-500">
          <div className="flex items-center gap-1">
            <div className="bg-green-50 p-0.5 rounded-full text-green-600">
                <MotorcycleIcon className="w-3 h-3" />
            </div>
            <span className="font-medium text-gray-700">
              {typeof restaurant.delivery_fee === 'number' ? (restaurant.delivery_fee === 0 ? 'Gratis' : `$${restaurant.delivery_fee.toFixed(2)}`) : 'N/A'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="bg-gray-100 p-0.5 rounded-full text-gray-500">
                <ClockIcon className="w-3 h-3" />
            </div>
            <span className="font-medium">{restaurant.delivery_time} min</span>
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
        <div className="p-4">
            <div className="px-2 mb-4 flex gap-2">
                <div className="relative flex-grow shadow-sm rounded-full">
                    <input
                    type="text"
                    placeholder="¿Qué se te antoja hoy?"
                    className="w-full py-3 pl-10 pr-4 bg-white border-none rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-gray-700 placeholder-gray-400 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500">
                    <SearchIcon className="w-4 h-4"/>
                    </div>
                </div>
                <button onClick={() => setIsFiltersOpen(true)} className="p-3 bg-white rounded-full shadow-sm text-gray-600 active:scale-95 transition-transform" aria-label="Filtros y Ordenación">
                <SlidersIcon className="w-4 h-4"/>
                </button>
            </div>

            <section className="px-1">
                <div className="flex justify-between items-end mb-3 px-1">
                    <h2 className="text-lg font-bold text-gray-900">Restaurantes</h2>
                    <span className="text-[10px] text-gray-500 font-medium mb-0.5">{restaurants.length} lugares</span>
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
                    {!loading && restaurants.length === 0 && <div className="col-span-1 sm:col-span-2 md:col-span-3 text-center text-gray-500 p-6 mt-4 bg-white rounded-xl shadow-sm mx-2"><StoreIcon className="w-10 h-10 mx-auto text-gray-300 mb-2"/><p className="text-sm">No encontramos restaurantes por aquí.</p></div>}
                </motion.div>
            </section>
        </div>
    );
};


// --- Desktop View Components ---
const DesktopRestaurantListItem: React.FC<{ restaurant: Restaurant; onSelect: () => void; isSelected: boolean; }> = ({ restaurant, onSelect, isSelected }) => {
  const optimizedImageUrl = getTransformedImageUrl(restaurant.imageUrl || '', 100, 100);
  return (
    <motion.button
      layout
      onClick={onSelect}
      className={`w-full text-left p-3 flex items-center gap-4 rounded-xl border-2 transition-all ${isSelected ? 'bg-orange-50 border-orange-300 shadow-sm' : 'border-transparent hover:bg-gray-100'}`}
      whileHover={{ scale: 1.02, backgroundColor: isSelected ? '' : '#f3f4f6' }}
      whileTap={{ scale: 0.97 }}
    >
      <motion.img 
        src={optimizedImageUrl} 
        alt={restaurant.name} 
        className="w-16 h-16 rounded-md object-cover flex-shrink-0" 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />
      <div className="flex-grow overflow-hidden">
        <h4 className="font-bold text-gray-800 truncate">{restaurant.name}</h4>
        <p className="text-sm text-gray-500 truncate">{restaurant.categories?.map(c => c.name).join(', ')}</p>
        <div className="flex items-center gap-1 text-sm mt-1">
            <StarIcon className="w-4 h-4 text-yellow-500" />
            <span className="font-semibold">{restaurant.rating}</span>
            <span className="mx-1 text-gray-300">·</span>
            <ClockIcon className="w-4 h-4 text-gray-400" />
            <span>{restaurant.delivery_time} min</span>
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

  const optimizedImageUrl = getTransformedImageUrl(restaurant.imageUrl || '', 800, 600);

  return (
    <div className="h-full bg-white rounded-2xl shadow-lg overflow-y-auto flex flex-col">
        <div className="relative w-full h-64 bg-gray-200 flex-shrink-0 overflow-hidden">
            <motion.img 
                src={optimizedImageUrl} 
                alt={restaurant.name} 
                className="w-full h-full object-cover"
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8 }}
            />
            {/* Lighter gradient for better image visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            <h2 className="absolute bottom-4 left-6 text-white text-4xl font-bold tracking-tight drop-shadow-lg">{restaurant.name}</h2>
            <div className="absolute top-4 right-4 bg-yellow-400 text-white text-base font-bold px-3 py-1 rounded-full flex items-center shadow-md">
                <StarIcon className="w-4 h-4 text-white mr-1.5" />
                {restaurant.rating}
            </div>
        </div>
        <div className="p-6 flex-grow flex flex-col">
            <div className="flex flex-wrap gap-2 mb-4">
                {restaurant.categories?.map((c, i) => (
                    <motion.span 
                        key={c.id} 
                        className="text-sm bg-gray-100 text-gray-700 font-medium px-3 py-1 rounded-full"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 * i }}
                    >
                    {c.name}
                    </motion.span>
                ))}
            </div>
            <div className="grid grid-cols-2 gap-4 text-center my-4">
                <motion.div 
                    className="bg-gray-50 p-4 rounded-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <p className="font-bold text-xl text-green-600">{typeof restaurant.delivery_fee === 'number' ? `$${restaurant.delivery_fee.toFixed(2)}` : 'N/A'}</p>
                    <p className="text-sm text-gray-500">Costo de Entrega</p>
                </motion.div>
                <motion.div 
                    className="bg-gray-50 p-4 rounded-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <p className="font-bold text-xl">{restaurant.delivery_time} min</p>
                    <p className="text-sm text-gray-500">Tiempo Estimado</p>
                </motion.div>
            </div>
            <div className="mt-auto">
                <motion.button 
                    onClick={() => navigate(`/restaurants/${restaurant.id}`)}
                    className="w-full mt-6 bg-black text-white font-bold py-4 rounded-lg hover:bg-gray-800 transition-transform transform hover:scale-105 shadow-lg"
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
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon className="w-5 h-5"/></div>
                    </div>
                    <button onClick={() => setIsFiltersOpen(true)} className="p-2 bg-white border rounded-full flex-shrink-0 hover:bg-gray-100" aria-label="Filtros">
                        <SlidersIcon className="w-5 h-5 text-gray-600"/>
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
          <AdvancedFilters isOpen={isFiltersOpen} onClose={() => setIsFiltersOpen(false)} onApply={handleApplyFilters} initialFilters={filters}/>
      </div>
  )
};