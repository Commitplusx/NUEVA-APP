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
            setFavorites(data || []);
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
                    setFavorites(prev => [data, ...prev]);
                }
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    return { favorites, loading, isFavorite, toggleFavorite, refreshFavorites: fetchFavorites };
};
