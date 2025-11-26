import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAdminCategories } from '../../hooks/useAdminCategories';
import { Category } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { Spinner } from '../Spinner';
import * as LucideIcons from 'lucide-react';

// Helper to find icon dynamically
const IconComponent: React.FC<{ iconName: string }> = ({ iconName }) => {
  // Normalize icon name
  let normalized = iconName || '';

  // Map Spanish/English names to specific Lucide icons
  if (normalized.match(/pizza/i)) return <LucideIcons.Pizza className="w-6 h-6 text-blue-600" />;
  if (normalized.match(/burger|hamburg/i)) return <LucideIcons.Sandwich className="w-6 h-6 text-blue-600" />;
  if (normalized.match(/taco|mexicana/i)) return <LucideIcons.UtensilsCrossed className="w-6 h-6 text-blue-600" />;
  if (normalized.match(/pollo|chicken|alitas|wings|nugget/i)) return <LucideIcons.Utensils className="w-6 h-6 text-blue-600" />;
  if (normalized.match(/sushi|mariscos|seafood|fish/i)) return <LucideIcons.Fish className="w-6 h-6 text-blue-600" />;
  if (normalized.match(/saludable|healthy|ensalada|veggie/i)) return <LucideIcons.Leaf className="w-6 h-6 text-blue-600" />;
  if (normalized.match(/bebida|drink|jugo|juice|refresco|soda/i)) return <LucideIcons.CupSoda className="w-6 h-6 text-blue-600" />;
  if (normalized.match(/cafe|coffee/i)) return <LucideIcons.Coffee className="w-6 h-6 text-blue-600" />;
  if (normalized.match(/postre|dessert|cake|pastel/i)) return <LucideIcons.Cake className="w-6 h-6 text-blue-600" />;
  if (normalized.match(/helado|ice cream/i)) return <LucideIcons.IceCream className="w-6 h-6 text-blue-600" />;
  if (normalized.match(/cerveza|beer/i)) return <LucideIcons.Beer className="w-6 h-6 text-blue-600" />;
  if (normalized.match(/vino|wine/i)) return <LucideIcons.Wine className="w-6 h-6 text-blue-600" />;
  if (normalized.match(/snack|bocadillo/i)) return <LucideIcons.Cookie className="w-6 h-6 text-blue-600" />;
  if (normalized.match(/riche/i)) return <LucideIcons.ShoppingBag className="w-6 h-6 text-blue-600" />;

  // Try to find exact match in Lucide
  // Capitalize first letter for lookup
  const pascalCase = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  const Icon = (LucideIcons as any)[pascalCase] || (LucideIcons as any)[normalized];

  if (Icon) {
    return <Icon className="w-6 h-6 text-blue-600" />;
  }

  // Fallback
  return <LucideIcons.Tag className="w-6 h-6 text-gray-400" />;
};

const CategoryForm: React.FC<{
  category: Category | null;
  onSave: () => void;
  onCancel: () => void;
}> = ({ category, onSave, onCancel }) => {
  const { showToast } = useAppContext();
  const { addCategory, updateCategory } = useAdminCategories();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setIcon(category.icon);
    } else {
      setName('');
      setIcon('');
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const categoryData = { name, icon };
      if (category) {
        await updateCategory(category.id, categoryData);
        showToast('Categoría actualizada!', 'success');
      } else {
        await addCategory(categoryData);
        showToast('Categoría agregada!', 'success');
      }
      onSave();
    } catch (error) {
      console.error('Error saving category:', error);
      showToast('Error al guardar la categoría.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all animate-modal-pop">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">{category ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre de la Categoría</label>
              <input type="text" placeholder="Ej: Pizzas" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ícono (Nombre del ícono)</label>
              <div className="flex gap-4">
                <input type="text" placeholder="Ej: Pizza" value={icon} onChange={e => setIcon(e.target.value)} required className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                  <IconComponent iconName={icon} />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Usa nombres como "Pizza", "Burger", "Taco", etc.</p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onCancel} className="px-6 py-2.5 text-gray-700 font-semibold bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={isSaving} className="px-6 py-2.5 text-white font-semibold bg-blue-500 rounded-xl hover:bg-blue-600 shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                {isSaving ? 'Guardando...' : 'Guardar Categoría'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const CategoryList: React.FC<{
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
}> = ({ categories, onEdit, onDelete }) => {
  if (categories.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <div className="bg-gray-100 p-4 rounded-full inline-block mb-4">
          <LucideIcons.Tag className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No hay categorías</h3>
        <p className="text-gray-500 mt-1">Agrega categorías para organizar tus productos.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map(category => (
        <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between hover:shadow-md transition-all duration-300 group">
          <div className="flex items-center gap-4 overflow-hidden">
            <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-transform">
              <IconComponent iconName={category.icon} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors truncate">{category.name}</p>
              <p className="text-xs text-gray-400">ID: {category.id}</p>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(category)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
              <LucideIcons.Edit className="w-5 h-5" />
            </button>
            <button onClick={() => onDelete(category.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
              <LucideIcons.Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export const ManageCategories: React.FC = () => {
  const { categories, loading, error, deleteCategory } = useAdminCategories();
  const { showToast } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');

  const action = searchParams.get('action');
  const categoryId = searchParams.get('id');

  const isFormOpen = action === 'new' || action === 'edit';
  const editingCategory = categoryId ? categories.find(c => c.id === Number(categoryId)) || null : null;

  const handleAddNew = () => {
    setSearchParams({ action: 'new' });
  };

  const handleEdit = (category: Category) => {
    setSearchParams({ action: 'edit', id: category.id.toString() });
  };

  const handleCloseForm = () => {
    setSearchParams({});
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      try {
        await deleteCategory(id);
        showToast('Categoría eliminada.', 'success');
      } catch (error) {
        console.error('Error deleting category:', error);
        showToast('Error al eliminar.', 'error');
      }
    }
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="w-full sm:w-1/2 relative">
          <input
            type="text"
            placeholder="Buscar categoría..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
          <span className="absolute left-3 top-3 text-gray-400">
            <LucideIcons.Search className="w-5 h-5" />
          </span>
        </div>
        <button
          onClick={handleAddNew}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md hover:bg-blue-600 transition-all transform hover:-translate-y-0.5"
        >
          <LucideIcons.Plus className="w-5 h-5" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {isFormOpen && (
        <CategoryForm
          category={editingCategory}
          onSave={handleCloseForm}
          onCancel={handleCloseForm}
        />
      )}

      <div className="bg-transparent">
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 rounded-xl p-8 text-center">
            <LucideIcons.AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <h3 className="text-lg font-bold text-red-800 mb-2">Error al Cargar</h3>
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <CategoryList
            categories={filteredCategories}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
};