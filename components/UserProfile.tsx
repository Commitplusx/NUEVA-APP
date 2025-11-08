import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import profileAnimation from '../components/animations/profile.json';
import { getProfile, updateProfile } from '../services/api';
import { Profile } from '../types';
import { Spinner } from './Spinner';
import { Toast } from './Toast';
import { useAppContext } from '../context/AppContext';
import { Avatar } from './Avatar';

export const UserProfile: React.FC = () => {
  const { user } = useAppContext();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [editedFullName, setEditedFullName] = useState('');
  const [editedAddress, setEditedAddress] = useState('');

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
        setProfile(userProfile);
        setEditedFullName(userProfile?.full_name || '');
        setEditedAddress(userProfile?.address || '');
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
    if (name === 'full_name') {
      setEditedFullName(value);
    } else if (name === 'address') {
      setEditedAddress(value);
    }
  };

  const handleAvatarUpload = async (filePath: string) => {
    if (!profile) return;
    try {
      setUploading(true);
      const updatedProfile = { ...profile, avatar: filePath };
      await updateProfile(updatedProfile);
      setProfile(updatedProfile);
      setToast({ message: 'Avatar actualizado con éxito', type: 'success' });
    } catch (err) {
      setToast({ message: 'Error al actualizar el avatar', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      setLoading(true);
      const updatedProfileData = {
        ...profile,
        full_name: editedFullName,
        address: editedAddress,
      };
      await updateProfile(updatedProfileData);
      setProfile(updatedProfileData); // Update the main profile state after successful save
      setToast({ message: 'Perfil actualizado con éxito', type: 'success' });
    } catch (err) {
      setToast({ message: 'Error al actualizar el perfil', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return <Spinner />;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
          <div className="flex flex-col items-center pb-8">
            {profile?.avatar ? (
              <Avatar
                url={profile?.avatar || null}
                size={120}
                onUpload={handleAvatarUpload}
                loading={uploading}
              />
            ) : (
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                <Lottie animationData={profileAnimation} loop={true} style={{ width: 120, height: 120 }} />
              </div>
            )}
            <h1 className="text-3xl font-bold text-gray-800 mt-4">{profile?.full_name || 'Nombre de usuario'}</h1>
            <p className="text-gray-500">{user?.email}</p>
            {user?.created_at && (
              <p className="text-sm text-gray-400 mt-1">
                Miembro desde {new Date(user.created_at).toLocaleDateString()}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                Nombre Completo
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={editedFullName}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo Electrónico
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={user?.email || ''}
                  readOnly // Make email read-only
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100"
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Dirección
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={editedAddress}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || uploading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
