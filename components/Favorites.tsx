import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';
import { ArrowLeftIcon, HeartIcon, PlusIcon } from './icons';
import { getTransformedImageUrl } from '../services/image';
import { MenuItem } from '../types';
import { Spinner } from './Spinner';

const Favorites: React.FC = () => {
    const navigate = useNavigate();
    const { favorites, loading, toggleFavorite } = useFavorites();

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            <div className="bg-white sticky top-0 z-10 shadow-sm">
                <div className="px-4 py-4 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">Mis Favoritos</h1>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {favorites.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mb-6 relative"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                            >
                                <HeartIcon className="w-12 h-12 text-purple-400" />
                            </motion.div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-200 rounded-full opacity-50 blur-xl" />
                            <div className="absolute -bottom-2 -left-2 w-10 h-10 bg-purple-300 rounded-full opacity-30 blur-xl" />
                        </motion.div>

                        <motion.h3
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-2xl font-bold text-gray-900 mb-3"
                        >
                            ¡Aún no tienes favoritos!
                        </motion.h3>

                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-gray-500 mb-8 max-w-xs leading-relaxed"
                        >
                            Explora nuestros restaurantes y dale amor ❤️ a la comida que más te guste para guardarla aquí.
                        </motion.p>

                        <motion.button
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/restaurants')}
                            className="bg-purple-600 text-white px-8 py-3.5 rounded-full font-bold shadow-lg shadow-purple-500/30 hover:bg-purple-700 transition-all flex items-center gap-2"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Explorar comida
                        </motion.button>
                    </div>
                ) : (
                    favorites.map((fav) => (
                        <FavoriteItemCard
                            key={fav.id}
                            item={fav.menu_item!}
                            onToggle={() => toggleFavorite(fav.menu_item!)}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

const FavoriteItemCard: React.FC<{ item: MenuItem; onToggle: () => void }> = ({ item, onToggle }) => {
    const optimizedImageUrl = getTransformedImageUrl(item.imageUrl || '', 400, 400);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm flex gap-4"
        >
            <div className="flex-1 py-1 flex flex-col justify-between">
                <div>
                    <h4 className="font-bold text-gray-800 text-lg line-clamp-2">{item.name}</h4>
                    <p className="text-gray-400 text-sm line-clamp-2 mt-2 mb-3 leading-relaxed">{item.description}</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-purple-600 text-lg">${item.price.toFixed(2)}</span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggle();
                        }}
                        className="p-2 -ml-2"
                    >
                        <HeartIcon className="w-6 h-6 text-red-500 fill-current" />
                    </button>
                </div>
            </div>
            <div className="w-32 h-32 rounded-2xl overflow-hidden shrink-0 relative bg-gray-100">
                {optimizedImageUrl ? (
                    <img src={optimizedImageUrl} className="w-full h-full object-cover" alt={item.name} />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Sin imagen</div>
                )}
            </div>
        </motion.div>
    );
};

export default Favorites;
