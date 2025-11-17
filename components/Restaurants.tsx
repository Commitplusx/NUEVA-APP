import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Restaurant } from '../types';
import { useRestaurants } from '../hooks/useRestaurants';
import { useThemeColor } from '../hooks/useThemeColor';
import { SearchIcon, StarIcon, ClockIcon, AlertTriangleIcon, SlidersIcon, StoreIcon } from './icons';
import { RestaurantCardSkeleton } from './RestaurantCardSkeleton';
import { Spinner } from './Spinner';
import { getTransformedImageUrl } from '../services/image';
import AdvancedFilters, { Filters } from './AdvancedFilters';

// --- Mobile View Component ---
const MobileRestaurantCard: React.FC<{ restaurant: Restaurant; onSelect: () => void; }> = ({ restaurant, onSelect }) => {
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
        <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">{restaurant.name}</h3>
        <div className="flex flex-wrap gap-2 mb-2">
          {restaurant.categories?.map(c => (
            <span key={c.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {c.name}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between text-sm text-gray-700 mt-3">
          <div className="flex items-center gap-1">
            <span className="text-sm">Entrega: </span>
            <span className="font-bold text-green-600">
              {typeof restaurant.delivery_fee === 'number' ? `$${restaurant.delivery_fee.toFixed(2)}` : 'N/A'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <ClockIcon className="w-4 h-4 text-gray-500" />
            <span className="font-semibold text-sm">{restaurant.delivery_time} min</span>
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
                    <h2 className="text-xl font-bold text-gray-800">Restaurantes</h2>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                    {loading && [...Array(6)].map((_, i) => <RestaurantCardSkeleton key={i} />)}
                    {!loading && error && <div className="text-center text-red-500 col-span-1 py-10"><p>{error}</p></div>}
                    {!loading && !error && restaurants.map((restaurant: Restaurant, index: number) => {
                        const isLastElement = restaurants.length === index + 1;
                        return (
                            <div key={restaurant.id} ref={isLastElement ? lastRestaurantElementRef : null}>
                                <MobileRestaurantCard
                                restaurant={restaurant}
                                onSelect={() => navigate(`/restaurants/${restaurant.id}`)}
                                />
                            </div>
                        );
                    })}
                    {loadingMore && <div className="col-span-1"><Spinner /></div>}
                    {!hasMore && restaurants.length > 0 && <p className="col-span-1 text-center text-gray-500 text-sm py-4">Has llegado al final de la lista.</p>}
                    {!loading && restaurants.length === 0 && <div className="col-span-1 text-center text-gray-500 p-4 mt-4"><p>No se encontraron restaurantes.</p></div>}
                </div>
            </section>
        </div>
    );
};


// --- Desktop View Components ---
const DesktopRestaurantListItem: React.FC<{ restaurant: Restaurant; onSelect: () => void; isSelected: boolean; }> = ({ restaurant, onSelect, isSelected }) => {
  const optimizedImageUrl = getTransformedImageUrl(restaurant.imageUrl || '', 100, 100);
  return (
    <motion.button
      onClick={onSelect}
      className={`w-full text-left p-3 flex items-center gap-4 rounded-lg transition-colors ${isSelected ? 'bg-orange-100' : 'hover:bg-gray-100'}`}
      whileTap={{ scale: 0.98 }}
    >
      <img src={optimizedImageUrl} alt={restaurant.name} className="w-16 h-16 rounded-md object-cover flex-shrink-0" />
      <div className="flex-grow overflow-hidden">
        <h4 className="font-bold text-gray-800 truncate">{restaurant.name}</h4>
        <p className="text-sm text-gray-500 truncate">{restaurant.categories?.map(c => c.name).join(', ')}</p>
        <div className="flex items-center gap-1 text-sm mt-1">
            <StarIcon className="w-4 h-4 text-yellow-500" />
            <span className="font-semibold">{restaurant.rating}</span>
            <span className="mx-1">·</span>
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
        <p className="text-gray-500 mt-2">Elige un restaurante de la lista para ver sus detalles y menú.</p>
      </div>
    )
  }

  const optimizedImageUrl = getTransformedImageUrl(restaurant.imageUrl || '', 800, 600);

  return (
    <div className="h-full bg-white rounded-2xl shadow-lg overflow-y-auto">
        <div className="relative w-full h-64 bg-gray-200">
            <img src={optimizedImageUrl} alt={restaurant.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <h2 className="absolute bottom-4 left-4 text-white text-3xl font-bold">{restaurant.name}</h2>
            <div className="absolute top-3 right-3 bg-yellow-400 text-white text-sm font-bold px-3 py-1 rounded-full flex items-center shadow-md">
                <StarIcon className="w-4 h-4 text-white mr-1" />
                {restaurant.rating}
            </div>
        </div>
        <div className="p-6">
            <div className="flex flex-wrap gap-2 mb-4">
                {restaurant.categories?.map(c => (
                    <span key={c.id} className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                    {c.name}
                    </span>
                ))}
            </div>
            <div className="flex items-center justify-around text-center border-y py-4 my-4">
                <div>
                    <p className="font-bold text-lg text-green-600">{typeof restaurant.delivery_fee === 'number' ? `$${restaurant.delivery_fee.toFixed(2)}` : 'N/A'}</p>
                    <p className="text-sm text-gray-500">Entrega</p>
                </div>
                <div>
                    <p className="font-bold text-lg">{restaurant.delivery_time} min</p>
                    <p className="text-sm text-gray-500">Tiempo Est.</p>
                </div>
            </div>
            <button 
                onClick={() => navigate(`/restaurants/${restaurant.id}`)}
                className="w-full mt-4 bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition-colors shadow-md"
            >
                Ver Menú Completo
            </button>
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
        <div className="h-screen max-h-screen overflow-hidden flex flex-col">
            <div className="flex-shrink-0 p-4 border-b">
                <div className="relative max-w-md mx-auto flex gap-3">
                    <div className="relative flex-grow">
                        <input type="text" placeholder="Busca tu restaurante..." className="w-full py-2 pl-10 pr-4 bg-gray-100 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon className="w-5 h-5"/></div>
                    </div>
                    <button onClick={() => setIsFiltersOpen(true)} className="p-2 bg-gray-100 border border-transparent rounded-full flex-shrink-0 hover:bg-gray-200" aria-label="Filtros">
                        <SlidersIcon className="w-5 h-5 text-gray-600"/>
                    </button>
                </div>
            </div>
            <div className="flex flex-grow overflow-hidden">
                <div className="w-1/3 max-w-sm flex-shrink-0 overflow-y-auto p-2 space-y-2 pr-2">
                    {loading && [...Array(8)].map((_, i) => <RestaurantCardSkeleton key={i} isDesktop={true} />)}
                    {!loading && error && <div className="text-center text-red-500 col-span-full py-10"><p>{error}</p></div>}
                    {!loading && !error && restaurants.map((restaurant: Restaurant, index: number) => {
                        const isLastElement = restaurants.length === index + 1;
                        return (
                        <div key={restaurant.id} ref={isLastElement ? lastRestaurantElementRef : null}>
                            <DesktopRestaurantListItem 
                                restaurant={restaurant} 
                                onSelect={() => setSelectedRestaurant(restaurant)}
                                isSelected={selectedRestaurant?.id === restaurant.id}
                            />
                        </div>
                        );
                    })}
                    {loadingMore && <div className="col-span-full flex justify-center py-4"><Spinner /></div>}
                    {!hasMore && restaurants.length > 0 && <p className="col-span-full text-center text-sm py-4">Fin de la lista.</p>}
                    {!loading && restaurants.length === 0 && <div className="col-span-full text-center p-4 mt-4"><p>No se encontraron restaurantes.</p></div>}
                </div>
                <main className="flex-grow p-4 bg-gray-50">
                    <AnimatePresence mode="wait">
                        <motion.div key={selectedRestaurant?.id || 'placeholder'} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}>
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