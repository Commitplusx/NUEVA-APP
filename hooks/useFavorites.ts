import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { MenuItem, Favorite } from '../types';
import { useAppContext } from '../context/AppContext';

export const useFavorites = () => {
    const { user } = useAppContext();
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchFavorites();
        } else {
            setFavorites([]);
            setLoading(false);
        }
    }, [user]);

    const fetchFavorites = async () => {
        try {
            const { data, error } = await supabase
                .from('favorites')
                .select('*, menu_item:menu_items(*)')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Map raw DB data to MenuItem type (image_url -> imageUrl)
            const formattedData = (data || []).map((fav: any) => ({
                ...fav,
                menu_item: fav.menu_item ? {
                    ...fav.menu_item,
                    imageUrl: fav.menu_item.image_url || fav.menu_item.imageUrl
                } : null
            }));

            setFavorites(formattedData);
        } catch (error) {
            console.error('Error fetching favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    const isFavorite = (menuItemId: number) => {
        return favorites.some(fav => fav.menu_item_id === menuItemId);
    };

    const toggleFavorite = async (menuItem: MenuItem) => {
        if (!user) return; // Or show login modal

        const existingFavorite = favorites.find(fav => fav.menu_item_id === menuItem.id);

        try {
            if (existingFavorite) {
                // Remove from favorites
                const { error } = await supabase
                    .from('favorites')
                    .delete()
                    .eq('id', existingFavorite.id);

                if (error) throw error;
                setFavorites(prev => prev.filter(fav => fav.id !== existingFavorite.id));
            } else {
                // Add to favorites
                const { data, error } = await supabase
                    .from('favorites')
                    .insert([{ user_id: user.id, menu_item_id: menuItem.id }])
                    .select('*, menu_item:menu_items(*)')
                    .single();

                if (error) throw error;
                if (data) {
                    const formattedFav = {
                        ...data,
                        menu_item: data.menu_item ? {
                            ...data.menu_item,
                            imageUrl: data.menu_item.image_url || data.menu_item.imageUrl
                        } : null
                    };
                    setFavorites(prev => [formattedFav, ...prev]);
                }
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    return { favorites, loading, isFavorite, toggleFavorite, refreshFavorites: fetchFavorites };
};
