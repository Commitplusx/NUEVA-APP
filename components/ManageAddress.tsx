import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getProfile, updateProfile, geocodeAddress } from '../services/api';
import { Profile } from '../types';
import { Spinner } from './Spinner';
import { HomeIcon, WorkIcon, LocationIcon } from './icons';

// Fix for default icon issue with Leaflet and Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const AddressCard: React.FC<{ label: string; address: string; onEdit: () => void; onDelete: () => void; icon: React.ReactNode }> =
  ({ label, address, onEdit, onDelete, icon }) => (
  <div className="bg-white p-4 rounded-lg shadow-md mb-4 flex items-center">
    <div className="bg-gray-100 p-3 rounded-full mr-4">{icon}</div>
    <div>
      <h4 className="font-bold">{label}</h4>
      <p className="text-sm text-gray-600">{address}</p>
    </div>
    <div className="ml-auto flex space-x-2">
      <button onClick={onEdit} className="text-blue-500">Edit</button>
      <button onClick={onDelete} className="text-red-500">Delete</button>
    </div>
  </div>
);

const LocationPicker: React.FC<{ onLocationSet: (lat: number, lng: number) => void }> = ({ onLocationSet }) => {
  const [position, setPosition] = useState<[number, number] | null>(null);

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        onLocationSet(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  };

  return (
    <div className="h-64 rounded-lg overflow-hidden">
      <MapContainer center={position || [51.505, -0.09]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {position && <Marker position={position} />}
        <MapEvents />
      </MapContainer>
    </div>
  );
};

export const ManageAddress: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newAddress, setNewAddress] = useState({ label: '', street: '', postcode: '', apartment: '' });
  const [newLocation, setNewLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
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
  }, []);

  const handleSaveAddress = async () => {
    if (!profile) return;
    const fullAddress = `${newAddress.street}, ${newAddress.postcode}`;
    const location = newLocation || await geocodeAddress(fullAddress);

    let updatedAddresses;
    if (editingIndex !== null) {
      updatedAddresses = [...(profile.addresses || [])];
      updatedAddresses[editingIndex] = { ...newAddress, ...location };
    } else {
      updatedAddresses = [...(profile.addresses || []), { ...newAddress, ...location }];
    }

    const updatedProfile = { ...profile, addresses: updatedAddresses };
    await updateProfile(updatedProfile);
    setProfile(updatedProfile);
    handleCancel();
  };

  const handleStartEdit = (index: number) => {
    if (!profile || !profile.addresses) return;
    const addressToEdit = profile.addresses[index];
    setNewAddress(addressToEdit);
    setEditingIndex(index);
    setIsFormOpen(true);
  };

  const handleDeleteAddress = async (indexToDelete: number) => {
    if (!profile) return;
    const updatedAddresses = profile.addresses?.filter((_, index) => index !== indexToDelete);
    const updatedProfile = { ...profile, addresses: updatedAddresses };
    await updateProfile(updatedProfile);
    setProfile(updatedProfile);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingIndex(null);
    setNewAddress({ label: '', street: '', postcode: '', apartment: '' });
    setNewLocation(null);
  };

  if (loading) return <Spinner />;

  if (isFormOpen) {
    return (
      <div className="p-4">
        <h3 className="text-xl font-bold mb-4">{editingIndex !== null ? 'Edit Address' : 'Add New Address'}</h3>
        <LocationPicker onLocationSet={(lat, lng) => setNewLocation({ lat, lng })} />
        <div className="mt-4 space-y-4">
          <input type="text" placeholder="Street" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className="w-full p-2 border rounded" />
          <input type="text" placeholder="Postcode" value={newAddress.postcode} onChange={e => setNewAddress({...newAddress, postcode: e.target.value})} className="w-full p-2 border rounded" />
          <input type="text" placeholder="Apartment" value={newAddress.apartment} onChange={e => setNewAddress({...newAddress, apartment: e.target.value})} className="w-full p-2 border rounded" />
          <div className="flex space-x-2">
            <button onClick={() => setNewAddress({...newAddress, label: 'Home'})} className={`p-2 border rounded ${newAddress.label === 'Home' ? 'bg-orange-500 text-white' : ''}`}>Home</button>
            <button onClick={() => setNewAddress({...newAddress, label: 'Work'})} className={`p-2 border rounded ${newAddress.label === 'Work' ? 'bg-orange-500 text-white' : ''}`}>Work</button>
            <button onClick={() => setNewAddress({...newAddress, label: 'Other'})} className={`p-2 border rounded ${newAddress.label === 'Other' ? 'bg-orange-500 text-white' : ''}`}>Other</button>
          </div>
        </div>
        <button onClick={handleSaveAddress} className="w-full bg-orange-500 text-white py-2 rounded-lg mt-4">Save Location</button>
        <button onClick={handleCancel} className="w-full text-center mt-2">Cancel</button>
      </div>
    );
  }

  return (
    <div className="p-4">
      {profile?.addresses?.map((addr, index) => (
        <AddressCard
          key={index}
          label={addr.label}
          address={`${addr.street}, ${addr.postcode}`}
          onEdit={() => handleStartEdit(index)}
          onDelete={() => handleDeleteAddress(index)}
          icon={addr.label === 'Home' ? <HomeIcon /> : addr.label === 'Work' ? <WorkIcon /> : <LocationIcon />}
        />
      ))}
      <button onClick={() => setIsFormOpen(true)} className="w-full bg-orange-500 text-white py-2 rounded-lg mt-4">Add New Address</button>
    </div>
  );
};
