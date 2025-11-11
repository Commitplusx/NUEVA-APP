import React, { useState, useEffect } from 'react';
import { useRestaurants } from '../../hooks/useRestaurants';
import { useCategories } from '../../hooks/useCategories';
import { addRestaurant, updateRestaurant, deleteRestaurant, uploadImage, addCategory, updateRestaurantCategories, getErrorMessage } from '../../services/api';
import { Restaurant, Category } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { Spinner } from '../Spinner';
import { PlusIcon, EditIcon, TrashIcon, AlertTriangleIcon, UtensilsIcon } from '../icons';
import { ManageMenuItems } from './ManageMenuItems';

const RestaurantForm: React.FC<{
  restaurant: Restaurant | null;
  allCategories: Category[];
  onSave: () => void;
  onCancel: () => void;
}> = ({ restaurant, allCategories, onSave, onCancel }) => {
  const { showToast } = useAppContext();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [deliveryFee, setDeliveryFee] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (restaurant) {
      setName(restaurant.name);
      setCategory(restaurant.categories?.map(c => c.name).join(', ') || '');
      setImageUrl(restaurant.image_url);
      setImagePreview(restaurant.image_url);
      setDeliveryFee(String(restaurant.delivery_fee));
      setDeliveryTime(String(restaurant.delivery_time));
    } else {
      setName('');
      setCategory('');
      setImageUrl('');
      setImageFile(null);
      setImagePreview(null);
      setDeliveryFee('');
      setDeliveryTime('');
    }
  }, [restaurant]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const fee = parseFloat(deliveryFee);
      const time = parseInt(deliveryTime, 10);

      if (isNaN(fee) || isNaN(time)) {
        showToast('El costo de envío y el tiempo de entrega deben ser números válidos.', 'error');
        setIsSaving(false);
        return;
      }

      let finalImageUrl = imageUrl;
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }

      let savedRestaurant: Restaurant;
      if (restaurant) {
        const restaurantData = { name, image_url: finalImageUrl, delivery_fee: fee, delivery_time: time, rating: restaurant.rating };
        savedRestaurant = await updateRestaurant(restaurant.id, restaurantData);
      } else {
        const restaurantData = { name, image_url: finalImageUrl, delivery_fee: fee, delivery_time: time };
        savedRestaurant = await addRestaurant(restaurantData);
      }

      const categoryNames = category.split(',').map(c => c.trim()).filter(c => c);
      const categoryIds: number[] = [];
      for (const catName of categoryNames) {
        let existingCategory = allCategories.find(c => c.name.toLowerCase() === catName.toLowerCase());
        if (existingCategory) {
          categoryIds.push(existingCategory.id);
        } else {
          const newCategory = await addCategory({ name: catName });
          categoryIds.push(newCategory.id);
        }
      }

      await updateRestaurantCategories(savedRestaurant.id, categoryIds);

      showToast(restaurant ? 'Restaurante actualizado!' : 'Restaurante agregado!', 'success');
      onSave();
    } catch (error: any) {
      console.error('Error saving restaurant:', error);
      showToast(getErrorMessage(error), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{restaurant ? 'Editar' : 'Agregar'} Restaurante</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="text" placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 h-12 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
          <input type="text" placeholder="Categorías (separadas por coma)" value={category} onChange={e => setCategory(e.target.value)} required className="w-full px-4 h-12 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <label className="block text-sm font-medium text-gray-700 mb-2">Imagen del Restaurante</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"/>
            {imagePreview && <img src={imagePreview} alt="Vista Previa" className="mt-4 w-32 h-32 object-cover rounded-lg shadow-md" />}
          </div>
          <input type="text" placeholder="Costo de Envío" value={deliveryFee} onChange={e => setDeliveryFee(e.target.value)} required className="w-full px-4 h-12 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
          <input type="text" placeholder="Tiempo de Entrega" value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)} required className="w-full px-4 h-12 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
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

