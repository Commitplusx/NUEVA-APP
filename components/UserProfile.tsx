import { useDebounce } from '../hooks/useDebounce';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, getErrorMessage, geocodeAddress } from '../services/api';
import { Profile } from '../types';
import { Spinner } from './Spinner';
import { Toast } from './Toast';
import { useAppContext } from '../context/AppContext';
import { Avatar } from './Avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, PhoneIcon, MenuDots, MapIcon, ShoppingBagIcon, CreditCardIcon, LogOutIcon, PackageIcon, HeadphonesIcon, TicketIcon, StarIcon, CrownIcon, LocationIcon, DocumentTextIcon, BellIcon, StoreIcon, MotorcycleIcon, UserIcon, SparklesIcon } from './icons';
import Map, { Marker, MapRef } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/services/supabase';
import Lottie from 'lottie-react';
import profileAnimation from './animations/profile.json';

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

  const handleSelectSuggestion = (suggestion: any) => {
    const { center, place_name } = suggestion;
    const [lng, lat] = center;
    setMapCenter({ lat, lng });
    mapRef.current?.flyTo({ center: [lng, lat], zoom: 17 });
    setAddressData(prev => ({ ...prev, lat, lng, street_address: place_name }));
    setSearchQuery(place_name);
    setSuggestions([]);
  };

  const handleSaveAddress = async () => {
    if (!addressData.street_address || !addressData.lat) {
      showToast('Por favor, selecciona una dirección válida.', 'error');
      return;
    }
    setIsSaving(true);
    try {
      await onSave(addressData);
      showToast('Dirección guardada con éxito.', 'success');
      onClose();
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (isOpen && initialAddress) {
        setAddressData(initialAddress);
        if (initialAddress.lat && initialAddress.lng) {
            setMapCenter({ lat: initialAddress.lat, lng: initialAddress.lng });
        }
    }
  }, [isOpen, initialAddress]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-60 flex items-end justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "100%" }}
            className="bg-gray-50 rounded-t-2xl shadow-xl max-w-md w-full h-full max-h-[95vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="p-4 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-xl font-bold text-center text-gray-800">Agregar nueva dirección</h2>
            </header>
            <div className="overflow-y-auto flex-grow">
                <div className="-mx-0 h-48 w-auto rounded-none overflow-hidden relative">
                    <Map
                        ref={mapRef}
                        initialViewState={{ latitude: mapCenter.lat, longitude: mapCenter.lng, zoom: 15 }}
                        style={{width: '100%', height: '100%'}}
                        mapStyle="mapbox://styles/mapbox/streets-v11"
                        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
                    >
                        <Marker longitude={mapCenter.lng} latitude={mapCenter.lat} />
                    </Map>
                     <div className="absolute inset-0 bg-gradient-to-t from-gray-50 to-transparent"></div>
                </div>
                <div className="p-4 -mt-4">
                    <div className="relative">
                        <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} type="text" placeholder="Busca tu calle, colonia o código postal..." className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-md" />
                        {suggestions.length > 0 && (
                          <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 shadow-lg">
                            {suggestions.map((suggestion) => (
                              <li
                                key={suggestion.id}
                                className="p-2 cursor-pointer hover:bg-gray-200"
                                onClick={() => handleSelectSuggestion(suggestion)}
                              >
                                {suggestion.place_name}
                              </li>
                            ))}
                          </ul>
                        )}
                    </div>
                    <div className="space-y-4 mt-6">
                         {/* Form fields remain the same */}
                    </div>
                </div>
            </div>
            <div className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
              <button onClick={handleSaveAddress} className="w-full py-4 bg-gray-900 text-white font-bold transition-transform shadow-lg disabled:opacity-50 rounded-lg hover:bg-black" disabled={isSaving || !addressData.street_address}>
                {isSaving ? 'Guardando...' : 'Guardar y continuar'}
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
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Editar Perfil</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={profileData.full_name || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                    placeholder="Tu nombre completo"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={profileData.phone || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                    placeholder="Tu teléfono (Ej: +521...)"
                  />
                </div>
              </div>
  
              <div className="mt-8 flex justify-end space-x-3">
                <button onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold transition-colors" disabled={isSaving}>
                  Cancelar
                </button>
                <button onClick={handleSaveProfile} className="px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-800 font-bold transition-colors" disabled={isSaving}>
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
          setOrders([]);
          return;
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
        } catch (error: any) {
          console.error('Error fetching orders:', error);
          setErrorOrders('Error al cargar tus pedidos.');
          showToast('Error al cargar tus pedidos.', 'error');
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
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Mis Pedidos</h2>
              
              {loadingOrders ? (
                <Spinner />
              ) : errorOrders ? (
                <p className="text-red-500 text-center">{errorOrders}</p>
              ) : orders.length === 0 ? (
                <p className="text-gray-600 text-center">No tienes pedidos realizados aún.</p>
              ) : (
                <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
                  {orders.map((order, index) => (
                    <div 
                      key={order.id || `order-${index}`} 
                      className="p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleOrderClick(order)}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-semibold text-lg text-gray-800">Pedido #{order.id}</p>
                        <span className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">Total: <span className="font-bold">${order.total_amount?.toFixed(2) || '0.00'}</span></p>
                      
                      {order.order_items && order.order_items.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="font-medium text-gray-700 mb-1">Artículos:</p>
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            {order.order_items.slice(0, 3).map((item: any, itemIndex: number) => (
                              <li key={item.id || `order-${order.id}-item-${itemIndex}`}>
                                {item.quantity} x {item.name}
                              </li>
                            ))}
                            {order.order_items.length > 3 && (
                              <li className="text-xs text-gray-500">...y {order.order_items.length - 3} más</li>
                            )}
                          </ul>
                        </div>
                      )}
                      {(!order.order_items || order.order_items.length === 0) && (
                        <p className="text-sm text-gray-500 italic">No hay artículos para este pedido.</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
  
              <div className="mt-8 flex justify-end">
                <button onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold transition-colors">
                  Cerrar
                </button>
              </div>
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
          />
        )}
      </AnimatePresence>
    );
  };
  
  interface OrderDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: any; // Define a proper type for order
    onRepeatOrder: (order: any) => void;
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  }
  
  const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ isOpen, onClose, order, onRepeatOrder, showToast }) => {
    if (!order) return null;
  
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
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Detalle del Pedido #{order.id}</h2>
              
              {order.restaurants && (
                <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
                  <img 
                    src={order.restaurants.image_url} 
                    alt={order.restaurants.name} 
                    className="w-16 h-16 rounded-full object-cover mr-4 border border-gray-200"
                  />
                  <div>
                    <p className="font-bold text-lg text-gray-800">{order.restaurants.name}</p>
                    <p className="text-sm text-gray-600">Restaurante</p>
                  </div>
                </div>
              )}
              
              <div className="space-y-3 text-gray-700">
                <p><strong>Fecha:</strong> {new Date(order.created_at).toLocaleString()}</p>
                <p><strong>Estado:</strong> {order.status || 'Desconocido'}</p>
                <p><strong>Total:</strong> ${order.total_amount?.toFixed(2) || '0.00'}</p>
                
                {order.order_items && order.order_items.length > 0 && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="font-medium text-gray-800 mb-2">Artículos:</p>
                    <ul className="space-y-2">
                      {order.order_items.map((item: any, itemIndex: number) => (
                        <li key={`order-${order.id}-orderitem-${item.id}-menuitem-${item.menu_items.id}-itemindex-${itemIndex}`} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                          <span>{item.quantity} x {item.menu_items.name}</span>
                          <span>${(item.quantity * item.price)?.toFixed(2) || '0.00'}</span>
                        </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
  
              <div className="mt-8 flex justify-between space-x-3">
                <button 
                  onClick={() => onRepeatOrder(order)} 
                  className="flex-1 px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-800 font-bold transition-colors"
                >
                  Repetir Orden
                </button>
                <button onClick={onClose} className="flex-1 px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold transition-colors">
                  Cerrar
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
  
    const handleSaveProfile = async (profileData: Partial<Profile>) => {
      if (!profile) return;
      try {
        const updatedProfile = { ...profile, ...profileData };
        await updateProfile(updatedProfile);
        setProfile(updatedProfile);
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
                  size={64}
                  onUpload={() => {}}
                  loading={false}
                />
              ) : (
                <Lottie animationData={profileAnimation} loop={true} className="w-full h-full" />
              )}
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{profile?.full_name || 'Tu nombre'}</p>
              <button onClick={() => setShowEditProfileModal(true)} className="text-sm font-semibold text-gray-800 hover:text-gray-600">
                Editar perfil ›
              </button>
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-1">{formatAddress(profile)}</p>
          <p className="text-gray-400 text-sm mt-1">{profile?.phone || 'No hay teléfono registrado.'}</p>
        </div>
  
        <div className="grid grid-cols-3 gap-3 px-4 mb-8">
            <QuickActionButton icon={<PackageIcon className="w-7 h-7" />} label="Pedidos" onClick={() => setShowOrdersModal(true)} />
            <QuickActionButton icon={<HeadphonesIcon className="w-7 h-7" />} label="Editar Perfil" onClick={() => setShowEditProfileModal(true)} />
            <QuickActionButton icon={<CreditCardIcon className="w-7 h-7" />} label="Métodos de pago" onClick={() => navigate('/payment-methods')} />
        </div>
        
        <div className="px-4 space-y-8">
            <Section title="Beneficios">
                <div className="rounded-xl border border-gray-300 shadow-sm overflow-hidden">
                    <ListItem 
                        icon={<div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">CR</div>} 
                        text="Créditos" 
                        value="$0.00"
                        hasChevron={false}
                    />
                </div>
            </Section>
            
            <Section title="Mi cuenta">
                <div className="rounded-xl border border-gray-300 shadow-sm overflow-hidden">
                    <ListItem icon={<LocationIcon className="w-6 h-6" />} text="Direcciones" onClick={() => setIsAddressModalOpen(true)} />
                     <hr className="border-gray-200" />
                    <ListItem icon={<CreditCardIcon className="w-6 h-6" />} text="Métodos de pago" onClick={() => navigate('/payment-methods')} />
                </div>
            </Section>
  
            <Section title="Sesión">
                <div className="rounded-xl border border-gray-300 shadow-sm overflow-hidden">
                    <ListItem icon={<LogOutIcon className="w-6 h-6 text-red-600" />} text="Cerrar Sesión" onClick={handleLogoutClick} />
                </div>
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
  
