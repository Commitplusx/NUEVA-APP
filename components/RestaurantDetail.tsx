import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Restaurant, MenuItem, Ingredient } from '../types';
import { ChevronLeftIcon, StarIcon, ClockIcon, PlusIcon, ArrowLeftIcon, HeartIcon } from './icons';
import { Spinner } from './Spinner';
import { useRestaurantDetail } from '../hooks/useRestaurantDetail';
import { useThemeColor } from '../hooks/useThemeColor';
import { getTransformedImageUrl } from '../services/image';
import { ProductDetailModal } from './ProductDetailModal';
import { useAppContext } from '../context/AppContext';
import { useFavorites } from '../hooks/useFavorites';

// --- Animation Variants ---
const containerVariants = {
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
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

// --- Desktop Card (Vertical & Premium) ---
const DesktopMenuItemCard: React.FC<{ item: MenuItem; onSelect: () => void; isFavorite: boolean; onToggleFavorite: (e: React.MouseEvent) => void; }> = ({ item, onSelect, isFavorite, onToggleFavorite }) => {
    const optimizedImageUrl = getTransformedImageUrl(item.imageUrl || '', 400, 400);
    return (
        <motion.button
            onClick={onSelect}
            className="w-full h-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 flex flex-col overflow-hidden group hover:shadow-md relative"
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            layout
        >
            <div
                onClick={onToggleFavorite}
                className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
            >
                <HeartIcon className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
            </div>

            {optimizedImageUrl && (
                <div className="w-full h-64 overflow-hidden relative">
                    <motion.img
                        src={optimizedImageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                </div>
            )}
            <div className="flex-1 flex flex-col p-5">
                <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="font-bold text-gray-900 line-clamp-2 text-xl">{item.name}</h3>
                    <div className="bg-purple-100 p-1.5 rounded-full text-purple-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <PlusIcon className="w-5 h-5" />
                    </div>
                </div>

                {item.description && <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">{item.description}</p>}

                <div className="flex-grow" />

                <div className="flex justify-between items-center pt-2 border-t border-gray-50 mt-2">
                    <p className="font-extrabold text-2xl text-gray-900">${item.price.toFixed(2)}</p>
                </div>
            </div>
        </motion.button>
    );
};

// --- Mobile Card (Updated to match reference) ---
const MobileMenuItemCard: React.FC<{ item: MenuItem; onSelect: () => void; isFavorite: boolean; onToggleFavorite: (e: React.MouseEvent) => void; }> = ({ item, onSelect, isFavorite, onToggleFavorite }) => {
    const optimizedImageUrl = getTransformedImageUrl(item.imageUrl || '', 400, 400);
    return (
        <motion.button
            onClick={onSelect}
            className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-100 flex gap-4 transition-all cursor-pointer group h-full text-left w-full relative"
            whileTap={{ scale: 0.98 }}
            layout
        >
            <div className="flex-1 py-1 flex flex-col justify-between">
                <div>
                    <h4 className="font-bold text-gray-800 text-lg group-hover:text-purple-700 transition-colors line-clamp-2">{item.name}</h4>
                    <p className="text-gray-400 text-sm line-clamp-2 mt-2 mb-3 leading-relaxed">{item.description}</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-purple-600 text-lg">${item.price.toFixed(2)}</span>
                    <div
                        onClick={onToggleFavorite}
                        className="p-2 -ml-2"
                    >
                        <HeartIcon className={`w-6 h-6 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-300'}`} />
                    </div>
                </div>
            </div>
            <div className="w-32 h-32 rounded-2xl overflow-hidden shrink-0 relative bg-gray-100">
                {optimizedImageUrl ? (
                    <img src={optimizedImageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.name} />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Sin imagen</div>
                )}
                <div className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-lg text-purple-600">
                    <PlusIcon className="w-4 h-4" />
                </div>
            </div>
        </motion.button>
    );
};

// --- Mobile View ---
const MobileView: React.FC<any> = ({ restaurant, handleMenuItemSelect, isFavorite, toggleFavorite }) => {
    const navigate = useNavigate();
    const headerImageUrl = getTransformedImageUrl(restaurant.imageUrl || '', 800, 480);
    const logoUrl = getTransformedImageUrl(restaurant.logoUrl || restaurant.imageUrl || '', 200, 200);
    const [activeCategory, setActiveCategory] = useState(0);

    // Group menu items by category
    const menuByCategory = restaurant.menu.reduce((acc: { [key: string]: MenuItem[] }, item: MenuItem) => {
        const category = item.category || 'Varios';
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
    }, {});

    const categories = Object.keys(menuByCategory);

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            <div className="relative h-64 md:h-80 w-full">
                <motion.img
                    src={headerImageUrl}
                    className="w-full h-full object-cover"
                    alt={restaurant.name}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.7 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute top-0 left-0 p-4 pt-[max(1rem,env(safe-area-inset-top))]">
                    <motion.button
                        onClick={() => navigate(-1)}
                        className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/30 transition-colors"
                        whileTap={{ scale: 0.9 }}
                    >
                        <ArrowLeftIcon className="w-6 h-6" />
                    </motion.button>
                </div>

                {/* Floating Info Card */}
                <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center translate-y-12 z-10">
                    <motion.div
                        className="bg-white p-4 rounded-[2rem] shadow-xl flex flex-col items-center w-full max-w-sm"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md shrink-0 bg-white -mt-14 border-4 border-white mb-2">
                            <img src={logoUrl} className="w-full h-full object-cover" alt="Logo" />
                        </div>
                        <h2 className="text-2xl font-bold leading-tight mb-1 text-center text-gray-900">{restaurant.name}</h2>
                        <div className="flex flex-wrap justify-center items-center gap-3 text-sm text-gray-500 font-medium mb-3">
                            <span className="flex items-center text-yellow-500 bg-yellow-50 px-2 py-0.5 rounded-lg">
                                <StarIcon className="w-3.5 h-3.5 mr-1" /> {restaurant.rating}
                            </span>
                            <span>• {restaurant.delivery_time} min</span>
                            <span>• Entrega ${restaurant.deliveryFee?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                            <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-xs font-bold border border-purple-100">{restaurant.category}</span>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="h-16"></div>

            <div className="px-4 sticky top-[70px] z-20 bg-gray-50/95 backdrop-blur-sm py-4 -mx-0 overflow-x-auto whitespace-nowrap scrollbar-hide mb-2">
                <div className="flex gap-2">
                    {categories.map((cat, idx) => (
                        <button
                            key={cat}
                            onClick={() => {
                                setActiveCategory(idx);
                                document.getElementById(`category-${cat}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }}
                            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeCategory === idx ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30 scale-105' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-100'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-4 space-y-8 pb-10">
                {Object.entries(menuByCategory).map(([category, items], categoryIndex) => (
                    <motion.div
                        key={category}
                        id={`category-${category}`}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ delay: categoryIndex * 0.1 }}
                    >
                        <h3 className="font-bold text-gray-800 text-xl mb-4 pl-3 border-l-4 border-purple-500">{category}</h3>
                        <div className="grid grid-cols-1 gap-4">
                            {(items as MenuItem[]).map((item) => (
                                <MobileMenuItemCard
                                    key={item.id}
                                    item={item}
                                    onSelect={() => handleMenuItemSelect(item)}
                                    isFavorite={isFavorite(item.id)}
                                    onToggleFavorite={(e) => {
                                        e.stopPropagation();
                                        toggleFavorite(item);
                                    }}
                                />
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

// --- Desktop View ---
const DesktopView: React.FC<any> = ({ restaurant, handleMenuItemSelect, isFavorite, toggleFavorite }) => {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState<string>('');
    const mainContentRef = useRef<HTMLDivElement>(null);

    const menuByCategory = restaurant.menu.reduce((acc: { [key: string]: MenuItem[] }, item: MenuItem) => {
        const category = item.category || 'Varios';
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
    }, {});
    const categories = Object.keys(menuByCategory);

    useEffect(() => {
        if (categories.length > 0) setActiveCategory(categories[0]);
    }, [restaurant]);

    const handleScroll = () => {
        const main = mainContentRef.current;
        if (!main) return;
        for (const category of categories) {
            const elem = document.getElementById(`category-${category}`);
            if (elem && elem.offsetTop <= main.scrollTop + main.offsetTop + 100) {
                setActiveCategory(category);
            }
        }
    };

    const scrollToCategory = (category: string) => {
        const elem = document.getElementById(`category-${category}`);
        if (elem) elem.scrollIntoView({ behavior: 'smooth' });
    };

    const headerImageUrl = getTransformedImageUrl(restaurant.imageUrl || '', 1200, 400);

    return (
        <div className="h-screen max-h-screen flex flex-col bg-white">
            <header className="relative h-48 flex-shrink-0 bg-gray-200 overflow-hidden">
                <motion.img
                    src={headerImageUrl}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                    initial={{ scale: 1.05 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.8 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                    <motion.h1
                        className="text-white text-4xl font-bold tracking-tight"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {restaurant.name}
                    </motion.h1>
                    <motion.p
                        className="text-white/90 text-lg"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        {restaurant.category}
                    </motion.p>
                </div>
                <motion.button
                    onClick={() => navigate(-1)}
                    className="absolute top-6 left-6 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg group"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <ChevronLeftIcon className="w-7 h-7 text-gray-900" />
                </motion.button>
            </header>
            <div className="flex flex-grow overflow-hidden">
                <aside className="w-64 flex-shrink-0 border-r overflow-y-auto p-4">
                    <nav className="sticky top-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 px-2">Menú</h3>
                        <ul>
                            {categories.map((category, i) => (
                                <motion.li
                                    key={category}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <button
                                        onClick={() => scrollToCategory(category)}
                                        className={`w-full text-left font-semibold px-4 py-2 rounded-lg transition-all duration-200 ${activeCategory === category ? 'bg-purple-100 text-purple-600 translate-x-1' : 'text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        {category}
                                    </button>
                                </motion.li>
                            ))}
                        </ul>
                    </nav>
                </aside>
                <main ref={mainContentRef} onScroll={handleScroll} className="flex-grow overflow-y-auto p-6 scroll-smooth">
                    {categories.map(category => (
                        <section key={category} id={`category-${category}`} className="mb-12 scroll-mt-4">
                            <motion.h2
                                className="text-3xl font-bold text-gray-900 mb-6 capitalize"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                            >
                                {category.toLowerCase()}
                            </motion.h2>
                            <motion.div
                                className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                                variants={containerVariants}
                                initial="hidden"
                                whileInView="show"
                                viewport={{ once: true, margin: "100px" }}
                            >
                                {menuByCategory[category].map((item) => (
                                    <motion.div key={item.id} variants={itemVariants}>
                                        <DesktopMenuItemCard
                                            item={item}
                                            onSelect={() => handleMenuItemSelect(item)}
                                            isFavorite={isFavorite(item.id)}
                                            onToggleFavorite={(e) => {
                                                e.stopPropagation();
                                                toggleFavorite(item);
                                            }}
                                        />
                                    </motion.div>
                                ))}
                            </motion.div>
                        </section>
                    ))}
                </main>
            </div>
        </div>
    )
}

// --- Main Component ---
export const RestaurantDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { restaurant, loading, error } = useRestaurantDetail(id || '');
    const { handleAddToCart, isProductModalOpen, setIsProductModalOpen, setSelectedRestaurant } = useAppContext();
    const { isFavorite, toggleFavorite } = useFavorites();
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

    useThemeColor('#9333ea');

    useEffect(() => {
        if (restaurant) {
            setSelectedRestaurant(restaurant);
        }
    }, [restaurant, setSelectedRestaurant]);

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleMenuItemSelect = (item: MenuItem) => {
        setSelectedItem(item);
        setIsProductModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsProductModalOpen(false);
        setSelectedItem(null);
    };

    const handleModalAddToCart = (item: MenuItem, quantity: number, customizedIngredients: string[], selectedOptions?: Record<string, string[]>) => {
        if (restaurant) {
            handleAddToCart(item, quantity, customizedIngredients, selectedOptions);
            handleCloseModal();
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
    }

    if (!restaurant) {
        return <div className="flex justify-center items-center h-screen text-gray-500">Restaurant not found.</div>;
    }

    const commonProps = { restaurant, handleMenuItemSelect, isFavorite, toggleFavorite };

    return (
        <div>
            {isDesktop ? <DesktopView {...commonProps} /> : <MobileView {...commonProps} />}
            <ProductDetailModal
                isOpen={isProductModalOpen}
                item={selectedItem}
                restaurant={restaurant}
                onClose={handleCloseModal}
                onAddToCart={handleModalAddToCart}
            />
        </div>
    );
};