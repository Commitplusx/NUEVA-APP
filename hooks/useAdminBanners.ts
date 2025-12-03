import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { getBanners, addBanner, deleteBanner } from '../services/api';
import { Banner } from '../types';

export const useAdminBanners = () => {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBanners = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getBanners();
            setBanners(data);
        } catch (err) {
            setError('No se pudieron cargar los banners.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBanners();

        const channel = supabase
            .channel('admin-banners-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'banners' }, () => {
                fetchBanners();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchBanners]);

    return { banners, loading, error, fetchBanners, addBanner, deleteBanner };
};