const RestaurantList: React.FC<{
  restaurants: Restaurant[];
  onEdit: (restaurant: Restaurant) => void;
  onDelete: (id: number) => void;
  onManageMenu: (restaurant: Restaurant) => void;
}> = ({ restaurants, onEdit, onDelete, onManageMenu }) => {
  if (restaurants.length === 0) {
    return <p className="text-center text-gray-500 py-10">No hay restaurantes para mostrar.</p>;
  }

  return (
    <div className="space-y-4">
      {restaurants.map(restaurant => (
        <div key={restaurant.id} className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <img src={restaurant.image_url} alt={restaurant.name} className="w-20 h-20 rounded-md object-cover" />
              <div>
                <p className="font-bold text-lg text-gray-800">{restaurant.name}</p>
                <p className="text-sm text-gray-600">{restaurant.categories?.map(c => c.name).join(', ')}</p>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <button onClick={() => onManageMenu(restaurant)} className="p-2.5 bg-green-500 text-white rounded-full transition-colors hover:bg-green-600 shadow-sm"><UtensilsIcon className="w-5 h-5" /></button>
              <button onClick={() => onEdit(restaurant)} className="p-2.5 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"><EditIcon className="w-5 h-5" /></button>
              <button onClick={() => onDelete(restaurant.id)} className="p-2.5 text-red-600 hover:bg-red-100 rounded-full transition-colors"><TrashIcon className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const EMPTY_FILTERS = {};

export const ManageRestaurants: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { restaurants, loading, error } = useRestaurants({ searchQuery, filters: EMPTY_FILTERS });
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const { showToast } = useAppContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);

  const [isMenuManageOpen, setIsMenuManageOpen] = useState(false);
  const [selectedRestaurantForMenu, setSelectedRestaurantForMenu] = useState<Restaurant | null>(null);

  const handleAddNew = () => {
    setEditingRestaurant(null);
    setIsFormOpen(true);
  };

  const handleEdit = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setIsFormOpen(true);
  };

  const handleManageMenu = (restaurant: Restaurant) => {
    setSelectedRestaurantForMenu(restaurant);
    setIsMenuManageOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este restaurante?')) {
      try {
        await deleteRestaurant(id);
        showToast('Restaurante eliminado.', 'success');
      } catch (error) {
        console.error('Error deleting restaurant:', error);
        showToast('Error al eliminar.', 'error');
      }
    }
  };

  const filteredRestaurants = restaurants;

  const isAnyModalOpen = isFormOpen || isMenuManageOpen;
  return (
    <div className={`${isAnyModalOpen ? 'modal-open' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        <div className="w-1/2">
          <input 
            type="text"
            placeholder="Buscar restaurante..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <button 
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-orange-500 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-orange-600 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Agregar</span>
        </button>
      </div>

      {isFormOpen && (
        <RestaurantForm 
          restaurant={editingRestaurant}
          allCategories={categories}
          onSave={() => setIsFormOpen(false)}
          onCancel={() => setIsFormOpen(false)}
        />
      )}

      <div className="bg-white p-6 rounded-xl shadow-md">
        {loading || categoriesLoading ? (
          <Spinner />
        ) : error || categoriesError ? (
          <div className="text-center text-red-500 col-span-1 py-10 bg-red-50 rounded-lg">
            <AlertTriangleIcon className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <h3 className="text-lg font-semibold mb-2">Error al Cargar</h3>
            <p className="text-sm">{error || categoriesError}</p>
          </div>
        ) : (
          <RestaurantList 
            restaurants={filteredRestaurants} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
            onManageMenu={handleManageMenu}
          />
        )}
      </div>

      {isMenuManageOpen && selectedRestaurantForMenu && (
        <ManageMenuItems
          restaurantId={selectedRestaurantForMenu.id}
          restaurantName={selectedRestaurantForMenu.name}
          onClose={() => setIsMenuManageOpen(false)}
        />
      )}
    </div>
  );
};