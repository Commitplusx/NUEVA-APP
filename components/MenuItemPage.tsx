import React, { useState, useEffect } from 'react';
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

  const item = restaurant?.menu.find(mi => String(mi.id) === String(itemId));

  // 1. Estado para guardar los ingredientes seleccionados
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);

  // Efecto para iniciar el estado cuando el 'item' se carga
  useEffect(() => {
    if (item) {
      setSelectedIngredients(item.ingredients || []);
    }
  }, [item]);

  if (loading) return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  if (!restaurant || !item) return <div className="flex justify-center items-center h-screen text-gray-500">Producto no encontrado.</div>;

  const onBack = () => navigate(-1);

  // 2. La función de añadir al carrito ahora usa el estado interno
  const onAddToCart = (menuItem: any, quantity: number, ingredients: string[]) => {
    // El tercer argumento ahora es el estado 'selectedIngredients'
    handleAddToCart(menuItem, quantity, ingredients, restaurant);
  };

  // 3. Función para añadir/quitar ingredientes
  const handleToggleIngredient = (ingredientName: string) => {
    setSelectedIngredients(prev =>
      prev.includes(ingredientName)
        ? prev.filter(ing => ing !== ingredientName) // Si ya está, lo quita
        : [...prev, ingredientName] // Si no está, lo añade
    );
  };

  return (
    <ProductDetail 
      item={item} 
      restaurant={restaurant} 
      onAddToCart={onAddToCart} 
      onBack={onBack}
      // 4. Pasamos el estado y la función al componente hijo
      selectedIngredients={selectedIngredients}
      onToggleIngredient={handleToggleIngredient}
    />
  );
};
