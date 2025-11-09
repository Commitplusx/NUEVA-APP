import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import { getProfile } from '../services/api';
import { Profile } from '../types';
import { useAppContext } from '../context/AppContext';
import { Spinner } from './Spinner';
import profileAnimation from '../components/animations/profile.json';
import {
  ChevronLeftIcon,
  DotsHorizontalIcon,
  UserIcon,
  LocationIcon,
  CreditCardIcon,
  HeartIcon,
  BellIcon,
  LogoutIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
  CogIcon,
  ShoppingCartIcon
} from './icons';

// ProfileLink Component
const ProfileLink: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  isLogout?: boolean;
}> = ({ icon, label, onClick, isLogout }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center p-4 text-left ${isLogout ? 'text-red-500' : 'text-gray-800'}`}
  >
    <div className={`mr-4 ${isLogout ? 'text-red-500' : 'text-orange-500'}`}>{icon}</div>
    <span className="flex-grow font-medium">{label}</span>
    {!isLogout && <ChevronLeftIcon className="w-5 h-5 text-gray-400 transform rotate-180" />}
  </button>
);

export const UserProfile: React.FC = () => {
  const { user, logout } = useAppContext();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setError('Usuario no autenticado.');
        setLoading(false);
        return;
      }
      try {
        const userProfile = await getProfile();
        setProfile(userProfile);
      } catch (err) {
        setError('Error al cargar el perfil.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  const menuItems = [
    {
      section: 1,
      items: [
        { icon: <UserIcon className="w-6 h-6" />, label: 'Personal Info', path: '/profile/edit' },
        { icon: <LocationIcon className="w-6 h-6" />, label: 'Addresses', path: '/addresses' },
      ],
    },
    {
      section: 2,
      items: [
        { icon: <ShoppingCartIcon className="w-6 h-6" />, label: 'Cart', path: '/cart' },
        { icon: <HeartIcon className="w-6 h-6" />, label: 'Favourite', path: '/favourites' },
        { icon: <BellIcon className="w-6 h-6" />, label: 'Notifications', path: '/notifications' },
        { icon: <CreditCardIcon className="w-6 h-6" />, label: 'Payment Method', path: '/payment' },
      ],
    },
    {
      section: 3,
      items: [
        { icon: <QuestionMarkCircleIcon className="w-6 h-6" />, label: 'FAQs', path: '/faqs' },
        { icon: <SparklesIcon className="w-6 h-6" />, label: 'User Reviews', path: '/reviews' },
        { icon: <CogIcon className="w-6 h-6" />, label: 'Settings', path: '/settings' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white p-4 flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100">
          <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Profile</h1>
        <button className="p-2 rounded-full hover:bg-gray-100">
          <DotsHorizontalIcon className="w-6 h-6 text-gray-700" />
        </button>
      </header>

      {/* Profile Info */}
      <section className="text-center p-8">
        <div className="relative inline-block">
          {profile?.avatar ? (
            <img src={profile.avatar} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md" />
          ) : (
            <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
              <Lottie animationData={profileAnimation} loop={true} style={{ width: 90, height: 90 }} />
            </div>
          )}
        </div>
        <h2 className="mt-4 text-2xl font-bold text-gray-800">{profile?.full_name || 'Vishal Khadok'}</h2>
        <p className="text-gray-500">I love fast food</p>
      </section>

      {/* Menu Sections */}
      <main className="px-4 pb-8">
        {menuItems.map(({ section, items }) => (
          <div key={section} className="bg-white rounded-2xl shadow-sm mb-4">
            {items.map((item, index) => (
              <React.Fragment key={item.label}>
                <ProfileLink
                  icon={item.icon}
                  label={item.label}
                  onClick={() => navigate(item.path)}
                />
                {index < items.length - 1 && <hr className="mx-4 border-gray-100" />}
              </React.Fragment>
            ))}
          </div>
        ))}

        {/* Logout Section */}
        <div className="bg-white rounded-2xl shadow-sm">
          <ProfileLink
            icon={<LogoutIcon className="w-6 h-6" />}
            label="Log Out"
            onClick={handleLogout}
            isLogout
          />
        </div>
      </main>
    </div>
  );
};
