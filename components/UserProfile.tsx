import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../services/api';
import { Profile } from '../types';
import { Spinner } from './Spinner';
import { Toast } from './Toast';
import { useAppContext } from '../context/AppContext';

export const UserProfile: React.FC = () => {
  const { user } = useAppContext();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setError('Usuario no autenticado.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const userProfile = await getProfile();
        if (userProfile) {
          setProfile(userProfile);
        } else {
          // Si no hay perfil, inicializamos uno para que el usuario pueda crearlo
          setProfile({
            id: user.id,
            full_name: '',
            address: '',
            // Otros campos que pueda tener el perfil
          });
        }
      } catch (err) {
        setError('Error al cargar el perfil. Por favor, intenta de nuevo.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prevProfile => {
      if (!prevProfile) {
        // Esto no debería ocurrir si la lógica de fetchProfile es correcta,
        // pero es una salvaguarda.
        return {
          id: user!.id,
          full_name: '',
          address: '',
          [name]: value,
        };
      }
      return {
        ...prevProfile,
        [name]: value,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      setLoading(true);
      await updateProfile(profile);
      setToast({ message: 'Perfil actualizado con éxito', type: 'success' });
    } catch (err) {
      setToast({ message: 'Error al actualizar el perfil', type: 'error' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Perfil de {user}</h1>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
            Nombre Completo
          </label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={profile?.full_name || ''}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Dirección
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={profile?.address || ''}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>
    </div>
  );
};
