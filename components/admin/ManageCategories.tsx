import React, { useState, useEffect } from 'react';
import { useAdminCategories } from '../../hooks/useAdminCategories';
import { getErrorMessage } from '../../services/api';
import { Category } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { Spinner } from '../Spinner';
import { PlusIcon, EditIcon, TrashIcon, AlertTriangleIcon } from '../icons';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{category ? 'Editar' : 'Agregar'} Categoría</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Nombre de la Categoría" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
          <input type="text" placeholder="Nombre del Ícono (ej. pizza, burger)" value={icon} onChange={e => setIcon(e.target.value)} required className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
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

const CategoryList: React.FC<{
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
}> = ({ categories, onEdit, onDelete }) => {
  if (categories.length === 0) {
    return <p className="text-center text-gray-500 py-10">No hay categorías para mostrar.</p>;
  }

  return (
    <div className="space-y-4">
      {categories.map(category => (
        <div key={category.id} className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 flex justify-between items-center hover:shadow-md transition-shadow">
          <div>
            <p className="font-bold text-lg text-gray-800">{category.name}</p>
            <p className="text-sm text-gray-600">Ícono: {category.icon}</p>
          </div>
          <div className="flex flex-col space-y-2">
            <button onClick={() => onEdit(category)} className="p-2.5 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"><EditIcon className="w-5 h-5" /></button>
            <button onClick={() => onDelete(category.id)} className="p-2.5 text-red-600 hover:bg-red-100 rounded-full transition-colors"><TrashIcon className="w-5 h-5" /></button>
          </div>
        </div>
      ))}
    </div>
  );
};

export const ManageCategories: React.FC = () => {
  const { categories, loading, error, deleteCategory } = useAdminCategories();
  const { showToast } = useAppContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddNew = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
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
      <div className="flex justify-between items-center mb-4">
        <div className="w-1/2">
          <input 
            type="text"
            placeholder="Buscar categoría..."
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
        <CategoryForm 
          category={editingCategory}
          onSave={() => setIsFormOpen(false)}
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