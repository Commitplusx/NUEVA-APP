import { useDebounce } from '../hooks/useDebounce';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, getErrorMessage, geocodeAddress, reverseGeocode } from '../services/api';
import { Profile } from '../types';
import { Spinner } from './Spinner';
import { Toast } from './Toast';
import { useAppContext } from '../context/AppContext';
import { Avatar } from './Avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, PhoneIcon, MenuDots, MapIcon, ShoppingBagIcon, CreditCardIcon, LogOutIcon, PackageIcon, HeadphonesIcon, TicketIcon, StarIcon, CrownIcon, LocationIcon, DocumentTextIcon, BellIcon, StoreIcon, MotorcycleIcon, UserIcon, SparklesIcon, XCircleIcon, HeartIcon } from './icons';
import Map, { Marker, MapRef } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/services/supabase';
import Lottie from 'lottie-react';
import profileAnimation from './animations/profile.json';

const Section: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = "" }) => (
  <div className={`mb-8 ${className}`}>
    <h2 className="px-2 text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
      <span className="w-1 h-6 bg-purple-600 rounded-full"></span>
      {title}
    </h2>
    <div className="space-y-3">{children}</div>
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
    <div className="flex items-center p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="mr-4 w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
        {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
      </div>
      <div className="flex-1">
        <p className="font-bold text-gray-800 text-sm group-hover:text-purple-900 transition-colors">{text}</p>
        {subtext && <p className="text-xs text-gray-500 mt-0.5">{subtext}</p>}
      </div>
      {value && <p className="font-bold text-gray-900 text-sm">{value}</p>}
      {hasChevron && <ChevronRightIcon className="w-4 h-4 text-gray-300 group-hover:text-purple-400 transition-colors ml-3" />}
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="w-full text-left block">
        {content}
      </button>
    )
  }
  return <div>{content}</div>;
};

const QuickActionButton: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void }> = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center justify-center gap-2 group w-full">
    <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-100 group-hover:scale-110 transition-all duration-300 shadow-sm">
      {icon}
    </div>
    <span className="font-semibold text-xs text-gray-600 group-hover:text-purple-700 transition-colors">{label}</span>
  </button>
);

interface AddressManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (addressData: Partial<Profile>) => Promise<void>;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  initialAddress?: Partial<Profile>;
}

