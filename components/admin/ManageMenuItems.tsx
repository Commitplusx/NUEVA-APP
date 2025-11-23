import React, { useState, useEffect } from 'react';
import { MenuItem, Ingredient } from '../../types';
import { getMenuItems, addMenuItem, updateMenuItem, deleteMenuItem, uploadImage } from '../../services/api';
import { useAppContext } from '../../context/AppContext';
import { Spinner } from '../Spinner';
import { PlusIcon, EditIcon, TrashIcon, AlertTriangleIcon, XCircleIcon } from '../icons';

interface ManageMenuItemsProps {
  restaurantId: number;
  restaurantName: string;
  onClose: () => void;
}

const MenuItemForm: React.FC<{
  menuItem: MenuItem | null;
  restaurantId: number;
  onSave: () => void;
  onCancel: () => void;
}> = ({ menuItem, restaurantId, onSave, onCancel }) => {
  const { showToast } = useAppContext();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | string>('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPopular, setIsPopular] = useState(false);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [ingredientName, setIngredientName] = useState('');
  const [customizationGroups, setCustomizationGroups] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (menuItem) {
      setName(menuItem.name);
      setDescription(menuItem.description);
      setPrice(menuItem.price);
      setImageUrl(menuItem.image_url || '');
      setImagePreview(menuItem.image_url || '');
      setIsPopular(menuItem.is_popular || false);
      // Normalizar ingredientes: ahora esperamos string[]
      const rawIngredients = menuItem.ingredients || [];
      // Asegurarnos de que sea un array de strings, manejando datos antiguos
      const normalized = Array.isArray(rawIngredients)
        ? rawIngredients.map(ing => typeof ing === 'object' ? ing.name : ing).filter(Boolean)
        : [];
      setIngredients(normalized as string[]);
      setCustomizationGroups(menuItem.customizationOptions || []);
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setImageUrl('');
      setImageFile(null);
      setImagePreview(null);
      setIsPopular(false);
      setIngredients([]);
      setCustomizationGroups([]);
    }
  }, [menuItem]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleAddIngredient = () => {
    const trimmedName = ingredientName.trim();
    if (trimmedName && !ingredients.includes(trimmedName)) {
      setIngredients([...ingredients, trimmedName]);
      setIngredientName('');
    }
  };

  const handleRemoveIngredient = (name: string) => {
    setIngredients(ingredients.filter(ing => ing !== name));
  };

  const addCustomizationGroup = () => {
    setCustomizationGroups([
      ...customizationGroups,
      {
        id: Date.now().toString(),
        name: '',
        minSelect: 0,
        maxSelect: 10,
        includedItems: 0,
        pricePerExtra: 0,
        options: []
      }
    ]);
  };

  const removeCustomizationGroup = (id: string) => {
    setCustomizationGroups(customizationGroups.filter(g => g.id !== id));
  };

  const updateCustomizationGroup = (id: string, field: string, value: any) => {
    setCustomizationGroups(customizationGroups.map(g => {
      if (g.id === id) {
        return { ...g, [field]: value };
      }
      return g;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const parsedPrice = parseFloat(price as string);
      if (isNaN(parsedPrice)) {
        showToast('El precio debe ser un número válido.', 'error');
        setIsSaving(false);
        return;
      }

      let finalImageUrl = imageUrl;
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }

      const itemData = {
        restaurant_id: restaurantId,
        name,
        description,
        price: parsedPrice,
        image_url: finalImageUrl,
        is_popular: isPopular,
        ingredients: ingredients, // Ahora es un string[]
        customizationOptions: customizationGroups,
      };

      // DEBUG: Ver qué se está guardando
      console.log('📦 Guardando producto:', itemData);
      console.log('🎨 Grupos de personalización:', customizationGroups);
      console.log('📊 Cantidad de grupos:', customizationGroups.length);
      if (customizationGroups.length > 0) {
        console.log('🔍 Primer grupo completo:', JSON.stringify(customizationGroups[0], null, 2));
        console.log('🔍 Opciones del primer grupo:', customizationGroups[0].options);
        console.log('🔍 Cantidad de opciones:', customizationGroups[0].options?.length);
      }

      if (menuItem) {
        await updateMenuItem(menuItem.id, itemData);
        showToast('Producto actualizado!', 'success');
      } else {
        await addMenuItem(itemData);
        showToast('Producto agregado!', 'success');
      }
      onSave();
    } catch (error: any) {
      console.error('Error saving menu item:', error);
      showToast(`Error al guardar el producto: ${error.message || error}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{menuItem ? 'Editar' : 'Agregar'} Producto</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Nombre del Producto" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
          <textarea placeholder="Descripción" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-24 resize-none"></textarea>
          <input type="number" placeholder="Precio" value={price} onChange={e => setPrice(e.target.value)} required className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Imagen del Producto</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
            {imagePreview && <img src={imagePreview} alt="Vista Previa" className="mt-4 w-32 h-32 object-cover rounded-lg" />}
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isPopular" checked={isPopular} onChange={e => setIsPopular(e.target.checked)} className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded" />
            <label htmlFor="isPopular" className="text-sm font-medium text-gray-700">¿Es Popular?</label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ingredientes (Etiquetas simples)</label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                placeholder="Añadir ingrediente"
                value={ingredientName}
                onChange={e => setIngredientName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddIngredient(); } }}
                className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button type="button" onClick={handleAddIngredient} className="px-4 py-2 text-white font-semibold bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors">Añadir</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {ingredients.map(ing => (
                <div key={ing} className="flex items-center gap-2 bg-gray-200 text-gray-800 px-3 py-1 rounded-full">
                  <span>{ing}</span>
                  <button type="button" onClick={() => handleRemoveIngredient(ing)} className="text-red-500 hover:text-red-700">
                    <XCircleIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Customization Groups Section */}
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Grupos de Personalización (Toppings, Extras)</h3>
            <p className="text-sm text-gray-500 mb-4">Define grupos de opciones como "Elige tus toppings" o "Salsas".</p>

            {customizationGroups.map((group, index) => (
              <div key={group.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4 relative">
                <button
                  type="button"
                  onClick={() => removeCustomizationGroup(group.id)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nombre del Grupo</label>
                    <input
                      type="text"
                      value={group.name}
                      onChange={(e) => updateCustomizationGroup(group.id, 'name', e.target.value)}
                      placeholder="Ej: Toppings Incluidos"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Incluidos (Gratis)</label>
                      <input
                        type="number"
                        value={group.includedItems}
                        onChange={(e) => updateCustomizationGroup(group.id, 'includedItems', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Precio Extra</label>
                      <input
                        type="number"
                        value={group.pricePerExtra}
                        onChange={(e) => updateCustomizationGroup(group.id, 'pricePerExtra', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Opciones (Separadas por coma)</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Ej: Mango, Pepino, Aguacate"
                      id={`options-input-${group.id}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = e.currentTarget.value;
                          console.log('⌨️ Enter presionado, valor:', val);
                          if (val) {
                            const newOptions = val.split(',').map(s => ({ name: s.trim() })).filter(o => o.name);
                            console.log('✅ Nuevas opciones creadas:', newOptions);
                            const updatedOptions = [...group.options, ...newOptions];
                            updateCustomizationGroup(group.id, 'options', updatedOptions);
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                      className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById(`options-input-${group.id}`) as HTMLInputElement;
                        if (input && input.value) {
                          const val = input.value;
                          const newOptions = val.split(',').map(s => ({ name: s.trim() })).filter(o => o.name);
                          const updatedOptions = [...group.options, ...newOptions];
                          updateCustomizationGroup(group.id, 'options', updatedOptions);
                          input.value = '';
                        }
                      }}
                      className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                    >
                      Agregar
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {group.options.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-1 bg-white border border-gray-200 px-2 py-1 rounded text-xs">
                        <span>{opt.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newOpts = [...group.options];
                            newOpts.splice(idx, 1);
                            updateCustomizationGroup(group.id, 'options', newOpts);
                          }}
                          className="text-red-400 hover:text-red-600"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addCustomizationGroup}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-orange-500 hover:text-orange-500 transition-colors flex items-center justify-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Agregar Grupo de Opciones</span>
            </button>
          </div>
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

const MenuItemList: React.FC<{
  menuItems: MenuItem[];
  onEdit: (item: MenuItem) => void;
  onDelete: (id: number) => void;
}> = ({ menuItems, onEdit, onDelete }) => {
  if (menuItems.length === 0) {
    return <p className="text-center text-gray-500 py-10">No hay productos para mostrar.</p>;
  }

  return (
    <div className="space-y-4">
      {menuItems.map(item => (
        <div key={item.id} className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 flex justify-between items-center hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            {item.image_url && <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-md object-cover" />}
            <div>
              <p className="font-bold text-lg text-gray-800">{item.name}</p>
              <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
              {item.is_popular && <span className="text-xs font-bold text-orange-500 bg-orange-100 px-2 py-0.5 rounded-full">Popular</span>}
            </div>
          </div>
          <div className="flex space-x-2">
            <button onClick={() => onEdit(item)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"><EditIcon className="w-5 h-5" /></button>
            <button onClick={() => onDelete(item.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"><TrashIcon className="w-5 h-5" /></button>
          </div>
        </div>
      ))}
    </div>
  );
};

export const ManageMenuItems: React.FC<ManageMenuItemsProps> = ({ restaurantId, restaurantName, onClose }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const { showToast } = useAppContext();

  const fetchMenuItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMenuItems(restaurantId);
      setMenuItems(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los productos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, [restaurantId]);

  const handleAddNew = () => {
    setEditingMenuItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingMenuItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        await deleteMenuItem(id);
        showToast('Producto eliminado.', 'success');
        fetchMenuItems();
      } catch (err: any) {
        console.error('Error deleting menu item:', err);
        showToast(`Error al eliminar el producto: ${err.message || err}`, 'error');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-50 rounded-xl shadow-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Gestionar Menú de {restaurantName}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircleIcon className="w-7 h-7" />
          </button>
        </div>

        <div className="flex justify-end mb-4">
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-orange-500 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-orange-600 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Agregar Producto</span>
          </button>
        </div>

        {isFormOpen && (
          <MenuItemForm
            menuItem={editingMenuItem}
            restaurantId={restaurantId}
            onSave={() => { setIsFormOpen(false); fetchMenuItems(); }}
            onCancel={() => setIsFormOpen(false)}
          />
        )}

        <div className="bg-white p-6 rounded-xl shadow-md">
          {loading ? (
            <Spinner />
          ) : error ? (
            <div className="text-center text-red-500 col-span-1 py-10 bg-red-50 rounded-lg">
              <AlertTriangleIcon className="w-12 h-12 mx-auto mb-4 text-red-400" />
              <h3 className="text-lg font-semibold mb-2">Error al Cargar</h3>
              <p className="text-sm">{error}</p>
            </div>
          ) : (
            <MenuItemList
              menuItems={menuItems}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
};
