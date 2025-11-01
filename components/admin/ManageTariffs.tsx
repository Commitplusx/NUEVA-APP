import React, { useState, useEffect } from 'react';
import { useAdminTariffs } from '../../hooks/useAdminTariffs';
import { Tariff } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { Spinner } from '../Spinner';
import { PlusIcon, EditIcon, TrashIcon, AlertTriangleIcon } from '../icons';

const TariffForm: React.FC<{
  tariff: Tariff | null;
  onSave: () => void;
  onCancel: () => void;
}> = ({ tariff, onSave, onCancel }) => {
  const { showToast } = useAppContext();
  const { addTariff, updateTariff } = useAdminTariffs();
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | string>('');
  const [icon, setIcon] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (tariff) {
      setName(tariff.name);
      setPrice(tariff.price);
      setIcon(tariff.icon);
    } else {
      setName('');
      setPrice('');
      setIcon('');
    }
  }, [tariff]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const tariffData = { name, price: Number(price), icon };
      if (tariff) {
        await updateTariff(tariff.id, tariffData);
        showToast('Tarifa actualizada!', 'success');
      } else {
        await addTariff(tariffData);
        showToast('Tarifa agregada!', 'success');
      }
      onSave();
    } catch (error) {
      console.error('Error saving tariff:', error);
      showToast('Error al guardar la tarifa.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{tariff ? 'Editar' : 'Agregar'} Tarifa</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Nombre de la Tarifa" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
          <input type="number" placeholder="Precio" value={price} onChange={e => setPrice(e.target.value)} required className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
          <input type="text" placeholder="Nombre del Ícono (ej. motorcycle)" value={icon} onChange={e => setIcon(e.target.value)} required className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
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

const TariffList: React.FC<{
  tariffs: Tariff[];
  onEdit: (tariff: Tariff) => void;
  onDelete: (id: number) => void;
}> = ({ tariffs, onEdit, onDelete }) => {
  if (tariffs.length === 0) {
    return <p className="text-center text-gray-500 py-10">No hay tarifas para mostrar.</p>;
  }

  return (
    <div className="space-y-4">
      {tariffs.map(tariff => (
        <div key={tariff.id} className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 flex justify-between items-center hover:shadow-md transition-shadow">
          <div>
            <p className="font-bold text-lg text-gray-800">{tariff.name}</p>
            <p className="text-sm text-gray-600">Precio: ${tariff.price.toFixed(2)}</p>
          </div>
          <div className="flex space-x-2">
            <button onClick={() => onEdit(tariff)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"><EditIcon className="w-5 h-5" /></button>
            <button onClick={() => onDelete(tariff.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"><TrashIcon className="w-5 h-5" /></button>
          </div>
        </div>
      ))}
    </div>
  );
};

export const ManageTariffs: React.FC = () => {
  const { tariffs, loading, error, deleteTariff } = useAdminTariffs();
  const { showToast } = useAppContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTariff, setEditingTariff] = useState<Tariff | null>(null);

  const handleAddNew = () => {
    setEditingTariff(null);
    setIsFormOpen(true);
  };

  const handleEdit = (tariff: Tariff) => {
    setEditingTariff(tariff);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta tarifa?')) {
      try {
        await deleteTariff(id);
        showToast('Tarifa eliminada.', 'success');
      } catch (error) {
        console.error('Error deleting tariff:', error);
        showToast('Error al eliminar.', 'error');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button 
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-orange-500 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-orange-600 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Agregar Tarifa
        </button>
      </div>

      {isFormOpen && (
        <TariffForm 
          tariff={editingTariff}
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
          <TariffList 
            tariffs={tariffs} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
          />
        )}
      </div>
    </div>
  );
};