import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Restaurant } from '../types';
import { useRestaurants } from '../hooks/useRestaurants';
import { useThemeColor } from '../hooks/useThemeColor';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { SearchIcon, StarIcon, ClockIcon, AlertTriangleIcon, SlidersIcon, StoreIcon, MotorcycleIcon, SparklesIcon, PlusIcon, ChevronRightIcon, GridIcon, HomeIcon, HeartIcon, ShoppingBagIcon, UtensilsIcon, UserIcon, ChevronDownIcon } from './icons';
import { RestaurantCardSkeleton } from './RestaurantCardSkeleton';
import { Spinner } from './Spinner';
import { getTransformedImageUrl } from '../services/image';
import AdvancedFilters, { Filters } from './AdvancedFilters';
import { ProductDetailModal } from './ProductDetailModal';
import { useAppContext } from '../context/AppContext';
import Lottie from 'lottie-react';
import profileAnimation from './animations/profile.json';

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
const Categories: React.FC<{ selectedCategory: number; onSelectCategory: (id: number) => void }> = ({ selectedCategory, onSelectCategory }) => {
  const categories = [
    { id: 1, name: 'Sandwich', image: '/images/sandwitch.jpg' },
    { id: 2, name: 'Pizza', image: '/images/pizza.jpg' },
    { id: 3, name: 'Burger', image: '/images/burger.jpg' },
    { id: 4, name: 'Drinks', image: '', icon: <StoreIcon className="w-8 h-8 text-gray-400" /> },
  ];

  return (
    <div className="mb-8 px-4">
      <div className="flex justify-between items-end mb-5">
        <h2 className="text-xl font-bold text-gray-900">Categorías</h2>
        <span
          onClick={() => onSelectCategory(0)}
          className="text-sm text-purple-600 font-semibold cursor-pointer hover:underline active:scale-95 transition-all"
        >
          Ver todas
        </span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-8 pt-4 px-2 snap-x snap-mandatory hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {categories.map((category) => {
          const isActive = selectedCategory === category.id;
          return (
            <motion.div
              key={category.id}
              layout
              onClick={() => onSelectCategory(category.id)}
              className={`relative flex-shrink-0 w-28 h-36 rounded-3xl flex flex-col items-center justify-end pb-4 snap-center cursor-pointer transition-all duration-300 group ${isActive
                ? 'bg-purple-600 shadow-xl shadow-purple-500/30 ring-4 ring-purple-500/20'
                : 'bg-white shadow-lg hover:shadow-xl border border-gray-100'
                }`}
              whileTap={{ scale: 0.95 }}
              animate={{
                y: isActive ? -5 : 0,
                scale: isActive ? 1.05 : 1,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {/* Image Container - Lowered Position */}
              <div className="absolute top-2 w-24 h-24 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-contain drop-shadow-2xl filter"
                  />
                ) : (
                  <div className="w-16 h-16 flex items-center justify-center bg-gray-50 rounded-full shadow-inner">
                    {category.icon}
                  </div>
                )}
              </div>

              {/* Category Name */}
              <span className={`font-bold text-sm tracking-wide z-10 transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-700'}`}>
                {category.name}
              </span>

              {/* Active Indicator Dot */}
              {isActive && (
                <motion.div
                  layoutId="activeCategoryDot"
                  className="absolute -bottom-2 w-1.5 h-1.5 bg-purple-400 rounded-full"
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// --- Mobile Restaurant Card (New Design) ---


// --- Mobile Restaurant Card (New Design) ---
const MobileRestaurantCard: React.FC<{ restaurant: Restaurant; onSelect: () => void; }> = ({ restaurant, onSelect }) => {
  const optimizedImageUrl = getTransformedImageUrl(restaurant.imageUrl || '', 400, 400);
  const isActive = restaurant.is_active !== false; // Default to true if undefined

  return (
    <div
      onClick={isActive ? onSelect : undefined}
      className={`w-full bg-white rounded-[2rem] p-3 shadow-lg border border-gray-100 transition-transform relative group ${isActive ? 'active:scale-95 cursor-pointer' : 'opacity-75 grayscale cursor-not-allowed'}`}
      role="button"
      tabIndex={0}
    >
      {/* Image Section */}
      <div className="h-36 rounded-[1.5rem] overflow-hidden relative mb-3 shadow-sm">
        {optimizedImageUrl ? (
          <img
            src={optimizedImageUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
            <StoreIcon className="w-10 h-10 opacity-30" />
          </div>
        )}

        {/* Time Badge Overlay */}
        {isActive && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-gray-800 flex items-center shadow-sm">
            <ClockIcon className="w-3 h-3 mr-1 text-purple-600" />
            {restaurant.delivery_time} min
          </div>
        )}

        {/* Inactive Overlay */}
        {!isActive && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
            <span className="bg-red-500 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg transform -rotate-3 border-2 border-white">
              Cerrado
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="px-1 pb-1">
        <div className="flex justify-between items-start mb-1">
          <h4 className="font-bold text-gray-800 text-base leading-tight line-clamp-1 flex-grow">{restaurant.name}</h4>
          <div className="flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded-md ml-2 flex-shrink-0">
            <StarIcon className="w-3 h-3 text-yellow-500" />
            <span className="text-xs font-bold text-gray-700">{restaurant.rating}</span>
          </div>
        </div>

        {/* Description */}
        {restaurant.description && (
          <p className="text-gray-500 text-xs mb-2 line-clamp-2 leading-relaxed">
            {restaurant.description}
          </p>
        )}

        {/* Categories */}
        <p className="text-gray-400 text-[10px] mb-3 line-clamp-1 font-medium">
          {restaurant.categories?.map(c => c.name).join(', ') || restaurant.category || 'Restaurant'}
        </p>

        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-gray-900">
            {Number(restaurant.delivery_fee || 0) === 0 ? 'Free' : `$${Number(restaurant.delivery_fee || 0).toFixed(2)}`}
          </span>

          {isActive && (
            <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center shadow-sm group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <PlusIcon className="w-5 h-5" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Mobile View Component ---
const MobileView: React.FC<any> = ({ restaurants, loading, loadingMore, hasMore, error, loadMore, searchQuery, setSearchQuery, setIsFiltersOpen, selectedCategory, onSelectCategory }) => {
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

  const { user, profile } = useAppContext();

  return (
    <div className="pb-20 pt-4 bg-white min-h-screen font-sans">
      <div className="px-4 pt-2 mb-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm bg-gray-100">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="User" className="w-full h-full object-cover" />
            ) : (
              <Lottie animationData={profileAnimation} loop={true} className="w-full h-full" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Entregar en</span>
            <div className="flex items-center gap-1 text-purple-700 font-bold">
              <span className="line-clamp-1 max-w-[200px]">
                {profile?.street_address ? `${profile.street_address} ${profile.neighborhood || ''}` : 'Seleccionar dirección'}
              </span>
              <ChevronDownIcon className="w-4 h-4" />
            </div>
          </div>
        </div>
        <button className="p-2 text-gray-600 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
          <GridIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="px-4 mb-6">
        <h1 className="text-3xl text-gray-800">Tu tiempo,</h1>
        <h1 className="text-3xl font-extrabold text-gray-900">nuestro trabajo</h1>
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
        <button onClick={() => setIsFiltersOpen(true)} className="p-4 bg-purple-600 text-white rounded-2xl shadow-none active:scale-95 transition-all flex-shrink-0" aria-label="Filtros">
          <SlidersIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Featured Section Removed as per design */}

      <Categories selectedCategory={selectedCategory} onSelectCategory={onSelectCategory} />

      <section className="px-4">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recommended</h2>
          <span className="text-xs text-gray-500 font-medium mb-1 bg-gray-100 px-2 py-0.5 rounded-full">{restaurants.length} lugares</span>
        </div>

        <motion.div
          className="grid grid-cols-2 gap-4"
          variants={listVariants}
          animate="show"
        >
          {loading && [...Array(6)].map((_, i) => <RestaurantCardSkeleton key={`skeleton-${i}`} />)}
          {!loading && error && <div key="error-msg" className="text-center text-red-500 col-span-2 py-10"><p>{error}</p></div>}
          {!loading && !error && restaurants.map((restaurant: Restaurant, index: number) => {
            const isLastElement = restaurants.length === index + 1;
            return (
              <motion.div
                key={restaurant.id}
                ref={isLastElement ? lastRestaurantElementRef : null}
                variants={itemVariants}
                layout
              >
                <MobileRestaurantCard
                  restaurant={restaurant}
                  onSelect={() => navigate(`/restaurants/${restaurant.id}`)}
                />
              </motion.div>
            );
          })}
          {loadingMore && <div className="col-span-2"><Spinner /></div>}
          {!hasMore && restaurants.length > 0 && <p className="col-span-2 text-center text-gray-400 text-[10px] py-4 font-medium tracking-wide uppercase">Has llegado al final</p>}
          {!loading && restaurants.length === 0 && <div className="col-span-2 text-center text-gray-500 p-6 mt-4 bg-gray-50 rounded-xl shadow-sm mx-2"><StoreIcon className="w-10 h-10 mx-auto text-gray-300 mb-2" /><p className="text-sm">No encontramos restaurantes por aquí.</p></div>}
        </motion.div>
      </section>
    </div>
  );
};


// --- Banner Component ---
// --- Banner Component ---
const Banner: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const bannerItems = [
    {
      title: "30% OFF",
      subtitle: "En tus restaurantes favoritos. ¡Solo por tiempo limitado!",
      tag: "Promo Flash",
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop",
      gradient: "from-[#4a148c] via-[#7b1fa2] to-[#9c27b0]"
    },
    {
      title: "2x1 Sushi",
      subtitle: "Los mejores rollos al mejor precio. ¡No te lo pierdas!",
      tag: "Martes Loco",
      image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=2070&auto=format&fit=crop",
      gradient: "from-[#c62828] via-[#d32f2f] to-[#e53935]"
    },
    {
      title: "Envío Gratis",
      subtitle: "En pedidos mayores a $200. ¡Aprovecha ahora!",
      tag: "Fin de Semana",
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2070&auto=format&fit=crop",
      gradient: "from-[#1565c0] via-[#1976d2] to-[#1e88e5]"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bannerItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleOrderNow = () => {
    const grid = document.getElementById('restaurants-grid');
    if (grid) grid.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative w-full h-64 rounded-[2rem] overflow-hidden mb-10 shadow-2xl group cursor-pointer">
      <AnimatePresence mode='wait'>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {/* Background with Gradient */}
          <div className={`absolute inset-0 bg-gradient-to-r ${bannerItems[currentIndex].gradient}`}></div>

          {/* Content */}
          <div className="absolute inset-0 flex items-center justify-between p-10">
            <div className="flex flex-col items-start z-10 space-y-4">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider border border-white/10"
              >
                {bannerItems[currentIndex].tag}
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-6xl font-black text-white leading-tight drop-shadow-md"
              >
                {bannerItems[currentIndex].title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-white/90 text-lg font-medium max-w-xs leading-relaxed"
              >
                {bannerItems[currentIndex].subtitle}
              </motion.p>
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                onClick={handleOrderNow}
                className="mt-2 bg-white text-purple-700 px-8 py-3.5 rounded-2xl font-bold shadow-lg hover:bg-purple-50 hover:scale-105 transition-all active:scale-95 text-base"
              >
                Pedir Ahora
              </motion.button>
            </div>

            {/* Image */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2 h-full">
              <img
                src={bannerItems[currentIndex].image}
                alt="Food Banner"
                className="w-full h-full object-cover mask-image-gradient"
                style={{ maskImage: 'linear-gradient(to right, transparent, black 20%)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 20%)' }}
              />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {bannerItems.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-6' : 'bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
};

// --- Desktop View (Redesigned) ---
const DesktopView: React.FC<any> = ({ restaurants, loading, loadingMore, hasMore, error, loadMore, searchQuery, setSearchQuery, isFiltersOpen, setIsFiltersOpen, selectedCategory, onSelectCategory, selectedRestaurant, setSelectedRestaurant }) => {
  const navigate = useNavigate();
  const { user, profile } = useAppContext();

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans pb-40 selection:bg-purple-100 selection:text-purple-900">

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-8 pt-8">

        {/* Header Section */}
        <header className="flex justify-between items-start mb-10">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-1">Entregar ahora</span>
            <div className="flex items-center gap-2 group cursor-pointer">
              <h1 className="text-2xl font-bold text-purple-700 group-hover:text-purple-800 transition-colors">
                {profile?.street_address ? `${profile.street_address} ${profile.neighborhood || ''}` : 'Seleccionar dirección'}
              </h1>
              <ChevronDownIcon className="w-5 h-5 text-purple-400 group-hover:translate-y-0.5 transition-transform" />
            </div>
          </div>

          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md cursor-pointer hover:ring-4 ring-purple-100 transition-all bg-gray-100">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="User" className="w-full h-full object-cover" />
            ) : (
              <Lottie animationData={profileAnimation} loop={true} className="w-full h-full" />
            )}
          </div>
        </header>

        {/* Search Bar */}
        <div className="flex gap-4 mb-12">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="¿Qué se te antoja hoy?"
              className="w-full py-5 pl-14 pr-6 bg-white border-none rounded-[2rem] shadow-sm focus:shadow-lg focus:ring-0 text-gray-700 placeholder-gray-400 text-lg transition-shadow duration-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
              <SearchIcon className="w-7 h-7" />
            </div>
          </div>
          <button
            onClick={() => setIsFiltersOpen(true)}
            className="w-16 h-16 bg-purple-600 text-white rounded-[1.5rem] shadow-lg shadow-purple-200 hover:bg-purple-700 active:scale-95 transition-all flex items-center justify-center flex-shrink-0"
          >
            <SlidersIcon className="w-7 h-7" />
          </button>
        </div>

        {/* Banner */}
        <Banner />

        {/* Categories */}
        <Categories selectedCategory={selectedCategory} onSelectCategory={onSelectCategory} />

        {/* Restaurants Grid */}
        <section id="restaurants-grid">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Restaurantes Recomendados</h2>
            <span className="text-sm text-gray-500 font-medium bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
              {restaurants.length} lugares cerca
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading && [...Array(6)].map((_, i) => <RestaurantCardSkeleton key={`skeleton-${i}`} />)}
            {!loading && error && <div className="col-span-full text-center text-red-500 py-10">{error}</div>}

            {!loading && !error && restaurants.map((restaurant: Restaurant) => (
              <MobileRestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onSelect={() => navigate(`/restaurants/${restaurant.id}`)}
              />
            ))}

            {!loading && restaurants.length === 0 && (
              <div className="col-span-full text-center py-20">
                <StoreIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">No encontramos restaurantes por aquí.</p>
              </div>
            )}
          </div>

          {loadingMore && <div className="py-8 flex justify-center"><Spinner /></div>}
        </section>

      </div>

    </div>
  );
};

// --- Main Component ---
export const Restaurants: React.FC = () => {
  // Initialize state from sessionStorage if available
  const [searchQuery, setSearchQuery] = useState(() => sessionStorage.getItem('restaurants_searchQuery') || '');
  const [filters, setFilters] = useState<Partial<Filters>>({});
  const [selectedCategory, setSelectedCategory] = useState<number>(() => {
    const saved = sessionStorage.getItem('restaurants_selectedCategory');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Persist state changes
  useEffect(() => {
    sessionStorage.setItem('restaurants_searchQuery', searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    sessionStorage.setItem('restaurants_selectedCategory', selectedCategory.toString());
  }, [selectedCategory]);

  const {
    restaurants,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
  } = useRestaurants({ searchQuery, filters });

  // Filter restaurants based on selected category and sort by active status
  const filteredRestaurants = React.useMemo(() => {
    let result = restaurants;

    if (selectedCategory) {
      result = result.filter(restaurant =>
        restaurant.categories?.some(cat => cat.id === selectedCategory)
      );
    }

    // Sort: Active first, Inactive last
    return [...result].sort((a, b) => {
      const aActive = a.is_active !== false; // Default true
      const bActive = b.is_active !== false;
      if (aActive === bActive) return 0;
      return aActive ? -1 : 1;
    });
  }, [restaurants, selectedCategory]);



  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  // Explicitly force status bar for Restaurants component
  useEffect(() => {
    const forceStatusBar = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          await StatusBar.setBackgroundColor({ color: '#ffffff' });

          // Toggle strategy: Set to Light first (White Icons), then to Dark (Black Icons)
          // This forces a redraw if the system thinks it's already in the target state
          await StatusBar.setStyle({ style: Style.Light });

          setTimeout(async () => {
            console.log('Forcing Style.Dark in Restaurants');
            await StatusBar.setStyle({ style: Style.Dark });
          }, 300);

        } catch (e) {
          console.error('Error forcing status bar in Restaurants:', e);
        }
      }
    };
    forceStatusBar();
  }, []);

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
          restaurants={filteredRestaurants}
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
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      ) : (
        <MobileView
          restaurants={filteredRestaurants}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          error={error}
          loadMore={loadMore}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setIsFiltersOpen={setIsFiltersOpen}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      )}

      <AdvancedFilters
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        initialFilters={{
          sortBy: filters.sortBy || 'rating',
          categories: filters.categories || []
        }}
        onApply={(newFilters) => setFilters(newFilters)}
      />
    </>
  );
};