const AddressManagerModal: React.FC<AddressManagerModalProps> = ({ isOpen, onClose, onSave, showToast, initialAddress }) => {
  const [addressData, setAddressData] = useState<Partial<Profile>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [mapCenter, setMapCenter] = useState({ lat: 16.2519, lng: -92.1383 });
  const [isSearching, setIsSearching] = useState(false);
  const mapRef = useRef<MapRef>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const isPickingLocation = useRef(false);
  const hasUserSelectedLocation = useRef(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddressData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (debouncedSearchQuery) {
      const fetchSuggestions = async () => {
        setIsSearching(true);
        try {
          const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${debouncedSearchQuery}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}&country=MX&proximity=-92.1383,16.2519`);
          const data = await response.json();
          setSuggestions(data.features);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        } finally {
          setIsSearching(false);
        }
      };
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [debouncedSearchQuery]);

  const handleSelectSuggestion = async (suggestion: any) => {
    const { center, place_name } = suggestion;
    const [lng, lat] = center;
    setMapCenter({ lat, lng });
    mapRef.current?.flyTo({ center: [lng, lat], zoom: 17 });

    hasUserSelectedLocation.current = true;

    try {
      const structuredData = await reverseGeocode(lat, lng);
      setAddressData(prev => ({
        ...prev,
        lat,
        lng,
        street_address: structuredData?.address || place_name,
        neighborhood: structuredData?.neighborhood || '',
        postal_code: structuredData?.postalCode || '',
        city: structuredData?.city || ''
      }));
    } catch (e) {
      console.error("Error getting structured data", e);
      setAddressData(prev => ({ ...prev, lat, lng, street_address: place_name }));
    }

    setSearchQuery(place_name);
    setSuggestions([]);
  };

  const handleOpenNativeMap = async () => {
    if (isPickingLocation.current) return;

    if (Capacitor.getPlatform() !== 'web') {
      isPickingLocation.current = true;
      try {
        const NativeMap = (Capacitor as any).Plugins.NativeMap;
        const result = await NativeMap.pickLocation({
          initialPosition: addressData.lat && addressData.lng ? { latitude: addressData.lat, longitude: addressData.lng } : undefined
        });

        if (result && result.latitude) {
          const lat = result.latitude;
          const lng = result.longitude;
          const address = result.address;

          const structuredData = await reverseGeocode(lat, lng);

          const newAddressData = {
            lat,
            lng,
            street_address: structuredData?.address || address,
            neighborhood: structuredData?.neighborhood || '',
            postal_code: structuredData?.postalCode || '',
            city: structuredData?.city || ''
          };

          // Save to localStorage to survive app reload
          localStorage.setItem('pendingAddressData', JSON.stringify(newAddressData));

          setAddressData(prev => ({
            ...prev,
            ...newAddressData
          }));

          setMapCenter({ lat, lng });
          setSearchQuery(structuredData?.address || address || '');
        }
      } catch (e) {
        console.log('Native map canceled or failed', e);
      } finally {
        setTimeout(() => { isPickingLocation.current = false; }, 800);
      }
    }
  };

  const handleSaveAddress = async () => {
    if (!addressData.street_address || !addressData.lat) {
      showToast('Por favor, selecciona una dirección válida.', 'error');
      return;
    }
    if (!addressData.neighborhood) {
      showToast('Por favor, ingresa el barrio o colonia.', 'error');
      return;
    }
    setIsSaving(true);
    try {
      await onSave(addressData);
      localStorage.removeItem('pendingAddressData'); // Clear pending data after successful save
      showToast('Dirección guardada con éxito.', 'success');
      onClose();
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const hasLoadedInitialData = useRef(false);

  useEffect(() => {
    if (isOpen) {
      // Check if there's pending address data from native map
      const pendingData = localStorage.getItem('pendingAddressData');

      if (pendingData) {
        try {
          const parsedData = JSON.parse(pendingData);
          setAddressData(prev => ({ ...prev, ...parsedData }));
          if (parsedData.lat && parsedData.lng) {
            setMapCenter({ lat: parsedData.lat, lng: parsedData.lng });
          }
          if (parsedData.street_address) {
            setSearchQuery(parsedData.street_address);
          }
          hasUserSelectedLocation.current = true;
          localStorage.removeItem('pendingAddressData');
        } catch (e) {
          console.error('Error parsing pending address data:', e);
          localStorage.removeItem('pendingAddressData');
        }
      } else if (!hasUserSelectedLocation.current && initialAddress) {
        setAddressData(initialAddress);
        if (initialAddress.lat && initialAddress.lng) {
          setMapCenter({ lat: initialAddress.lat, lng: initialAddress.lng });
        }
        hasLoadedInitialData.current = true;
      }
    }

    if (!isOpen) {
      hasLoadedInitialData.current = false;
      hasUserSelectedLocation.current = false;
      localStorage.removeItem('pendingAddressData'); // Clean up if modal was closed without saving
    }
  }, [isOpen, initialAddress]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-t-[2.5rem] shadow-2xl max-w-md w-full h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="p-6 pb-4 border-b border-gray-100 flex-shrink-0 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Nueva Dirección</h2>
              <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                <XCircleIcon className="w-6 h-6 text-gray-500" />
              </button>
            </header>

            <div className="overflow-y-auto flex-grow">
              <div className="mx-6 mt-2 h-48 rounded-2xl overflow-hidden relative shadow-md border border-gray-100">
                {Capacitor.getPlatform() === 'web' ? (
                  import.meta.env.VITE_MAPBOX_TOKEN ? (
                    <Map
                      ref={mapRef}
                      initialViewState={{ latitude: mapCenter.lat, longitude: mapCenter.lng, zoom: 15 }}
                      style={{ width: '100%', height: '100%' }}
                      mapStyle="mapbox://styles/mapbox/streets-v11"
                      mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
                    >
                      <Marker longitude={mapCenter.lng} latitude={mapCenter.lat} />
                    </Map>
                  ) : (
                    <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
                      <MapIcon className="w-12 h-12 text-gray-300 mb-2" />
                      <p className="text-gray-500 font-medium">Mapa no disponible</p>
                    </div>
                  )
                ) : (
                  <div
                    className="w-full h-full bg-gray-100 flex items-center justify-center relative cursor-pointer group"
                    onClick={handleOpenNativeMap}
                  >
                    <img
                      src={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${mapCenter.lng},${mapCenter.lat},15,0,0/600x300?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`}
                      alt="Mapa"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                      <button className="bg-white px-5 py-2.5 rounded-full shadow-lg font-bold text-sm flex items-center gap-2 text-gray-900 transform transition-transform group-hover:scale-105">
                        <MapIcon className="w-4 h-4 text-purple-600" />
                        Abrir Mapa
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Calle y Número</label>
                  <div className="relative">
                    <input
                      name="street_address"
                      value={addressData.street_address || ''}
                      onChange={handleInputChange}
                      className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500/20 text-gray-900 font-medium transition-all"
                      placeholder="Ej. Av. Central Poniente 123"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-600">
                      <LocationIcon className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Colonia</label>
                    <input
                      name="neighborhood"
                      value={addressData.neighborhood || ''}
                      onChange={handleInputChange}
                      className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500/20 text-gray-900 font-medium transition-all"
                      placeholder="Ej. Centro"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">C.P.</label>
                    <input
                      name="postal_code"
                      value={addressData.postal_code || ''}
                      onChange={handleInputChange}
                      className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500/20 text-gray-900 font-medium transition-all"
                      placeholder="30000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Referencias</label>
                  <input
                    name="address_line_2"
                    value={addressData.address_line_2 || ''}
                    onChange={handleInputChange}
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500/20 text-gray-900 font-medium transition-all"
                    placeholder="Ej. Casa azul, frente al parque..."
                  />
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border-t border-gray-100 flex-shrink-0">
              <button
                onClick={handleSaveAddress}
                className="w-full py-4 bg-purple-600 text-white font-bold text-lg rounded-2xl shadow-lg shadow-purple-600/30 hover:bg-purple-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:shadow-none"
                disabled={isSaving || !addressData.street_address}
              >
                {isSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner className="w-5 h-5 border-white" /> Guardando...
                  </span>
                ) : 'Guardar Dirección'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profileData: Partial<Profile>) => Promise<void>;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  initialProfile?: Partial<Profile>;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, onSave, showToast, initialProfile }) => {
  const [profileData, setProfileData] = useState<Partial<Profile>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && initialProfile) {
      setProfileData(initialProfile);
    } else if (!isOpen) {
      setProfileData({});
    }
  }, [isOpen, initialProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await onSave(profileData);
      showToast('Perfil actualizado con éxito.', 'success');
      onClose();
    } catch (error) {
      showToast('Error al actualizar el perfil.', 'error');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-[2rem] p-8 shadow-2xl max-w-md w-full relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-indigo-600"></div>

            <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
              <span className="w-2 h-8 bg-purple-600 rounded-full"></span>
              Editar Perfil
            </h2>

            <div className="space-y-5">
              <div>
                <label htmlFor="full_name" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Nombre Completo</label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={profileData.full_name || ''}
                  onChange={handleInputChange}
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500/20 text-gray-900 font-medium transition-all"
                  placeholder="Tu nombre completo"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Teléfono</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={profileData.phone || ''}
                  onChange={handleInputChange}
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500/20 text-gray-900 font-medium transition-all"
                  placeholder="Tu teléfono (Ej: +521...)"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Correo Electrónico</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileData.email || ''}
                  onChange={handleInputChange}
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500/20 text-gray-900 font-medium transition-all"
                  placeholder="tu@correo.com"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 font-bold transition-colors"
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-bold transition-all shadow-lg shadow-purple-600/30 active:scale-95"
                disabled={isSaving}
              >
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface UserOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  userId: string | undefined;
}

