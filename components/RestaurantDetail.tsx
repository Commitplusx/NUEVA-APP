import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Restaurant, MenuItem, Ingredient } from '../types';
import { ChevronLeftIcon, StarIcon, ClockIcon, PlusIcon } from './icons';
import { Spinner } from './Spinner';
import { useRestaurantDetail } from '../hooks/useRestaurantDetail';
import { useThemeColor } from '../hooks/useThemeColor';
import { getTransformedImageUrl } from '../services/image';
import { ProductDetailModal } from './ProductDetailModal';
import { useAppContext } from '../context/AppContext';

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
const DesktopMenuItemCard: React.FC<{ item: MenuItem; onSelect: () => void; }> = ({ item, onSelect }) => {
    const optimizedImageUrl = getTransformedImageUrl(item.imageUrl || '', 400, 400);
    return (
        <motion.button
            onClick={onSelect}
            className="w-full h-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 flex flex-col overflow-hidden group hover:shadow-md"
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            layout
        >
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
                    <div className="bg-orange-100 p-1.5 rounded-full text-orange-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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

// --- Mobile Card (Vertical & Premium) ---
const MobileMenuItemCard: React.FC<{ item: MenuItem; onSelect: () => void; }> = ({ item, onSelect }) => {
    const optimizedImageUrl = getTransformedImageUrl(item.imageUrl || '', 400, 400);
    return (
        <motion.button
            onClick={onSelect}
            className="w-full text-left bg-white rounded-3xl p-3 flex flex-col gap-2 group active:scale-95 transition-all relative shadow-sm border border-gray-100 h-full"
            whileTap={{ scale: 0.98 }}
            layout
        >
            {/* Image Section */}
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-100">
                {optimizedImageUrl ? (
                    <motion.img
                        src={optimizedImageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-xs">Sin imagen</span>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="flex flex-col w-full px-1 flex-grow">
                <h3 className="font-bold text-gray-900 line-clamp-2 text-sm mb-1 leading-tight">{item.name}</h3>
                {item.description && <p className="text-[10px] text-gray-500 line-clamp-2 mb-2 leading-relaxed">{item.description}</p>}

                <div className="flex justify-between items-end mt-auto">
                    <p className="font-bold text-base text-green-600">${item.price.toFixed(2)}</p>
                    <div className="bg-yellow-400 text-white p-1.5 rounded-lg shadow-sm">
                        <PlusIcon className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </motion.button>
    );
};

// --- Mobile View ---
const MobileView: React.FC<any> = ({ restaurant, handleMenuItemSelect }) => {
    const navigate = useNavigate();
    const headerImageUrl = getTransformedImageUrl(restaurant.imageUrl || '', 800, 480);

    // Group menu items by category
    const menuByCategory = restaurant.menu.reduce((acc: { [key: string]: MenuItem[] }, item: MenuItem) => {
        const category = item.category || 'Varios';
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
    }, {});

    return (
        <div className="bg-white min-h-screen">
            <div className="relative">
                <motion.img
                    src={headerImageUrl}
                    alt={restaurant.name}
                    className="w-full h-56 object-cover"
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.7 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-5">
                    <motion.h1
                        className="text-white text-3xl font-extrabold drop-shadow-lg mb-1"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {restaurant.name}
                    </motion.h1>
                    <motion.div
                        className="flex items-center gap-2 text-white/90 font-medium text-sm"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-md">{restaurant.category}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" />
                            <span>{restaurant.delivery_time} min</span>
                        </div>
                    </motion.div>
                </div>
                <motion.button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 bg-white/20 backdrop-blur-md rounded-full p-2 text-white hover:bg-white/30 transition-colors"
                    whileTap={{ scale: 0.9 }}
                >
                    <ChevronLeftIcon className="w-6 h-6" />
                </motion.button>
            </div>

            <div className="p-4 pb-24 rounded-t-3xl bg-white -mt-6 relative z-10">
                {Object.entries(menuByCategory).map(([category, items], categoryIndex) => (
                    <motion.section
                        key={category}
                        className="mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ delay: categoryIndex * 0.1 }}
                    >
                        <h2 className="text-xl font-bold text-gray-900 mb-4 capitalize flex items-center gap-2">
                            {category.toLowerCase()}
                            <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{(items as MenuItem[]).length}</span>
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            {(items as MenuItem[]).map((item) => (
                                <MobileMenuItemCard key={item.id} item={item} onSelect={() => handleMenuItemSelect(item)} />
                            ))}
                        </div>
                    </motion.section>
                ))}
            </div>
        </div>
    );
};

// --- Desktop View ---
const DesktopView: React.FC<any> = ({ restaurant, handleMenuItemSelect }) => {
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
                                        className={`w-full text-left font-semibold px-4 py-2 rounded-lg transition-all duration-200 ${activeCategory === category ? 'bg-orange-100 text-orange-600 translate-x-1' : 'text-gray-600 hover:bg-gray-100'}`}
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
                                        <DesktopMenuItemCard item={item} onSelect={() => handleMenuItemSelect(item)} />
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
    const { handleAddToCart, isProductModalOpen, setIsProductModalOpen } = useAppContext();
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

    useThemeColor('#f97316');

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

    const handleModalAddToCart = (item: MenuItem, quantity: number, customizedIngredients: string[]) => {
        if (restaurant) {
            handleAddToCart(item, quantity, customizedIngredients, restaurant);
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

    const commonProps = { restaurant, handleMenuItemSelect };

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