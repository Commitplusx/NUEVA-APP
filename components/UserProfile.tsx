import React, { useState } from 'react';
import { MyOrders } from './MyOrders';
import { EditProfile } from './EditProfile';
import { ManageAddress } from './ManageAddress';
import { ListIcon, UserCircleIcon, LocationMarkerIcon } from './icons';

type ProfileTab = 'orders' | 'profile' | 'address';

export const UserProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('orders');

  const renderContent = () => {
    switch (activeTab) {
      case 'orders':
        return <MyOrders />;
      case 'profile':
        return <EditProfile />;
      case 'address':
        return <ManageAddress />;
      default:
        return <MyOrders />;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-grow p-4 overflow-y-auto">
        {renderContent()}
      </div>
      <div className="flex justify-around bg-white p-2 border-t">
        <TabButton
          label="My Orders"
          icon={<ListIcon />}
          isActive={activeTab === 'orders'}
          onClick={() => setActiveTab('orders')}
        />
        <TabButton
          label="Edit Profile"
          icon={<UserCircleIcon />}
          isActive={activeTab === 'profile'}
          onClick={() => setActiveTab('profile')}
        />
        <TabButton
          label="My Address"
          icon={<LocationMarkerIcon />}
          isActive={activeTab === 'address'}
          onClick={() => setActiveTab('address')}
        />
      </div>
    </div>
  );
};

const TabButton = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full p-2 rounded-lg transition-colors ${isActive ? 'text-orange-500' : 'text-gray-500'}`}
  >
    <span className={`w-6 h-6 mb-1 ${isActive ? 'text-orange-500' : 'text-gray-400'}`}>{icon}</span>
    <span className="text-xs font-semibold">{label}</span>
  </button>
);
