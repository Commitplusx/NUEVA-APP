import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import profileAnimation from '../components/animations/profile.json';
import { getProfile, updateProfile } from '../services/api';
import { Profile } from '../types';
import { Spinner } from './Spinner';
import { Toast } from './Toast';
import { useAppContext } from '../context/AppContext';
import { Avatar } from './Avatar';
import { MailIcon, UserIcon, LocationIcon } from './icons';

export const PersonalInfo: React.FC = () => {
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
      setProfile(updatedProfileData);
      setToast({ message: 'Perfil actualizado con éxito', type: 'success' });
    } catch (err) {
      setToast({ message: 'Error al actualizar el perfil', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-yellow-400 h-32" />
          <div className="px-6 pb-8 -mt-16">
            <div className="flex justify-center">
              {profile?.avatar ? (
                <Avatar
                  url={profile.avatar}
                  size={128}
                  onUpload={handleAvatarUpload}
                  loading={uploading}
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
                  <Lottie animationData={profileAnimation} loop={true} style={{ width: 120, height: 120 }} />
                </div>
              )}
            </div>
            <div className="text-center mt-4">
              <h1 className="text-2xl font-bold text-gray-800">{profile?.full_name || 'Nombre de Usuario'}</h1>
              <p className="text-gray-500">{user?.email}</p>
            </div>
          </div>

          <div className="px-6 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={editedFullName}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Nombre Completo"
                />
              </div>

              <div className="relative">
                <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={user?.email || ''}
                  readOnly
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 text-gray-500 rounded-lg border border-gray-200 cursor-not-allowed"
                />
              </div>

              <div className="relative">
                <LocationIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={editedAddress}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Tu dirección"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg disabled:bg-orange-300"
                >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
