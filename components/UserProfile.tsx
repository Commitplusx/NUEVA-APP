import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, getErrorMessage } from '../services/api';
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
  PackageIcon,
  HeadphonesIcon,
  TicketIcon,
  StarIcon,
  CrownIcon,
  LocationIcon,
  DocumentTextIcon,
  BellIcon,
  StoreIcon,
  MotorcycleIcon,
  UserIcon,
  SparklesIcon
} from './icons';
import { PaymentMethod } from './PaymentMethod';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';



const Section: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className="" }) => (
  <div className={`mb-6 ${className}`}>
    <h2 className="px-4 text-xl font-bold text-gray-900 mb-3">{title}</h2>
    <div>{children}</div>
  </div>
);

interface ListItemProps {
    icon: React.ReactNode;
    text: string;
    subtext?: string;
    value?: string;
    onClick?: () => void;
    hasChevron?: boolean;
}

const ListItem: React.FC<ListItemProps> = ({ icon, text, subtext, value, onClick, hasChevron = true }) => {
    const content = (
        <div className="flex items-center p-4 bg-white">
            <div className="mr-4 text-gray-600">{icon}</div>
            <div className="flex-1">
                <p className="font-semibold text-gray-800">{text}</p>
                {subtext && <p className="text-sm text-gray-500">{subtext}</p>}
            </div>
            {value && <p className="font-semibold text-gray-800">{value}</p>}
            {hasChevron && <ChevronRightIcon className="w-5 h-5 text-gray-400 ml-4" />}
        </div>
    );

    if (onClick) {
        return (
            <button onClick={onClick} className="w-full text-left transition-colors duration-200 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl">
               {content}
            </button>
        )
    }
    return <div className="first:rounded-t-xl last:rounded-b-xl">{content}</div>;
};

const QuickActionButton: React.FC<{icon: React.ReactNode, label: string, onClick: () => void}> = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-sm border border-gray-200 hover:bg-gray-50 hover:shadow-md transition-all duration-200">
        <div className="text-gray-700">{icon}</div>
        <span className="mt-2 font-semibold text-sm text-gray-800">{label}</span>
    </button>
);

interface AddressManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (addressData: Partial<Profile>) => Promise<void>;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  isLoaded: boolean;
  initialAddress?: Partial<Profile>;
}

