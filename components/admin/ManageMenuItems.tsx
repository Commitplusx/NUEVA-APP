import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MenuItem, Ingredient, Category } from '../../types';
import { getMenuItems, addMenuItem, updateMenuItem, deleteMenuItem, uploadImage } from '../../services/api';
import { useAdminCategories } from '../../hooks/useAdminCategories';
import { useAppContext } from '../../context/AppContext';
import { Spinner } from '../Spinner';
import { PlusIcon, EditIcon, TrashIcon, AlertTriangleIcon, XCircleIcon, UtensilsIcon } from '../icons';
import * as LucideIcons from 'lucide-react';

interface ManageMenuItemsProps {
  restaurantId: number;
  restaurantName: string;
  onClose: () => void;
}

const MenuItemForm: React.FC<{
  menuItem: MenuItem | null;
  restaurantId: number;
  categories: Category[];
  onSave: () => void;
  onCancel: () => void;
}> = ({ menuItem, restaurantId, categories, onSave, onCancel }) => {
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
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
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
      setCategoryId(menuItem.category_id);
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
      setCategoryId(undefined);
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
        category_id: categoryId,
      };

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
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-[60] animate-fade-in p-4">
      <style>{`
        @keyframes modalPop {
          0% { opacity: 0; transform: scale(0.95) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-modal-pop {
          animation: modalPop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-modal-pop relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{menuItem ? 'Editar' : 'Agregar'} Producto</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full">
            <XCircleIcon className="w-8 h-8" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Nombre del Producto" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
          <textarea placeholder="Descripción" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none transition-all"></textarea>
          <input type="number" placeholder="Precio" value={price} onChange={e => setPrice(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Categoría</label>
            <select
              value={categoryId || ''}
              onChange={e => setCategoryId(Number(e.target.value) || undefined)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="">Sin Categoría</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Imagen del Producto</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            {imagePreview && <img src={imagePreview} alt="Vista Previa" className="mt-4 w-32 h-32 object-cover rounded-xl" />}
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isPopular" checked={isPopular} onChange={e => setIsPopular(e.target.checked)} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            <label htmlFor="isPopular" className="text-sm font-medium text-gray-700">¿Es Popular?</label>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Ingredientes (Etiquetas simples)</label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                placeholder="Añadir ingrediente"
                value={ingredientName}
                onChange={e => setIngredientName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddIngredient(); } }}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <button type="button" onClick={handleAddIngredient} className="px-4 py-2 text-white font-semibold bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors">Añadir</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {ingredients.map(ing => (
                <div key={ing} className="flex items-center gap-2 bg-gray-100 text-gray-800 px-3 py-1 rounded-full border border-gray-200">
                  <span>{ing}</span>
                  <button type="button" onClick={() => handleRemoveIngredient(ing)} className="text-red-500 hover:text-red-700">
                    <XCircleIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Customization Groups Section */}
          <div className="border-t border-gray-100 pt-4 mt-4">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Grupos de Personalización</h3>
            <p className="text-sm text-gray-500 mb-4">Define grupos de opciones como "Elige tus toppings" o "Salsas".</p>

            {customizationGroups.map((group, index) => (
              <div key={group.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4 relative">
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
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Incluidos (Gratis)</label>
                      <input
                        type="number"
                        value={group.includedItems}
                        onChange={(e) => updateCustomizationGroup(group.id, 'includedItems', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Precio Extra</label>
                      <input
                        type="number"
                        value={group.pricePerExtra}
                        onChange={(e) => updateCustomizationGroup(group.id, 'pricePerExtra', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                          if (val) {
                            const newOptions = val.split(',').map(s => ({ name: s.trim() })).filter(o => o.name);
                            const updatedOptions = [...group.options, ...newOptions];
                            updateCustomizationGroup(group.id, 'options', updatedOptions);
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                      className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                      className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Agregar
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {group.options.map((opt: any, idx: number) => (
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
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Agregar Grupo de Opciones</span>
            </button>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onCancel} className="px-6 py-2.5 text-gray-700 font-semibold bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">Cancelar</button>
            <button type="submit" disabled={isSaving} className="px-6 py-2.5 text-white font-semibold bg-blue-500 rounded-xl hover:bg-blue-600 shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed">
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
  categories: Category[];
  onEdit: (item: MenuItem) => void;
  onDelete: (id: number) => void;
}> = ({ menuItems, categories, onEdit, onDelete }) => {
  if (menuItems.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <div className="bg-gray-100 p-4 rounded-full inline-block mb-4">
          <UtensilsIcon className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No hay productos</h3>
        <p className="text-gray-500 mt-1">Comienza agregando platillos al menú.</p>
      </div>
    );
  }

  // Group items by category
  const groupedItems = React.useMemo(() => {
    const groups: Record<string, MenuItem[]> = {};
    const uncategorized: MenuItem[] = [];

    menuItems.forEach(item => {
      if (item.category_id) {
        const cat = categories.find(c => c.id === item.category_id);
        const key = cat ? cat.name : 'Categoría Desconocida';
        if (!groups[key]) groups[key] = [];
        groups[key].push(item);
      } else {
        uncategorized.push(item);
      }
    });

    return { groups, uncategorized };
  }, [menuItems, categories]) as { groups: Record<string, MenuItem[]>; uncategorized: MenuItem[] };

  return (
    <div className="space-y-10">
      {Object.entries(groupedItems.groups).map(([categoryName, items]) => (
        <div key={categoryName}>
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
            {categoryName}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => (
              <MenuItemCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        </div>
      ))}

      {groupedItems.uncategorized.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-gray-400 rounded-full"></span>
            Sin Categoría
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedItems.uncategorized.map(item => (
              <MenuItemCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const MenuItemCard: React.FC<{ item: MenuItem; onEdit: (item: MenuItem) => void; onDelete: (id: number) => void }> = ({ item, onEdit, onDelete }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
    {/* Cover Image */}
    <div className="relative h-48 w-full overflow-hidden bg-gray-100">
      <img
        src={item.image_url || 'https://via.placeholder.com/400x300?text=No+Image'}
        alt={item.name}
        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>

      {item.is_popular && (
        <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
          <span>★ Popular</span>
        </div>
      )}

      <div className="absolute bottom-3 left-3 text-white">
        <span className="text-lg font-bold bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20">
          ${item.price.toFixed(2)}
        </span>
      </div>
    </div>

    {/* Content */}
    <div className="p-4 flex-1 flex flex-col">
      <div className="mb-3">
        <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1" title={item.name}>{item.name}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 h-10">{item.description || 'Sin descripción'}</p>
      </div>

      {/* Ingredients / Tags */}
      <div className="flex flex-wrap gap-1 mb-4">
        {item.ingredients && item.ingredients.length > 0 ? (
          item.ingredients.slice(0, 3).map((ing, idx) => (
            <span key={idx} className="text-[10px] font-medium bg-gray-50 text-gray-600 px-2 py-1 rounded-md border border-gray-100">
              {ing}
            </span>
          ))
        ) : (
          <span className="text-[10px] text-gray-400 italic">Sin ingredientes listados</span>
        )}
        {item.ingredients && item.ingredients.length > 3 && (
          <span className="text-[10px] font-medium bg-gray-50 text-gray-600 px-2 py-1 rounded-md border border-gray-100">
            +{item.ingredients.length - 3}
          </span>
        )}
      </div>

      <div className="mt-auto pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
        <button
          onClick={() => onEdit(item)}
          className="flex items-center justify-center gap-2 py-2 rounded-xl text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors font-medium text-sm"
        >
          <EditIcon className="w-4 h-4" />
          <span>Editar</span>
        </button>

        <button
          onClick={() => onDelete(item.id)}
          className="flex items-center justify-center gap-2 py-2 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-colors font-medium text-sm"
        >
          <TrashIcon className="w-4 h-4" />
          <span>Eliminar</span>
        </button>
      </div>
    </div>
  </div>
);

export const ManageMenuItems: React.FC<ManageMenuItemsProps> = ({ restaurantId, restaurantName, onClose }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const { categories, fetchCategories } = useAdminCategories();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCategoryId, setFilterCategoryId] = useState<number | 'all'>('all');
  const { showToast } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();

  const action = searchParams.get('action');
  const itemId = searchParams.get('itemId');

  const isFormOpen = action === 'new_item' || action === 'edit_item';
  const editingMenuItem = itemId ? menuItems.find(i => i.id === Number(itemId)) || null : null;

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
    fetchCategories();
  }, [restaurantId]);

  const handleAddNew = () => {
    setSearchParams(prev => {
      prev.set('action', 'new_item');
      return prev;
    });
  };

  const handleEdit = (item: MenuItem) => {
    setSearchParams(prev => {
      prev.set('action', 'edit_item');
      prev.set('itemId', item.id.toString());
      return prev;
    });
  };

  const handleCloseItemForm = () => {
    setSearchParams(prev => {
      prev.delete('action');
      prev.delete('itemId');
      return prev;
    });
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
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in p-4">
      <style>{`
        @keyframes modalPop {
          0% { opacity: 0; transform: scale(0.95) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-modal-pop {
          animation: modalPop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
      <div className="bg-gray-50 rounded-2xl shadow-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-modal-pop">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Gestionar Menú de {restaurantName}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <XCircleIcon className="w-8 h-8" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="w-full md:w-1/3">
            <select
              value={filterCategoryId}
              onChange={(e) => setFilterCategoryId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              <option value="all">Todas las Categorías</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
              <option value="-1">Sin Categoría</option>
            </select>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md hover:bg-blue-600 transition-all transform hover:-translate-y-0.5"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Agregar Producto</span>
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 col-span-1 py-10 bg-red-50 rounded-xl border border-red-100">
              <AlertTriangleIcon className="w-12 h-12 mx-auto mb-4 text-red-400" />
              <h3 className="text-lg font-semibold mb-2">Error al Cargar</h3>
              <p className="text-sm">{error}</p>
            </div>
          ) : (
            <MenuItemList
              menuItems={
                filterCategoryId === 'all'
                  ? menuItems
                  : filterCategoryId === -1
                    ? menuItems.filter(i => !i.category_id)
                    : menuItems.filter(i => i.category_id === filterCategoryId)
              }
              categories={categories}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>

      {isFormOpen && (
        <MenuItemForm
          menuItem={editingMenuItem}
          restaurantId={restaurantId}
          categories={categories}
          onSave={() => { handleCloseItemForm(); fetchMenuItems(); }}
          onCancel={handleCloseItemForm}
        />
      )}
    </div>
  );
};