const UserOrdersModal: React.FC<UserOrdersModalProps> = ({ isOpen, onClose, showToast, userId }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [errorOrders, setErrorOrders] = useState<string | null>(null);
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const { handleAddToCart } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isOpen || !userId) {
        return;
      }

      // Try to load from localStorage first
      const cachedOrders = localStorage.getItem('userOrders');
      const cachedTimestamp = localStorage.getItem('userOrdersTimestamp');
      const now = new Date().getTime();
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

      if (cachedOrders) {
        try {
          setOrders(JSON.parse(cachedOrders));
          setLoadingOrders(false);

          // If cache is fresh, don't fetch
          if (cachedTimestamp && (now - parseInt(cachedTimestamp) < CACHE_DURATION)) {
            return;
          }
        } catch (e) {
          console.error('Error parsing cached orders:', e);
        }
      }

      setLoadingOrders(true);
      setErrorOrders(null);
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items!left(id, quantity, price, menu_items(id, name, description, price, image_url)), restaurants(*)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }
        setOrders(data || []);
        localStorage.setItem('userOrders', JSON.stringify(data || []));
        localStorage.setItem('userOrdersTimestamp', now.toString());
      } catch (error: any) {
        console.error('Error fetching orders:', error);
        if (!cachedOrders) {
          setErrorOrders('Error al cargar tus pedidos.');
          showToast('Error al cargar tus pedidos.', 'error');
        }
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [isOpen, userId, showToast]);

  const handleOrderClick = (order: any) => {
    setSelectedOrder(order);
    setShowOrderDetailModal(true);
  };

  const handleRepeatOrder = (order: any) => {
    if (order.order_items && order.order_items.length > 0) {
      order.order_items.forEach((item: any) => {
        const menuItem = {
          ...item.menu_items,
          imageUrl: item.menu_items.image_url,
        };
        handleAddToCart(menuItem, item.quantity, [], order.restaurants);
      });
      showToast('Orden añadida al carrito.', 'success');
      setShowOrderDetailModal(false);
      onClose();
      navigate('/cart');
    } else {
      showToast('No hay artículos para repetir en esta orden.', 'error');
    }
  };

  const getStatusStyle = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('entregado') || s.includes('completado')) return 'text-green-700 bg-green-50 border border-green-100';
    if (s.includes('pendiente') || s.includes('preparando') || s.includes('confirmado')) return 'text-orange-700 bg-orange-50 border border-orange-100';
    if (s.includes('recogido') || s.includes('camino') || s.includes('reparto') || s.includes('delivery')) return 'text-blue-700 bg-blue-50 border border-blue-100';
    if (s.includes('cancelado')) return 'text-red-700 bg-red-50 border border-red-100';
    return 'text-gray-700 bg-gray-50 border border-gray-100';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-[2rem] p-6 shadow-2xl max-w-md w-full h-[80vh] flex flex-col relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-8 bg-purple-600 rounded-full"></span>
                Mis Pedidos
              </h2>
              <button onClick={onClose} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                <XCircleIcon className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {loadingOrders ? (
              <div className="flex-1 flex items-center justify-center">
                <Spinner />
              </div>
            ) : errorOrders ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <p className="text-red-500 font-medium mb-2">{errorOrders}</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <PackageIcon className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">No tienes pedidos realizados aún.</p>
              </div>
            ) : (
              <div className="space-y-4 overflow-y-auto pr-2 flex-grow">
                {orders.map((order, index) => (
                  <div
                    key={order.id || `order-${index}`}
                    className="p-5 border border-gray-100 rounded-2xl shadow-sm bg-white cursor-pointer hover:shadow-md hover:border-purple-100 transition-all group"
                    onClick={() => handleOrderClick(order)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-bold text-lg text-gray-900 group-hover:text-purple-700 transition-colors">Pedido #{order.id.toString().slice(0, 8)}</p>
                        <span className="text-xs text-gray-400 font-medium">{new Date(order.created_at).toLocaleDateString()} • {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${getStatusStyle(order.status)}`}>
                        {order.status || 'Desconocido'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mb-4 bg-gray-50 p-3 rounded-xl">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total</p>
                      <p className="font-bold text-lg text-gray-900">${order.total_amount?.toFixed(2) || '0.00'}</p>
                    </div>

                    {order.order_items && order.order_items.length > 0 && (
                      <div className="pt-3 border-t border-gray-50">
                        <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wide">Artículos</p>
                        <ul className="space-y-2">
                          {order.order_items.slice(0, 2).map((item: any, itemIndex: number) => (
                            <li key={item.id || `order-${order.id}-item-${itemIndex}`} className="text-sm text-gray-600 flex justify-between items-center">
                              <span className="flex items-center gap-2">
                                <span className="w-5 h-5 bg-purple-100 text-purple-700 font-bold rounded flex items-center justify-center text-xs">{item.quantity}</span>
                                <span className="font-medium">{item.name}</span>
                              </span>
                            </li>
                          ))}
                          {order.order_items.length > 2 && (
                            <li className="text-xs text-purple-500 font-medium pl-7">+ {order.order_items.length - 2} más...</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
      {selectedOrder && (
        <OrderDetailModal
          isOpen={showOrderDetailModal}
          onClose={() => setShowOrderDetailModal(false)}
          order={selectedOrder}
          onRepeatOrder={handleRepeatOrder}
          showToast={showToast}
          getStatusStyle={getStatusStyle}
        />
      )}
    </AnimatePresence>
  );
};

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onRepeatOrder: (order: any) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  getStatusStyle: (status: string) => string;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ isOpen, onClose, order, onRepeatOrder, showToast, getStatusStyle }) => {
  if (!order) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-[2rem] p-6 shadow-2xl max-w-md w-full relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-8 bg-purple-600 rounded-full"></span>
                Detalle del Pedido
              </h2>
              <button onClick={onClose} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                <XCircleIcon className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="mb-6 flex justify-center">
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${getStatusStyle(order.status)}`}>
                {order.status || 'Desconocido'}
              </span>
            </div>

            {order.restaurants && (
              <div className="flex items-center mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <img
                  src={order.restaurants.image_url}
                  alt={order.restaurants.name}
                  className="w-14 h-14 rounded-full object-cover mr-4 border-2 border-white shadow-sm"
                />
                <div>
                  <p className="font-bold text-lg text-gray-900">{order.restaurants.name}</p>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Restaurante</p>
                </div>
              </div>
            )}

            <div className="space-y-4 text-gray-700 mb-8">
              <div className="flex justify-between border-b border-gray-100 pb-3">
                <span className="text-gray-500 font-medium text-sm">Fecha</span>
                <span className="font-bold text-gray-900 text-sm">{new Date(order.created_at).toLocaleString()}</span>
              </div>

              {order.order_items && order.order_items.length > 0 && (
                <div>
                  <p className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Artículos</p>
                  <ul className="space-y-3">
                    {order.order_items.map((item: any, itemIndex: number) => (
                      <li key={`order-${order.id}-detail-${itemIndex}`} className="flex justify-between items-center text-sm">
                        <span className="flex items-center gap-3">
                          <span className="bg-purple-100 text-purple-700 font-bold w-6 h-6 rounded flex items-center justify-center text-xs">{item.quantity}</span>
                          <span className="text-gray-700 font-medium">{item.name}</span>
                        </span>
                        <span className="font-bold text-gray-900">${(item.quantity * item.price)?.toFixed(2) || '0.00'}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-4">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-purple-600">${order.total_amount?.toFixed(2) || '0.00'}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => onRepeatOrder(order)}
                className="flex-1 px-5 py-4 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 font-bold transition-all shadow-lg shadow-purple-600/30 active:scale-[0.98]"
              >
                Repetir Orden
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
  const { user, handleLogout, showToast, setIsAddressModalOpen, isAddressModalOpen } = useAppContext();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      // Try to load from localStorage first
      const cachedProfile = localStorage.getItem('userProfile');
      const cachedTimestamp = localStorage.getItem('userProfileTimestamp');
      const now = new Date().getTime();
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

      if (cachedProfile) {
        try {
          setProfile(JSON.parse(cachedProfile));
          setLoading(false);

          // If cache is fresh, don't fetch
          if (cachedTimestamp && (now - parseInt(cachedTimestamp) < CACHE_DURATION)) {
            return;
          }
        } catch (e) {
          console.error('Error parsing cached profile:', e);
        }
      }

      // Fetch fresh data from Supabase
      try {
        const userProfile = await getProfile();
        setProfile(userProfile);
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        localStorage.setItem('userProfileTimestamp', now.toString());
      } catch (err) {
        console.error(err);
        if (!cachedProfile) {
          setToast({ message: 'Error al cargar el perfil', type: 'error' });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [loading, user, navigate]);

  const handleSaveProfile = async (profileData: Partial<Profile>) => {
    if (!profile) return;
    try {
      const updatedProfile = { ...profile, ...profileData };
      await updateProfile(updatedProfile);
      setProfile(updatedProfile);
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    } catch (error: any) {
      showToast(`Error al actualizar el perfil: ${getErrorMessage(error)}`, 'error');
      console.error(error);
      throw error;
    }
  };

  const handleSaveAddress = async (addressData: Partial<Profile>) => {
    if (!profile) return;
    try {
      const updatedProfile = { ...profile, ...addressData };
      await updateProfile(updatedProfile);
      setProfile(updatedProfile);
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
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

  const comingSoon = () => showToast('Próximamente disponible', 'info');

  return (
    <div className="h-full overflow-y-auto bg-gray-50 pb-24">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header with Gradient */}
      <div className="relative bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-700 pb-10 pt-safe-top rounded-b-[2.5rem] shadow-lg overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-purple-400 opacity-10 rounded-full translate-x-1/3 translate-y-1/3 blur-2xl"></div>

        <header className="px-6 py-4 flex items-center justify-between relative z-10">
          <button
            onClick={handleBack}
            className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-all border border-white/10"
          >
            <ChevronLeftIcon className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white tracking-wide">Mi Perfil</h1>
          <button
            onClick={comingSoon}
            className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-all border border-white/10"
          >
            <MenuDots className="w-6 h-6 text-white" />
          </button>
        </header>

        <div className="flex flex-col items-center mt-4 px-6 relative z-10">
          <div className="w-28 h-28 rounded-full p-1 bg-white/20 backdrop-blur-sm mb-4 relative">
            <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-xl relative">
              {profile?.avatar ? (
                <Avatar
                  url={profile.avatar}
                  size={112} // 28 * 4
                  onUpload={() => { }}
                  loading={false}
                />
              ) : (
                <Lottie animationData={profileAnimation} loop={true} className="w-full h-full scale-110" />
              )}
            </div>
            <button
              onClick={() => setShowEditProfileModal(true)}
              className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-purple-50 text-purple-600 hover:scale-110 transition-transform"
            >
              <SparklesIcon className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-2xl font-bold text-white text-center mb-1">{profile?.full_name || 'Invitado'}</h2>
          <p className="text-purple-100 text-sm text-center max-w-[80%] leading-relaxed opacity-90">
            {formatAddress(profile)}
          </p>
          {profile?.phone && (
            <span className="mt-2 px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-white border border-white/10 backdrop-blur-sm">
              {profile.phone}
            </span>
          )}
        </div>
      </div>

      {/* Quick Actions - Floating Overlap */}
      <div className="px-6 -mt-8 relative z-20 mb-8">
        <div className="bg-white rounded-3xl shadow-xl p-4 flex justify-between items-center border border-gray-100">
          <QuickActionButton icon={<PackageIcon className="w-6 h-6" />} label="Pedidos" onClick={() => setShowOrdersModal(true)} />
          <div className="w-px h-10 bg-gray-100"></div>
          <QuickActionButton icon={<HeartIcon className="w-6 h-6" />} label="Favoritos" onClick={comingSoon} />
          <div className="w-px h-10 bg-gray-100"></div>
          <QuickActionButton icon={<CreditCardIcon className="w-6 h-6" />} label="Pagos" onClick={() => navigate('/payment-methods')} />
        </div>
      </div>

      <div className="px-5 space-y-6">
        <Section title="Mi Cuenta">
          <ListItem icon={<LocationIcon className="w-6 h-6" />} text="Direcciones" onClick={() => setIsAddressModalOpen(true)} subtext="Gestiona tus direcciones de entrega" />
          <ListItem icon={<CreditCardIcon className="w-6 h-6" />} text="Métodos de pago" onClick={() => navigate('/payment-methods')} subtext="Tarjetas y efectivo" />
        </Section>

        <Section title="Configuración">
          <ListItem icon={<BellIcon className="w-6 h-6" />} text="Notificaciones" onClick={comingSoon} subtext="Alertas y promociones" />
          <ListItem icon={<LogOutIcon className="w-6 h-6 text-red-500" />} text="Cerrar Sesión" onClick={handleLogoutClick} hasChevron={false} />
        </Section>
      </div>

      <AddressManagerModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSave={handleSaveAddress}
        showToast={showToast}
        initialAddress={profile || undefined}
      />

      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        onSave={handleSaveProfile}
        showToast={showToast}
        initialProfile={profile || undefined}
      />

      <UserOrdersModal
        isOpen={showOrdersModal}
        onClose={() => setShowOrdersModal(false)}
        showToast={showToast}
        userId={user?.id}
      />
    </div>
  );
};

