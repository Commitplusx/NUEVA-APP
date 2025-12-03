import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MenuItem, Category } from '../../types';
import { getMenuItems, addMenuItem, updateMenuItem, deleteMenuItem, uploadImage } from '../../services/api';
import { useAdminCategories } from '../../hooks/useAdminCategories';
import { useAppContext } from '../../context/AppContext';
import { Spinner } from '../Spinner';
import { PlusIcon, EditIcon, TrashIcon, AlertTriangleIcon, XCircleIcon, UtensilsIcon, ChevronRightIcon, ChevronLeftIcon, CheckIcon } from '../icons';

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

  // Form State
  const [currentStep, setCurrentStep] = useState(1);
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
      const rawIngredients = menuItem.ingredients || [];
      const normalized = Array.isArray(rawIngredients)
        ? rawIngredients.map(ing => typeof ing === 'object' ? (ing as any).name : ing).filter(Boolean)
        : [];
      setIngredients(normalized as string[]);
      setCustomizationGroups(menuItem.customizationOptions || []);
      setCategoryId(menuItem.category_id);
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

  // Customization Logic
  const addCustomizationGroup = () => {
    setCustomizationGroups([
      ...customizationGroups,
      {
        id: Date.now().toString(),
        name: '',
        minSelect: 0,
        maxSelect: 1,
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
      if (g.id === id) return { ...g, [field]: value };
      return g;
    }));
  };

  const handleSubmit = async () => {
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
        ingredients: ingredients,
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
      showToast(`Error: ${error.message || error}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const validateStep1 = () => {
    if (!name.trim()) return showToast('El nombre es requerido', 'error');
    if (!price) return showToast('El precio es requerido', 'error');
    if (!categoryId) return showToast('La categoría es requerida', 'error');
    setCurrentStep(2);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-end md:items-center z-[60] animate-fade-in p-0 md:p-4">
      <div className="bg-white w-full h-[95vh] md:h-auto md:max-h-[90vh] md:max-w-2xl md:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden flex flex-col animate-slide-up">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{menuItem ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            <p className="text-xs text-gray-500">Paso {currentStep} de 2</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
            <XCircleIcon className="w-8 h-8" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 w-full bg-gray-100">
          <div
            className="h-full bg-blue-500 transition-all duration-300 ease-out"
            style={{ width: currentStep === 1 ? '50%' : '100%' }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentStep === 1 ? (
            <div className="space-y-6 animate-fade-in">
              {/* Image Picker */}
              <div className="flex justify-center">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <UtensilsIcon className="w-10 h-10 text-gray-300" />
                    )}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl">
                    <span className="text-white text-xs font-bold">Cambiar Foto</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Platillo</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Ej. Hamburguesa Doble"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none h-24 resize-none"
                    placeholder="Ingredientes, preparación..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-gray-500">$</span>
                      <input
                        type="number"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                    <select
                      value={categoryId || ''}
                      onChange={e => setCategoryId(Number(e.target.value) || undefined)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="">Seleccionar</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <input
                    type="checkbox"
                    id="isPopular"
                    checked={isPopular}
                    onChange={e => setIsPopular(e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isPopular" className="text-sm font-medium text-gray-700">Marcar como Popular</label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ingredientes / Etiquetas</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={ingredientName}
                      onChange={e => setIngredientName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddIngredient()}
                      className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Ej. Picante, Vegano"
                    />
                    <button onClick={handleAddIngredient} className="px-4 py-2 bg-gray-900 text-white rounded-xl font-medium text-sm">
                      Agregar
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ingredients.map(ing => (
                      <span key={ing} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        {ing}
                        <button onClick={() => handleRemoveIngredient(ing)} className="text-gray-400 hover:text-red-500">&times;</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                <div className="bg-blue-100 p-2 rounded-lg h-fit">
                  <UtensilsIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-blue-900">Personalización</h4>
                  <p className="text-xs text-blue-700 mt-1">Agrega grupos de opciones como "Elige tu Salsa" o "Toppings Extra".</p>
                </div>
              </div>

              {customizationGroups.map((group, index) => (
                <div key={group.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-md">Grupo {index + 1}</span>
                      <input
                        type="text"
                        value={group.name}
                        onChange={(e) => updateCustomizationGroup(group.id, 'name', e.target.value)}
                        placeholder="Nombre del Grupo"
                        className="bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-900 placeholder-gray-400 w-40"
                      />
                    </div>
                    <button onClick={() => removeCustomizationGroup(group.id)} className="text-red-400 hover:text-red-600">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-400">Mínimo</label>
                        <input
                          type="number"
                          value={group.minSelect}
                          onChange={(e) => updateCustomizationGroup(group.id, 'minSelect', parseInt(e.target.value) || 0)}
                          className="w-full mt-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-400">Máximo</label>
                        <input
                          type="number"
                          value={group.maxSelect}
                          onChange={(e) => updateCustomizationGroup(group.id, 'maxSelect', parseInt(e.target.value) || 0)}
                          className="w-full mt-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-400">Precio Extra</label>
                        <input
                          type="number"
                          value={group.pricePerExtra}
                          onChange={(e) => updateCustomizationGroup(group.id, 'pricePerExtra', parseFloat(e.target.value) || 0)}
                          className="w-full mt-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-400 mb-2 block">Opciones</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Nueva opción (Enter)"
                          id={`opt-${group.id}`}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const val = e.currentTarget.value;
                              if (val) {
                                const newOpts = [...group.options, { name: val.trim() }];
                                updateCustomizationGroup(group.id, 'options', newOpts);
                                e.currentTarget.value = '';
                              }
                            }
                          }}
                          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {group.options.map((opt: any, idx: number) => (
                          <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded-md text-xs text-gray-600 shadow-sm">
                            {opt.name}
                            <button
                              onClick={() => {
                                const newOpts = [...group.options];
                                newOpts.splice(idx, 1);
                                updateCustomizationGroup(group.id, 'options', newOpts);
                              }}
                              className="text-gray-400 hover:text-red-500"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addCustomizationGroup}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Agregar Grupo</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-white flex justify-between items-center">
          {currentStep === 2 ? (
            <button
              onClick={() => setCurrentStep(1)}
              className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-2"
            >
              <ChevronLeftIcon className="w-5 h-5" />
              Atrás
            </button>
          ) : (
            <div></div> // Spacer
          )}

          {currentStep === 1 ? (
            <button
              onClick={validateStep1}
              className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors flex items-center gap-2 shadow-lg shadow-gray-200"
            >
              Siguiente
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-70"
            >
              {isSaving ? (
                <Spinner className="w-5 h-5 border-white" />
              ) : (
                <>
                  <CheckIcon className="w-5 h-5" />
                  Guardar Producto
                </>
              )}
            </button>
          )}
        </div>
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
  }, [menuItems, categories]);

  return (
    <div className="space-y-8 pb-20">
      {Object.entries(groupedItems.groups).map(([categoryName, items]) => (
        <div key={categoryName}>
          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2 sticky top-0 bg-gray-50 py-2 z-10">
            <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
            {categoryName}
            <span className="text-xs font-normal text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-100">
              {items.length}
            </span>
          </h3>
          <div className="flex flex-col gap-3">
            {items.map(item => (
              <MenuItemCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        </div>
      ))}

      {groupedItems.uncategorized.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2 sticky top-0 bg-gray-50 py-2 z-10">
            <span className="w-1 h-5 bg-gray-400 rounded-full"></span>
            Sin Categoría
          </h3>
          <div className="flex flex-col gap-3">
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
  <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex gap-3 items-start hover:shadow-md transition-shadow">
    {/* Image - Left */}
    <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden relative">
      {item.image_url ? (
        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-300">
          <UtensilsIcon className="w-6 h-6" />
        </div>
      )}
      {item.is_popular && (
        <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[8px] font-bold px-1.5 py-0.5 rounded-bl-lg">
          ★
        </div>
      )}
    </div>

    {/* Content - Middle */}
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-start">
        <h4 className="font-bold text-gray-900 text-sm truncate pr-2">{item.name}</h4>
        <span className="font-bold text-blue-600 text-sm">${item.price.toFixed(2)}</span>
      </div>

      <p className="text-xs text-gray-500 line-clamp-2 mt-0.5 h-8">
        {item.description || 'Sin descripción'}
      </p>

      <div className="flex items-center justify-between mt-2">
        <div className="flex gap-1 overflow-hidden">
          {item.ingredients && item.ingredients.slice(0, 2).map((ing, idx) => (
            <span key={idx} className="text-[10px] bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded border border-gray-100 truncate max-w-[60px]">
              {ing}
            </span>
          ))}
        </div>

        {/* Actions - Right (Inline for mobile ease) */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <EditIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
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
        showToast(`Error: ${err.message || err}`, 'error');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in p-0 md:p-4">
      <div className="bg-gray-50 w-full h-full md:h-[90vh] md:max-w-4xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white px-4 py-3 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-800 leading-tight">Menú</h2>
            <p className="text-xs text-gray-500 truncate max-w-[200px]">{restaurantName}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Filters & Actions */}
        <div className="px-4 py-3 bg-white border-b border-gray-100 flex gap-3 overflow-x-auto no-scrollbar flex-shrink-0">
          <button
            onClick={() => setFilterCategoryId('all')}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${filterCategoryId === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilterCategoryId(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${filterCategoryId === cat.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <Spinner />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-10">
              <AlertTriangleIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>{error}</p>
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

        {/* Floating Action Button (Mobile Style) */}
        <div className="absolute bottom-6 right-6 md:static md:hidden">
          <button
            onClick={handleAddNew}
            className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-300 flex items-center justify-center hover:scale-105 transition-transform"
          >
            <PlusIcon className="w-8 h-8" />
          </button>
        </div>

        {/* Desktop Add Button (Hidden on Mobile) */}
        <div className="hidden md:block p-4 border-t border-gray-200 bg-white">
          <button
            onClick={handleAddNew}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Agregar Nuevo Producto
          </button>
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