const AddressManagerModal: React.FC<AddressManagerModalProps> = ({ isOpen, onClose, onSave, showToast, isLoaded, initialAddress }) => {
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [addressData, setAddressData] = useState<Partial<Profile>>({});
  const [isSaving, setIsSaving] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const comitanBounds = {
    south: 16.20,
    west: -92.20,
    north: 16.35,
    east: -92.05,
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (!place.geometry || !place.address_components) {
        showToast('Por favor, selecciona una dirección de la lista.', 'error');
        return;
      }

      const getAddressComponent = (type: string) => {
        const component = place.address_components?.find(c => c.types.includes(type));
        return component?.long_name || '';
      };

      const streetNumber = getAddressComponent('street_number');
      const route = getAddressComponent('route');
      const placeName = place.name;

      let finalStreetAddress = '';
      if (route) {
        finalStreetAddress = `${route} ${streetNumber}`.trim();
      } else if (placeName && !placeName.includes(getAddressComponent('locality'))) {
        finalStreetAddress = placeName;
      } else if (getAddressComponent('sublocality_level_1')) { // Fallback to neighborhood
        finalStreetAddress = getAddressComponent('sublocality_level_1');
      } else if (getAddressComponent('locality')) { // Fallback to city if neighborhood is not available
        finalStreetAddress = getAddressComponent('locality');
      }

      const newAddress: Partial<Profile> = {
        street_address: finalStreetAddress,
        neighborhood: getAddressComponent('sublocality_level_1') || getAddressComponent('locality'),
        city: getAddressComponent('locality') || getAddressComponent('administrative_area_level_2'),
        postal_code: getAddressComponent('postal_code'),
        lat: place.geometry.location?.lat(),
        lng: place.geometry.location?.lng(),
      };
      console.log("New address from Autocomplete:", newAddress);
      setAddressData(newAddress);
    } else {
      console.error('Autocomplete is not loaded yet!');
    }
  };

  const handleSaveAddress = async () => {
    if (!addressData.street_address || !addressData.lat) {
      showToast('Por favor, busca y selecciona una dirección válida.', 'error');
      return;
    }
    setIsSaving(true);
    try {
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
  
  useEffect(() => {
    if (isOpen && initialAddress) {
      setAddressData(initialAddress);
    } else if (!isOpen) {
      setAddressData({});
      if (searchInputRef.current) {
        searchInputRef.current.value = '';
      }
    }
  }, [isOpen, initialAddress]);

  const inputClass = "w-full py-3 px-4 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none text-gray-600 cursor-not-allowed";

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
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Gestionar Dirección</h2>
            <p className="text-sm text-gray-600 mb-6">Busca tu dirección y selecciónala de la lista para autocompletar.</p>
            
            {isLoaded ? (
              <Autocomplete
                onLoad={(ac) => setAutocomplete(ac)}
                onPlaceChanged={onPlaceChanged}
                options={{
                  bounds: comitanBounds,
                  strictBounds: true,
                  componentRestrictions: { country: 'mx' }, // Restrict to Mexico
                  fields: ['address_components', 'geometry'],
                }}
              >
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Busca tu calle, colonia o código postal..."
                  className="w-full py-3 px-4 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800"
                />
              </Autocomplete>
            ) : (
              <Spinner />
            )}

            {addressData.street_address && (
              <motion.div 
                className="mt-6 space-y-3 pt-4 border-t border-gray-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h3 className="font-semibold text-gray-700">Verifica tu dirección:</h3>
                <input type="text" value={addressData.street_address || ''} onChange={(e) => setAddressData(prev => ({ ...prev, street_address: e.target.value }))} className={inputClass.replace('cursor-not-allowed', '')} />
                <input type="text" value={addressData.neighborhood || ''} onChange={(e) => setAddressData(prev => ({ ...prev, neighborhood: e.target.value }))} className={inputClass.replace('cursor-not-allowed', '')} />
                <div className="flex gap-4">
                  <input type="text" value={addressData.city || ''} onChange={(e) => setAddressData(prev => ({ ...prev, city: e.target.value }))} className={inputClass.replace('cursor-not-allowed', '')} />
                  <input type="text" value={addressData.postal_code || ''} onChange={(e) => setAddressData(prev => ({ ...prev, postal_code: e.target.value }))} className={inputClass.replace('cursor-not-allowed', '')} />
                </div>
              </motion.div>
            )}

            <div className="mt-8 flex justify-end space-x-3">
              <button onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold transition-colors" disabled={isSaving}>
                Cancelar
              </button>
              <button onClick={handleSaveAddress} className="px-5 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-bold transition-colors" disabled={isSaving || !addressData.street_address}>
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
  const { user, handleLogout, showToast, isMapsLoaded, loadError } = useAppContext();
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
    } catch (error: any) {
      showToast(`Error al guardar la dirección: ${getErrorMessage(error)}`, 'error');
      console.error(error);
      throw error;
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
    return <div className="flex justify-center items-center h-screen bg-white"><Spinner /></div>;
  }

  if (showPaymentMethod) {
    return <PaymentMethod onBack={() => setShowPaymentMethod(false)} />;
  }

  const comingSoon = () => showToast('Próximamente disponible', 'info'); // Placeholder for now

  return (
    <div className="h-full overflow-y-auto bg-white pb-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <header className="p-4 pt-6 flex items-center justify-between bg-white">
        <button
          onClick={handleBack}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <ChevronLeftIcon className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-4xl font-bold text-gray-900">Cuenta</h1>
        <button
          onClick={comingSoon}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <MenuDots className="w-5 h-5 text-gray-700" />
        </button>
      </header>

      <div className="px-4 mb-6">
        <div className="flex items-center">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-gray-500 text-2xl font-bold mr-4 border-4 border-white shadow-lg">
            {profile?.avatar ? (
              <Avatar
                url={profile.avatar}
                size={64} // Adjusted size for consistency
                onUpload={() => {}}
                loading={false}
              />
            ) : (
              <Lottie animationData={profileAnimation} loop={true} className="w-full h-full" />
            )}
          </div>
          <div>
            <input
              type="text"
              value={profile?.full_name || ''}
              onChange={(e) => setProfile(p => p ? { ...p, full_name: e.target.value } : null)}
              className="text-lg font-bold text-gray-900 bg-transparent w-full"
              placeholder="Tu nombre"
            />
            <button onClick={comingSoon} className="text-sm font-semibold text-gray-800 hover:text-gray-600">
              Editar perfil ›
            </button>
          </div>
        </div>
        <div className="mt-4 relative flex items-center">
          <PhoneIcon className="absolute left-3 w-5 h-5 text-gray-400" />
          <input
            type="tel"
            value={profile?.phone || ''}
            onChange={(e) => setProfile(p => p ? { ...p, phone: e.target.value } : null)}
            className="w-full py-2 pl-10 pr-4 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-800"
            placeholder="Tu teléfono (Ej: +521...)"
          />
        </div>
        <button
          onClick={handleSave}
          className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition-colors shadow-lg mt-4"
        >
          Guardar Cambios
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 px-4 mb-8">
          <QuickActionButton icon={<PackageIcon className="w-7 h-7" />} label="Pedidos" onClick={comingSoon} />
          <QuickActionButton icon={<HeadphonesIcon className="w-7 h-7" />} label="Ayuda" onClick={comingSoon} />
          <QuickActionButton icon={<CreditCardIcon className="w-7 h-7" />} label="Métodos de pago" onClick={() => setShowPaymentMethod(true)} />
      </div>
      
      <div className="px-4 space-y-8">
          <Section title="Amigos e Influencers">
              <div className="rounded-xl border border-gray-300 shadow-sm overflow-hidden">
                  <ListItem icon={<UserIcon className="w-6 h-6" />} text="Mis amigos" subtext="Selecciona tus amigos y lo que pueden ver" onClick={comingSoon} />
                  <hr className="border-gray-200" />
                  <ListItem icon={<SparklesIcon className="w-6 h-6" />} text="Influencers" subtext="Sigue a los influencers y ve sus recomendaciones" onClick={comingSoon} />
              </div>
          </Section>

          <Section title="Beneficios">
              <div className="rounded-xl border border-gray-300 shadow-sm overflow-hidden">
                  <ListItem 
                      icon={<div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">CR</div>} 
                      text="Créditos" 
                      value="$0.00"
                      hasChevron={false}
                  />
                  <hr className="border-gray-200" />
                  <ListItem icon={<TicketIcon className="w-6 h-6" />} text="Cupones" onClick={comingSoon} />
                  <hr className="border-gray-200" />
                  <ListItem icon={<StarIcon className="w-6 h-6 text-yellow-500" />} text="Loyalty" onClick={comingSoon} />
              </div>
          </Section>
          
          <Section title="Mi cuenta">
              <div className="rounded-xl border border-gray-300 shadow-sm overflow-hidden">
                  <ListItem icon={<CrownIcon className="w-6 h-6" />} text="RappiPro" onClick={comingSoon} />
                   <hr className="border-gray-200" />
                  <ListItem icon={<LocationIcon className="w-6 h-6" />} text="Direcciones" onClick={() => setShowAddressModal(true)} />
                   <hr className="border-gray-200" />
                  <ListItem icon={<CreditCardIcon className="w-6 h-6" />} text="Métodos de pago" onClick={() => setShowPaymentMethod(true)} />
                   <hr className="border-gray-200" />
                  <ListItem icon={<DocumentTextIcon className="w-6 h-6" />} text="Datos de facturación" onClick={comingSoon} />
                   <hr className="border-gray-200" />
                  <ListItem icon={<HeadphonesIcon className="w-6 h-6" />} text="Ayuda" onClick={comingSoon} />
              </div>
          </Section>

          <Section title="Configuración">
              <div className="rounded-xl border border-gray-300 shadow-sm overflow-hidden">
                  <ListItem icon={<BellIcon className="w-6 h-6" />} text="Notificaciones" onClick={comingSoon} />
              </div>
          </Section>
          
          <Section title="Más información">
              <div className="rounded-xl border border-gray-300 shadow-sm overflow-hidden">
                  <ListItem icon={<StoreIcon className="w-6 h-6" />} text="Quiero ser Aliado Estrella" onClick={comingSoon} />
                   <hr className="border-gray-200" />
                  <ListItem icon={<MotorcycleIcon className="w-6 h-6" />} text="Quiero ser Repartidor" onClick={comingSoon} />
              </div>
          </Section>

          <Section title="Sesión">
              <div className="rounded-xl border border-gray-300 shadow-sm overflow-hidden">
                  <ListItem icon={<LogOutIcon className="w-6 h-6 text-red-600" />} text="Cerrar Sesión" onClick={handleLogoutClick} />
              </div>
          </Section>
      </div>

      <AddressManagerModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSave={handleSaveAddress}
        showToast={showToast}
        isLoaded={isMapsLoaded}
        initialAddress={profile || undefined}
      />
    </div>
  );
};
