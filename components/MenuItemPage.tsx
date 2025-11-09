import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spinner } from './Spinner';
import { ProductDetail } from './ProductDetail';
import { useRestaurantDetail } from '../hooks/useRestaurantDetail';
import { useAppContext } from '../context/AppContext';

export const MenuItemPage: React.FC = () => {
  const { id: restaurantId, itemId } = useParams<{ id: string; itemId: string }>();
  const navigate = useNavigate();
  const { restaurant, loading, error } = useRestaurantDetail(restaurantId || '');
  const { handleAddToCart } = useAppContext();

  if (loading) return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  if (!restaurant) return <div className="flex justify-center items-center h-screen text-gray-500">Restaurante no encontrado.</div>;

  const item = restaurant.menu.find(mi => String(mi.id) === String(itemId));

  if (!item) {
    return <div className="flex justify-center items-center h-screen text-gray-500">Producto no encontrado.</div>;
  }

  const onBack = () => navigate(-1);

  const onAddToCart = (menuItem: any, quantity: number, customizedIngredients: any[]) => {
    handleAddToCart(menuItem, quantity, customizedIngredients, restaurant);
  };

  return (
    <ProductDetail item={item} restaurant={restaurant} onAddToCart={onAddToCart} onBack={onBack} />
  );
};
