import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '../services/api';
import { Profile } from '../types';
import { Spinner } from './Spinner';
import { Toast } from './Toast';
import { useAppContext } from '../context/AppContext';
import { Avatar } from './Avatar';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';
import { PaymentMethod } from './PaymentMethod';

const MenuDots: React.FC<{ className?: string }> = (props) => (
  <svg {...props} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="5" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="12" cy="19" r="2" />
  </svg>
);

const PersonIcon: React.FC<{ className?: string }> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MapIcon: React.FC<{ className?: string }> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
    <line x1="9" y1="3" x2="9" y2="18" />
    <line x1="15" y1="6" x2="15" y2="21" />
  </svg>
);

const ShoppingBagIcon: React.FC<{ className?: string }> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const HeartIcon: React.FC<{ className?: string }> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const BellIcon: React.FC<{ className?: string }> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const CreditCardIcon: React.FC<{ className?: string }> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const HelpCircleIcon: React.FC<{ className?: string }> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const ReviewIcon: React.FC<{ className?: string }> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const SettingsIcon: React.FC<{ className?: string }> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6m6-12h-6m6 6h-6m-6-6h6m-6 6h6" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const LogOutIcon: React.FC<{ className?: string }> = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

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
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

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
            {profile?.full_name || user?.email?.split('@')[0] || 'Usuario'}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {profile?.address || 'I love fast food'}
          </p>
        </div>
      </div>

      <div className="mt-4 mx-4 bg-white rounded-2xl overflow-hidden shadow-sm">
        <MenuItem
          icon={<PersonIcon />}
          label="Personal Info"
          onClick={comingSoon}
          iconColor="text-orange-500"
          iconBgColor="bg-orange-50"
        />
        <div className="h-px bg-gray-100" />
        <MenuItem
          icon={<MapIcon />}
          label="Addresses"
          onClick={comingSoon}
          iconColor="text-blue-500"
          iconBgColor="bg-blue-50"
        />
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
