import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../services/api';
import { Profile } from '../types';
import { Spinner } from './Spinner';
import { Toast } from './Toast';
import { useAppContext } from '../context/AppContext';
import { Avatar } from './Avatar';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PhoneIcon,
  MenuDots,
  PersonIcon,
  MapIcon,
  ShoppingBagIcon,
  HeartIcon,
  BellIcon,
  CreditCardIcon,
  HelpCircleIcon,
  ReviewIcon,
  SettingsIcon,
  LogOutIcon,
} from './icons';
import { PaymentMethod } from './PaymentMethod';

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  iconColor: string;
  iconBgColor: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, onClick, iconColor, iconBgColor }) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 ${iconBgColor} rounded-lg flex items-center justify-center`}>
          {React.cloneElement(icon as React.ReactElement, { className: `w-5 h-5 ${iconColor}` })}
        </div>
        <span className="text-gray-700 font-medium">{label}</span>
      </div>
      <ChevronRightIcon className="w-5 h-5 text-gray-400" />
    </button>
  );
};

export const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, handleLogout } = useAppContext();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showPaymentMethod, setShowPaymentMethod] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const userProfile = await getProfile();
        setProfile(userProfile);
      } catch (err) {
        console.error(err);
        setToast({ message: 'Error al cargar el perfil', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!profile) return;
    try {
      await updateProfile(profile);
      setToast({ message: 'Perfil actualizado con éxito', type: 'success' });
    } catch (error) {
      setToast({ message: 'Error al actualizar el perfil', type: 'error' });
      console.error(error);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleLogoutClick = async () => {
    try {
      await handleLogout();
      navigate('/');
    } catch (err) {
      setToast({ message: 'Error al cerrar sesión', type: 'error' });
    }
  };

  const comingSoon = () => {
    setToast({ message: 'Próximamente disponible', type: 'success' });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
  }

  if (showPaymentMethod) {
    return <PaymentMethod onBack={() => setShowPaymentMethod(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="bg-white pb-6">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={handleBack}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Profile</h1>
          <button
            onClick={comingSoon}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <MenuDots className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        <div className="flex flex-col items-center mt-6 px-4">
          <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
            {profile?.avatar ? (
              <Avatar
                url={profile.avatar}
                size={104}
                onUpload={() => {}}
                loading={false}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <PersonIcon className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mt-4">
            <input
              type="text"
              value={profile?.full_name || ''}
              onChange={(e) => setProfile(p => p ? { ...p, full_name: e.target.value } : null)}
              className="text-center bg-transparent font-bold text-2xl w-full"
              placeholder="Tu nombre"
            />
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            <input
              type="text"
              value={profile?.address || ''}
              onChange={(e) => setProfile(p => p ? { ...p, address: e.target.value } : null)}
              className="text-center bg-transparent text-sm w-full"
              placeholder="Tu dirección"
            />
          </p>
          <div className="mt-2 relative flex items-center">
            <PhoneIcon className="absolute left-3 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={profile?.phone || ''}
              onChange={(e) => setProfile(p => p ? { ...p, phone: e.target.value } : null)}
              className="w-full py-2 pl-10 pr-4 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Tu teléfono (Ej: +521...)"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 mx-4">
        <button
          onClick={handleSave}
          className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition-colors shadow-lg"
        >
          Guardar Cambios
        </button>
      </div>

      <div className="mt-4 mx-4 bg-white rounded-2xl overflow-hidden shadow-sm">
        <MenuItem
          icon={<ShoppingBagIcon />}
          label="Cart"
          onClick={() => navigate('/cart')}
          iconColor="text-blue-500"
          iconBgColor="bg-blue-50"
        />
        <div className="h-px bg-gray-100" />
        <MenuItem
          icon={<HeartIcon />}
          label="Favourite"
          onClick={comingSoon}
          iconColor="text-purple-500"
          iconBgColor="bg-purple-50"
        />
        <div className="h-px bg-gray-100" />
        <MenuItem
          icon={<BellIcon />}
          label="Notifications"
          onClick={comingSoon}
          iconColor="text-yellow-500"
          iconBgColor="bg-yellow-50"
        />
        <div className="h-px bg-gray-100" />
        <MenuItem
          icon={<CreditCardIcon />}
          label="Payment Method"
          onClick={() => setShowPaymentMethod(true)}
          iconColor="text-blue-500"
          iconBgColor="bg-blue-50"
        />
      </div>

      <div className="mt-4 mx-4 bg-white rounded-2xl overflow-hidden shadow-sm">
        <MenuItem
          icon={<HelpCircleIcon />}
          label="FAQs"
          onClick={comingSoon}
          iconColor="text-orange-500"
          iconBgColor="bg-orange-50"
        />
        <div className="h-px bg-gray-100" />
        <MenuItem
          icon={<ReviewIcon />}
          label="User Reviews"
          onClick={comingSoon}
          iconColor="text-teal-500"
          iconBgColor="bg-teal-50"
        />
        <div className="h-px bg-gray-100" />
        <MenuItem
          icon={<SettingsIcon />}
          label="Settings"
          onClick={comingSoon}
          iconColor="text-purple-500"
          iconBgColor="bg-purple-50"
        />
      </div>

      <div className="mt-4 mx-4 mb-24 bg-white rounded-2xl overflow-hidden shadow-sm">
        <MenuItem
          icon={<LogOutIcon />}
          label="Log Out"
          onClick={handleLogoutClick}
          iconColor="text-red-500"
          iconBgColor="bg-red-50"
        />
      </div>
    </div>
  );
};
