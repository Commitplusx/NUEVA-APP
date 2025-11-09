import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../services/api';
import { Profile } from '../types';
import { Spinner } from './Spinner';
import { Toast } from './Toast';
import { useAppContext } from '../context/AppContext';
import { Avatar } from './Avatar';
import { MailIcon, UserIcon, PhoneIcon, BioIcon } from './icons';

export const EditProfile: React.FC = () => {
  const { user } = useAppContext();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const userProfile = await getProfile();
        setProfile(userProfile);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleAvatarUpload = async (filePath: string) => {
    if (!profile) return;
    try {
      setUploading(true);
      const updatedProfile = { ...profile, avatar: filePath };
      await updateProfile(updatedProfile);
      setProfile(updatedProfile);
      setToast({ message: 'Avatar updated successfully', type: 'success' });
    } catch (err) {
      setToast({ message: 'Error updating avatar', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      setLoading(true);
      await updateProfile(profile);
      setToast({ message: 'Profile updated successfully', type: 'success' });
    } catch (err) {
      setToast({ message: 'Error updating profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
  }

  return (
    <div className="p-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="flex flex-col items-center">
        <Avatar
          url={profile?.avatar}
          size={128}
          onUpload={handleAvatarUpload}
          loading={uploading}
        />
        <form onSubmit={handleSubmit} className="w-full mt-8 space-y-6">
          <InputField label="Full Name" name="full_name" value={profile?.full_name || ''} onChange={handleInputChange} icon={<UserIcon />} />
          <InputField label="Email" name="email" value={user?.email || ''} readOnly icon={<MailIcon />} />
          <InputField label="Phone Number" name="phone" value={profile?.phone || ''} onChange={handleInputChange} icon={<PhoneIcon />} />
          <TextareaField label="Bio" name="bio" value={profile?.bio || ''} onChange={handleInputChange} icon={<BioIcon />} />
          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  );
};

const InputField = ({ label, name, value, onChange, readOnly = false, icon }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-500 mb-1">{label}</label>
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400">{icon}</span>
      <input
        type="text"
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
      />
    </div>
  </div>
);

const TextareaField = ({ label, name, value, onChange, icon }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-500 mb-1">{label}</label>
    <div className="relative">
      <span className="absolute left-4 top-4 w-5 h-5 text-gray-400">{icon}</span>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        rows={3}
        className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
      />
    </div>
  </div>
);
