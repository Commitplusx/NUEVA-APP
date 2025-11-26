import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRestaurants } from '../../hooks/useRestaurants';
import { useCategories } from '../../hooks/useCategories';
import { addRestaurant, updateRestaurant, deleteRestaurant, uploadImage, addCategory, updateRestaurantCategories, getErrorMessage, reverseGeocode } from '../../services/api';
import { Restaurant, Category } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { Spinner } from '../Spinner';
import { PlusIcon, EditIcon, TrashIcon, AlertTriangleIcon, UtensilsIcon, MapPinIcon, BookOpenIcon } from '../icons';
import { ManageMenuItems } from './ManageMenuItems';
import { LocationPickerModal } from '../LocationPickerModal';

const RestaurantForm: React.FC<{
  restaurant: Restaurant | null;
  allCategories: Category[];
  onSave: () => void;
  onCancel: () => void;
}> = ({ restaurant, allCategories, onSave, onCancel }) => {
  const { showToast } = useAppContext();
  // Restaurant Info
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');

  // Image State
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Address and Location State
  const [streetAddress, setStreetAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  useEffect(() => {
    if (restaurant) {
      setName(restaurant.name);
      setCategory(restaurant.categories?.map(c => c.name).join(', ') || '');
      setImageUrl(restaurant.image_url);
      setImagePreview(restaurant.image_url);
      setDeliveryFee(String(restaurant.delivery_fee));
      setDeliveryTime(String(restaurant.delivery_time));
      setStreetAddress(restaurant.street_address || '');
      setNeighborhood(restaurant.neighborhood || '');
      setCity(restaurant.city || '');
      setPostalCode(restaurant.postal_code || '');
      setLat(restaurant.lat || null);
      setLng(restaurant.lng || null);
    } else {
      // Reset form
      setName('');
      setCategory('');
      setImageUrl('');
      setImageFile(null);
      setImagePreview(null);
      setDeliveryFee('');
      setDeliveryTime('');
      setStreetAddress('');
      setNeighborhood('');
      setCity('');
      setPostalCode('');
      setLat(null);
      setLng(null);
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

  const handleLocationSelect = async (location: { lat: number; lng: number }) => {
    setLat(location.lat);
    setLng(location.lng);
    showToast('Obteniendo dirección...', 'info');
    const addressDetails = await reverseGeocode(location.lat, location.lng);
    if (addressDetails) {
      setStreetAddress(addressDetails.address || '');
      setNeighborhood(addressDetails.neighborhood || '');
      setCity(addressDetails.city || '');
      setPostalCode(addressDetails.postalCode || '');
      showToast('Dirección actualizada.', 'success');
    } else {
      showToast('No se pudo obtener la dirección para esta ubicación.', 'error');
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

      if (!lat || !lng) {
        showToast('Por favor, selecciona una ubicación en el mapa.', 'error');
        setIsSaving(false);
        return;
      }

      let finalImageUrl = imageUrl;
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }

      const restaurantData = {
        name,
        imageUrl: finalImageUrl,
        deliveryFee: fee,
        deliveryTime: time,
        street_address: streetAddress,
        neighborhood,
        city,
        postal_code: postalCode,
        lat: lat,
        lng: lng,
        rating: restaurant?.rating || 0,
      };

      let savedRestaurant: Restaurant;
      if (restaurant) {
        savedRestaurant = await updateRestaurant(restaurant.id, restaurantData);
      } else {
        savedRestaurant = await addRestaurant(restaurantData);
      }

      const categoryNames = category.split(',').map(c => c.trim()).filter(c => c);
      const categoryIds: number[] = [];
      for (const catName of categoryNames) {
        let existingCategory = allCategories.find(c => c.name.toLowerCase() === catName.toLowerCase());
        if (existingCategory) {
          categoryIds.push(existingCategory.id);
        } else {
          const newCategory = await addCategory({ name: catName, icon: 'DefaultIcon' });
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

  const fullAddress = [streetAddress, neighborhood, city, postalCode].filter(Boolean).join(', ');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">{restaurant ? 'Editar Restaurante' : 'Nuevo Restaurante'}</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">Nombre del Restaurante</label>
                <input type="text" id="name" placeholder="Ej: Pizza Planet" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all" />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">Categorías</label>
                <input type="text" id="category" placeholder="pizzas, italiana, rápido" value={category} onChange={e => setCategory(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all" />
                <p className="text-xs text-gray-500 mt-2 ml-1">Separa las categorías con comas.</p>
              </div>

              {/* Address Fields */}
              <div className="md:col-span-2 bg-gray-50 p-6 rounded-xl border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-semibold text-gray-700">Ubicación</label>
                  <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded-md">Requerido</span>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {fullAddress || 'No se ha seleccionado ninguna ubicación.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPickerOpen(true)}
                  className="w-full py-3 bg-white border-2 border-blue-500 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                >
                  <MapPinIcon className="w-5 h-5" />
                  <span>{fullAddress ? 'Cambiar Ubicación' : 'Seleccionar en Mapa'}</span>
                </button>
              </div>

              <div>
                <label htmlFor="deliveryFee" className="block text-sm font-semibold text-gray-700 mb-2">Costo de Envío</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-400">$</span>
                  <input type="number" id="deliveryFee" step="0.01" min="0" placeholder="0.00" value={deliveryFee} onChange={e => setDeliveryFee(e.target.value)} required className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all" />
                </div>
              </div>

              <div>
                <label htmlFor="deliveryTime" className="block text-sm font-semibold text-gray-700 mb-2">Tiempo de Entrega</label>
                <div className="relative">
                  <input type="number" id="deliveryTime" min="0" placeholder="30" value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all" />
                  <span className="absolute right-4 top-3.5 text-gray-400 text-sm">min</span>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Imagen de Portada</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  {imagePreview ? (
                    <img src={imagePreview} alt="Vista Previa" className="w-full h-48 object-cover rounded-lg shadow-sm" />
                  ) : (
                    <div className="text-center">
                      <div className="bg-gray-200 p-3 rounded-full inline-block mb-2">
                        <span className="text-2xl">📷</span>
                      </div>
                      <p className="text-sm text-gray-500">Haz clic o arrastra una imagen aquí</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
              <button type="button" onClick={onCancel} className="px-6 py-2.5 text-gray-700 font-semibold bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={isSaving} className="px-6 py-2.5 text-white font-semibold bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl hover:from-orange-600 hover:to-orange-700 shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                {isSaving ? 'Guardando...' : 'Guardar Restaurante'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <LocationPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onLocationSelect={handleLocationSelect}
        initialCenter={lat && lng ? { lat, lng } : undefined}
      />
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
    return (
      <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <div className="bg-gray-100 p-4 rounded-full inline-block mb-4">
          <UtensilsIcon className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No hay restaurantes</h3>
        <p className="text-gray-500 mt-1">Comienza agregando tu primer restaurante.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {restaurants.map(restaurant => (
        <div key={restaurant.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
          {/* Cover Image */}
          <div className="relative h-48 w-full overflow-hidden">
            <img
              src={restaurant.image_url || 'https://via.placeholder.com/400x200'}
              alt={restaurant.name}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>

            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
              <span className="text-xs font-bold text-gray-800">⭐ {restaurant.rating || 'New'}</span>
            </div>

            <div className="absolute bottom-3 left-3 text-white">
              <h3 className="text-xl font-bold drop-shadow-md truncate max-w-[250px]">{restaurant.name}</h3>
              <div className="flex flex-wrap gap-1 mt-1">
                {restaurant.categories?.slice(0, 2).map((c, idx) => (
                  <span key={idx} className="text-[10px] font-medium bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/30">
                    {c.name}
                  </span>
                ))}
                {(restaurant.categories?.length || 0) > 2 && (
                  <span className="text-[10px] font-medium bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/30">
                    +{restaurant.categories!.length - 2}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 flex-1 flex flex-col">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                <span className="text-gray-400">🚚</span>
                <span className="font-medium text-gray-700">${restaurant.delivery_fee}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                <span className="text-gray-400">⏱️</span>
                <span className="font-medium text-gray-700">{restaurant.delivery_time} min</span>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-gray-100 grid grid-cols-3 gap-2">
              <button
                onClick={() => onManageMenu(restaurant)}
                className="flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-green-600 hover:bg-green-50 transition-colors group/btn"
                title="Gestionar Menú"
              >
                <BookOpenIcon className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                <span className="text-[10px] font-semibold">Menú</span>
              </button>

              <button
                onClick={() => onEdit(restaurant)}
                className="flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors group/btn"
                title="Editar Restaurante"
              >
                <EditIcon className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                <span className="text-[10px] font-semibold">Editar</span>
              </button>

              <button
                onClick={() => onDelete(restaurant.id)}
                className="flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors group/btn"
                title="Eliminar Restaurante"
              >
                <TrashIcon className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                <span className="text-[10px] font-semibold">Eliminar</span>
              </button>
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
  const { showToast, requestConfirmation } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();

  const action = searchParams.get('action');
  const modal = searchParams.get('modal');
  const restaurantId = searchParams.get('id');
  const menuRestaurantId = searchParams.get('restaurantId');

  const isFormOpen = action === 'new' || action === 'edit';
  const editingRestaurant = restaurantId ? restaurants.find(r => r.id === Number(restaurantId)) || null : null;

  const isMenuManageOpen = modal === 'menu';
  const selectedRestaurantForMenu = menuRestaurantId ? restaurants.find(r => r.id === Number(menuRestaurantId)) || null : null;

  const handleAddNew = () => {
    setSearchParams({ action: 'new' });
  };

  const handleEdit = (restaurant: Restaurant) => {
    setSearchParams({ action: 'edit', id: restaurant.id.toString() });
  };

  const handleManageMenu = (restaurant: Restaurant) => {
    setSearchParams({ modal: 'menu', restaurantId: restaurant.id.toString() });
  };

  const handleCloseForm = () => {
    setSearchParams({});
  };

  const handleDelete = (id: number) => {
    requestConfirmation(
      'Confirmar Eliminación',
      '¿Estás seguro de que quieres eliminar este restaurante? Esta acción no se puede deshacer.',
      async () => {
        try {
          await deleteRestaurant(id);
          showToast('Restaurante eliminado.', 'success');
        } catch (error: any) {
          console.error('Error deleting restaurant:', error);
          if (error.code === '23503') {
            showToast('No se puede eliminar: este restaurante ya tiene pedidos asociados.', 'error');
          } else {
            showToast('Error al eliminar el restaurante.', 'error');
          }
        }
      }
    );
  };

  const filteredRestaurants = restaurants;

  const isAnyModalOpen = isFormOpen || isMenuManageOpen;
  return (
    <div className={`${isAnyModalOpen ? 'modal-open' : ''}`}>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div className="w-full sm:w-1/2 relative">
          <input
            type="text"
            placeholder="Buscar restaurante..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
          />
          <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
        </div>
        <button
          onClick={handleAddNew}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all transform hover:-translate-y-0.5"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Nuevo Restaurante</span>
        </button>
      </div>

      {isFormOpen && (
        <RestaurantForm
          restaurant={editingRestaurant}
          allCategories={categories}
          onSave={handleCloseForm}
          onCancel={handleCloseForm}
        />
      )}

      <div className="bg-transparent">
        {loading || categoriesLoading ? (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        ) : error || categoriesError ? (
          <div className="bg-red-50 border border-red-100 rounded-xl p-8 text-center">
            <AlertTriangleIcon className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <h3 className="text-lg font-bold text-red-800 mb-2">Error al Cargar</h3>
            <p className="text-red-600">{error || categoriesError}</p>
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
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};