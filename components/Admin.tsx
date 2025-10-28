import React, { useState, useEffect } from 'react';
import { useRestaurants } from '../hooks/useRestaurants';
import { addRestaurant, updateRestaurant, deleteRestaurant } from '../services/api';
import { Restaurant } from '../types';
import { Toast } from './Toast';
import { Spinner } from './Spinner';
import { PlusIcon, EditIcon, TrashIcon, AlertTriangleIcon } from './icons';

const Admin: React.FC = () => {
  const { restaurants, loading, error, fetchRestaurants } = useRestaurants();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddNew = () => {
    setEditingRestaurant(null);
    setIsFormOpen(true);
  };

  const handleEdit = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este restaurante?')) {
      try {
        await deleteRestaurant(id);
        showToast('Restaurante eliminado con éxito.');
      } catch (error) {
        console.error('Error deleting restaurant:', error);
        showToast('Error al eliminar el restaurante.');
      }
    }
  };

  const handleFormSave = () => {
    setIsFormOpen(false);
    setEditingRestaurant(null);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Panel de Administración</h1>
        <button 
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-orange-500 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-orange-600 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Agregar Restaurante
        </button>
      </header>

      {isFormOpen && (
        <RestaurantForm 
          restaurant={editingRestaurant}
          onSave={handleFormSave}
          onCancel={() => setIsFormOpen(false)}
          showToast={showToast}
        />
      )}

      <main className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Gestionar Restaurantes</h2>
        {loading ? (
          <Spinner />
        ) : error ? (
          <div className="text-center text-red-500 col-span-1 py-10 bg-red-50 rounded-lg">
            <AlertTriangleIcon className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <h3 className="text-lg font-semibold mb-2">Error al Cargar</h3>
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <RestaurantList 
            restaurants={restaurants} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
          />
        )}
      </main>
      <Toast message={toastMessage} />
    </div>
  );
};

interface RestaurantFormProps {
  restaurant: Restaurant | null;
  onSave: () => void;
  onCancel: () => void;
  showToast: (message: string) => void;
}

const RestaurantForm: React.FC<RestaurantFormProps> = ({ restaurant, onSave, onCancel, showToast }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (restaurant) {
      setName(restaurant.name);
      setCategory(restaurant.category);
      setImageUrl(restaurant.imageUrl);
      setDeliveryFee(restaurant.deliveryFee);
      setDeliveryTime(restaurant.deliveryTime);
    } else {
      setName('');
      setCategory('');
      setImageUrl('');
      setDeliveryFee('');
      setDeliveryTime('');
    }
  }, [restaurant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const restaurantData = { name, category, imageUrl, deliveryFee, deliveryTime };
      if (restaurant) {
        await updateRestaurant(restaurant.id, restaurantData);
        showToast('¡Restaurante actualizado con éxito!');
      } else {
        await addRestaurant(restaurantData);
        showToast('¡Restaurante agregado con éxito!');
      }
      onSave();
    } catch (error) {
      console.error('Error saving restaurant:', error);
      showToast('Error al guardar el restaurante.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{restaurant ? 'Editar' : 'Agregar'} Restaurante</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
          <input type="text" placeholder="Categoría" value={category} onChange={e => setCategory(e.target.value)} required className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
          <input type="url" placeholder="URL de la Imagen" value={imageUrl} onChange={e => setImageUrl(e.target.value)} required className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
          <input type="text" placeholder="Costo de Envío" value={deliveryFee} onChange={e => setDeliveryFee(e.target.value)} required className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
          <input type="text" placeholder="Tiempo de Entrega" value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)} required className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onCancel} className="px-6 py-2 text-gray-600 font-semibold bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancelar</button>
            <button type="submit" disabled={isSaving} className="px-6 py-2 text-white font-semibold bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400">
              {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface RestaurantListProps {
  restaurants: Restaurant[];
  onEdit: (restaurant: Restaurant) => void;
  onDelete: (id: number) => void;
}

const RestaurantList: React.FC<RestaurantListProps> = ({ restaurants, onEdit, onDelete }) => {
  if (restaurants.length === 0) {
    return <p className="text-center text-gray-500 py-10">No hay restaurantes para mostrar.</p>;
  }

  return (
    <div className="space-y-4">
      {restaurants.map(restaurant => (
        <div key={restaurant.id} className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 flex justify-between items-center hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <img src={restaurant.imageUrl} alt={restaurant.name} className="w-20 h-20 rounded-md object-cover" />
            <div>
              <p className="font-bold text-lg text-gray-800">{restaurant.name}</p>
              <p className="text-sm text-gray-600">{restaurant.category}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button onClick={() => onEdit(restaurant)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"><EditIcon className="w-5 h-5" /></button>
            <button onClick={() => onDelete(restaurant.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"><TrashIcon className="w-5 h-5" /></button>
          </div>
        </div>
      ))}
    </div>
  );
};

export { Admin };
