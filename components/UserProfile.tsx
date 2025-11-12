import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, geocodeAddress } from '../services/api';
import { Profile } from '../types';
import { Spinner } from './Spinner';
import { Toast } from './Toast';
import { useAppContext } from '../context/AppContext';
import { Avatar } from './Avatar';
import Lottie from 'lottie-react';
import profileAnimation from './animations/profile.json';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PhoneIcon,
  MenuDots,
  MapIcon,
  ShoppingBagIcon,
  CreditCardIcon,
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

interface AddressManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: Profile | null;
  onSave: (addressData: Partial<Profile>) => Promise<void>;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const AddressManagerModal: React.FC<AddressManagerModalProps> = ({ isOpen, onClose, currentProfile, onSave, showToast }) => {
  const [address, setAddress] = useState({
    street_address: '',
    neighborhood: '',
    city: '',
    postal_code: '',
    address_details: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentProfile) {
      setAddress({
        street_address: currentProfile.street_address || '',
        neighborhood: currentProfile.neighborhood || '',
        city: currentProfile.city || '',
        postal_code: currentProfile.postal_code || '',
        address_details: currentProfile.address_details || '',
      });
    }
  }, [currentProfile, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveAddress = async () => {
    if (!address.street_address.trim() || !address.city.trim()) {
      showToast('La calle y la ciudad son campos obligatorios.', 'error');
      return;
    }
    setIsSaving(true);
    try {
      const fullAddress = `${address.street_address}, ${address.neighborhood}, ${address.city}, ${address.postal_code}`;
      const coords = await geocodeAddress(fullAddress);
      
      const addressData: Partial<Profile> = { ...address };
      if (coords) {
        addressData.lat = coords.lat;
        addressData.lng = coords.lng;
      } else {
        showToast('No se pudieron obtener las coordenadas para la dirección. Se guardará sin mapa.', 'info');
      }

      await onSave(addressData);
      showToast('Dirección guardada con éxito.', 'success');
      onClose();

    } catch (error) {
      showToast('Error al guardar la dirección.', 'error');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "w-full py-3 px-4 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "-50px", opacity: 0 }}
            animate={{ y: "0", opacity: 1 }}
            exit={{ y: "50px", opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Gestionar Dirección</h2>
            <div className="space-y-4">
              <input type="text" name="street_address" value={address.street_address} onChange={handleChange} className={inputClass} placeholder="Calle y Número" disabled={isSaving} />
              <input type="text" name="neighborhood" value={address.neighborhood} onChange={handleChange} className={inputClass} placeholder="Barrio / Colonia" disabled={isSaving} />
              <div className="flex gap-4">
                <input type="text" name="city" value={address.city} onChange={handleChange} className={inputClass} placeholder="Ciudad" disabled={isSaving} />
                <input type="text" name="postal_code" value={address.postal_code} onChange={handleChange} className={inputClass} placeholder="Cód. Postal" disabled={isSaving} />
              </div>
              <input type="text" name="address_details" value={address.address_details} onChange={handleChange} className={inputClass} placeholder="Detalles (piso, depto, referencias)" disabled={isSaving} />
            </div>
            <div className="mt-8 flex justify-end space-x-3">
              <button onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold transition-colors" disabled={isSaving}>
                Cancelar
              </button>
              <button onClick={handleSaveAddress} className="px-5 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-bold transition-colors" disabled={isSaving}>
                {isSaving ? 'Guardando...' : 'Guardar Dirección'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


export const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, handleLogout, showToast } = useAppContext();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showPaymentMethod, setShowPaymentMethod] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);


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

  const handleSaveAddress = async (addressData: Partial<Profile>) => {
    if (!profile) return;
    try {
      const updatedProfile = { ...profile, ...addressData };
      await updateProfile(updatedProfile);
      setProfile(updatedProfile);
      // Toast is shown by the modal now
    } catch (error) {
      showToast('Error al guardar la dirección.', 'error');
      console.error(error);
      throw error; // Re-throw to allow modal to handle saving state
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

  const formatAddress = (p: Profile | null): string => {
    if (!p) return 'No hay dirección guardada.';
    const parts = [p.street_address, p.neighborhood, p.city, p.postal_code].filter(Boolean);
    if (parts.length === 0) return 'No hay dirección guardada.';
    return parts.join(', ');
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
            onClick={() => showToast('Próximamente disponible', 'info')}
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
                <Lottie animationData={profileAnimation} loop={true} className="w-full h-full" />
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
            {formatAddress(profile)}
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
          icon={<MapIcon />}
          label="Direcciones"
          onClick={() => setShowAddressModal(true)}
          iconColor="text-green-500"
          iconBgColor="bg-green-50"
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

      <div className="mt-4 mx-4 mb-24 bg-white rounded-2xl overflow-hidden shadow-sm">
        <MenuItem
          icon={<LogOutIcon />}
          label="Log Out"
          onClick={handleLogoutClick}
          iconColor="text-red-500"
          iconBgColor="bg-red-50"
        />
      </div>

      <AddressManagerModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        currentProfile={profile}
        onSave={handleSaveAddress}
        showToast={showToast}
      />
    </div>
  );
};
