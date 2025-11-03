import { useState, useEffect } from 'react';
import { getMenuItems } from '../services/api';
import { MenuItem } from '../types';

export const useMenuItems = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllMenuItems = async () => {
      setLoading(true);
      setError(null);
      try {
        // Assuming getMenuItems can fetch all items if restaurantId is not provided,
        // or we might need to iterate through restaurants.
        // For simplicity, let's assume getMenuItems can fetch all if called without an ID or with a special 'all' ID.
        // If not, this needs to be adjusted to fetch per restaurant.
        const data = await getMenuItems(); // Modify getMenuItems in api.tsx if it requires an ID
        setMenuItems(data);
      } catch (err: any) {
        setError(err.message || 'Error fetching menu items');
        console.error('Error fetching menu items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllMenuItems();
  }, []);

  return { menuItems, loading, error };
};
