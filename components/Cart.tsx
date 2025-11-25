import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, UserCircleIcon, LocationIcon, InfoIcon, MailIcon, CreditCardIcon } from './icons';
import { useAppContext } from '../context/AppContext';
import { useThemeColor } from '../hooks/useThemeColor';
import { OrderUserDetails, CartItem } from '../types';
import { Toast, ToastType } from './Toast';
import { AnimatePresence, motion } from 'framer-motion';
import Lottie from 'lottie-react';
import newCheckoutAnimation from './animations/cart checkout - fast.json';
import { LocationPickerMapModal } from './LocationPickerMapModal'; // Importado
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Capacitor } from '@capacitor/core';
import { reverseGeocode } from '../services/api';
import { supabase } from '../services/supabase';
import { OrderTracker } from './OrderTracker';

type CartStep = 'cart' | 'details' | 'confirmation' | 'success';

const Stepper: React.FC<{ currentStep: CartStep }> = ({ currentStep }) => {
  const steps: CartStep[] = ['cart', 'details', 'confirmation', 'success'];
  const currentStepIndex = steps.indexOf(currentStep);

  const getStepName = (step: CartStep) => {
    if (step === 'cart') return 'Carrito';
    if (step === 'details') return 'Tus Datos';
    if (step === 'confirmation') return 'Confirmar';
    return 'Éxito';
  }

  return (
    <div className="flex items-center w-full mb-8 px-2">
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center text-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors duration-300 ${index <= currentStepIndex ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}
            >
              {index < currentStepIndex ? <ChevronLeftIcon className="w-6 h-6 rotate-180" /> : index + 1}
            </div>
            <p
              className={`mt-2 text-xs font-bold transition-colors duration-300 ${index <= currentStepIndex ? 'text-orange-500' : 'text-gray-500'
                }`}
            >
              {getStepName(step)}
            </p>
          </div>
          {index < steps.length - 1 && (
            <div className={`flex-auto border-t-2 transition-colors duration-300 mx-2 ${index < currentStepIndex ? 'border-orange-500' : 'border-gray-200'
              }`}></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const PRICE_PER_KM = 10; // $10 per km

export const Cart: React.FC = () => {
  useThemeColor('#f97316');
  const {
    cart: cartItems,
    handleUpdateCart,
    handleConfirmOrder,
    baseFee,
    user,
    profile,
    selectedPaymentMethod,
    setDestinationCoords, // Usar setter del contexto
    setBottomNavVisible,
  } = useAppContext();
  const navigate = useNavigate();
  const [userAddressCoords, setUserAddressCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [calculatedDistance, setCalculatedDistance] = useState<number | null>(null);
  const [calculatedDeliveryFee, setCalculatedDeliveryFee] = useState<number>(0);

  // Estado para el mapa
  const [showMapPicker, setShowMapPicker] = useState(false);

  // State for user details form
  const [userDetails, setUserDetails] = useState<OrderUserDetails>({
    name: '',
    address: '',
    postalCode: '',
    neighborhood: '',
    phone: ''
  });
  const [toastInfo, setToastInfo] = useState<{ message: string; type: ToastType } | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  // Initialize currentOrderId from localStorage if available
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(() => {
    const savedOrderId = localStorage.getItem('active_order_id');
    return savedOrderId ? parseInt(savedOrderId, 10) : null;
  });

  // Initialize step based on whether we have an active order
  const [step, setStep] = useState<CartStep>(() => {
    return localStorage.getItem('active_order_id') ? 'success' : 'cart';
  });

  useEffect(() => {
    if (user && profile) {
      setUserDetails(prev => {
        // Si la dirección actual es diferente a la del perfil (y no está vacía), 
        // asumimos que el usuario ya eligió otra ubicación y NO sobrescribimos con el perfil.
        const isAddressDifferent = prev.address && prev.address !== profile.street_address;

        if (isAddressDifferent) {
          return prev;
        }

        return {
          ...prev,
          name: prev.name || profile.full_name || '',
          address: prev.address || profile.street_address || '',
          neighborhood: prev.neighborhood || profile.neighborhood || '',
          postalCode: prev.postalCode || profile.postal_code || '',
          phone: prev.phone || profile.phone || '',
        };
      });

      // Inicializar coords desde perfil SOLO si no existen ya
      if (profile.lat && profile.lng) {
        setUserAddressCoords(prev => {
          if (prev) return prev; // Si ya hay coordenadas, no sobrescribir

          // Side effect moved out: We will sync destinationCoords in a separate effect or just here if we weren't using functional update.
          // But since we need to check 'prev', we can't easily do it outside without 'userAddressCoords' dependency which might loop.
          // However, since this is initialization, we can check if userAddressCoords is null.
          return { lat: profile.lat!, lng: profile.lng! };
        });
      }
    }
  }, [user, profile]);

  // Sync destinationCoords when userAddressCoords is set initially
  useEffect(() => {
    if (userAddressCoords && !calculatedDistance) {
      // This is a bit hacky. We want to sync ONLY if it was just initialized from profile.
      // But setDestinationCoords is safe to call in useEffect.
      setDestinationCoords(userAddressCoords);
    }
  }, [userAddressCoords, setDestinationCoords]);

  // Calculate distance and price whenever coordinates change
  useEffect(() => {
    const restaurant = cartItems[0]?.restaurant;
    if (userAddressCoords && restaurant?.lat && restaurant?.lng) {
      const dist = haversineDistance(restaurant.lat, restaurant.lng, userAddressCoords.lat, userAddressCoords.lng);
      const fee = baseFee + (dist * PRICE_PER_KM);
      setCalculatedDistance(dist);
      setCalculatedDeliveryFee(fee);
    } else {
      setCalculatedDistance(null);
      setCalculatedDeliveryFee(baseFee);
    }
  }, [userAddressCoords, cartItems, baseFee]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserDetails(prev => ({ ...prev, [name]: value }));
  };

  const isPickingLocation = React.useRef(false);

  const handleOpenMap = async () => {
    if (isPickingLocation.current) return;

    if (Capacitor.getPlatform() !== 'web') {
      isPickingLocation.current = true;
      try {
        const NativeMap = (Capacitor as any).Plugins.NativeMap;
        const result = await NativeMap.pickLocation({
          initialPosition: userAddressCoords ? { latitude: userAddressCoords.lat, longitude: userAddressCoords.lng } : undefined
        });
        if (result && result.latitude) {
          handleConfirmLocation(result.address, result.latitude, result.longitude);
        }
      } catch (e) {
        console.log('Native map canceled or failed', e);
      } finally {
        setTimeout(() => { isPickingLocation.current = false; }, 800);
      }
    } else {
      isPickingLocation.current = true;
      setBottomNavVisible(false);
      setShowMapPicker(true);
    }
  };

  const handleConfirmLocation = async (address: string, lat: number, lng: number) => {
    console.log('handleConfirmLocation called with:', { address, lat, lng }); // DEBUG LOG
    const coords = { lat, lng };

    // Intentar obtener datos estructurados (CP, Colonia, etc.)
    try {
      const structuredData = await reverseGeocode(lat, lng);
      console.log('Structured Data received in Cart:', structuredData); // DEBUG LOG
      if (structuredData) {
        setUserDetails(prev => {
          const newState = {
            ...prev,
            address: structuredData.address || address,
            neighborhood: structuredData.neighborhood || prev.neighborhood || '', // Keep previous if new is empty? Or clear it? User said it "doesn't change", implying it keeps the OLD one (profile). 
            // Actually, if we move to a new location, we probably WANT to clear the old neighborhood if the new one isn't found, so the user knows to type it.
            // But the user said "sigue marcando la direccion del perfil".
            // Let's try to force update it.
            postalCode: structuredData.postalCode || prev.postalCode || '',
          };

          // If structuredData.neighborhood is empty, we should probably clear it so the user sees they need to enter it, 
          // RATHER than keeping the old profile one which is definitely wrong for a new location.
          if (structuredData.neighborhood) {
            newState.neighborhood = structuredData.neighborhood;
          } else {
            // If map didn't find a neighborhood, clear it so user can enter it manually, 
            // UNLESS it's the exact same location as profile? No, safer to clear or leave empty.
            // The user complaint is "sigue marcando la direccion del perfil". 
            // So we must ensure we are NOT using `prev.neighborhood` if we have a new location.
            newState.neighborhood = '';
          }

          if (structuredData.postalCode) {
            newState.postalCode = structuredData.postalCode;
          } else {
            newState.postalCode = '';
          }

          console.log('Updating userDetails with structured data:', newState); // DEBUG LOG
          return newState;
        });
      } else {
        // Fallback si falla el geocoding estructurado
        console.log('No structured data, using fallback address'); // DEBUG LOG
        setUserDetails(prev => ({ ...prev, address: address }));
      }
    } catch (error) {
      console.error("Error getting structured address:", error);
      setUserDetails(prev => ({ ...prev, address: address }));
    }

    console.log('Setting userAddressCoords to:', coords); // DEBUG LOG
    setUserAddressCoords(coords);
    setDestinationCoords(coords);
    setShowMapPicker(false);
    setBottomNavVisible(true);
    setTimeout(() => { isPickingLocation.current = false; }, 800);
  };

  // Helper to calculate extras cost per unit
  const calculateExtrasPerUnit = (item: CartItem) => {
    let extraPrice = 0;
    if (item.selectedOptions && item.product.customizationOptions) {
      item.product.customizationOptions.forEach(group => {
        const selected = item.selectedOptions?.[group.id] || [];
        const extraCount = Math.max(0, selected.length - group.includedItems);
        extraPrice += extraCount * group.pricePerExtra;
      });
    }
    return extraPrice;
  };

  // Calculate total price for an item (Base + Extras) * Quantity
  const calculateItemTotal = (item: CartItem) => {
    return (item.product.price + calculateExtrasPerUnit(item)) * item.quantity;
  };

  const productsSubtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const extrasSubtotal = cartItems.reduce((sum, item) => sum + calculateExtrasPerUnit(item) * item.quantity, 0);
  const subtotal = productsSubtotal + extrasSubtotal;
  const deliveryFee = baseFee + (calculatedDistance ? calculatedDistance * 10 : 0); // $10 per km
  const total = subtotal + deliveryFee;

  const canProceedToDetails = cartItems.length > 0;
  const canProceedToConfirmation =
    user !== null &&
    userDetails.name.trim() !== '' &&
    userDetails.address.trim() !== '' &&
    userDetails.neighborhood.trim() !== '' &&
    userDetails.phone.trim().length >= 10;

  const handleFinalOrderConfirmation = async () => {
    if (!canProceedToConfirmation) {
      setToastInfo({ message: 'Por favor, completa todos los campos requeridos.', type: 'info' });
      setTimeout(() => setToastInfo(null), 3000);
      return;
    }

    setIsConfirming(true);
    try {
      // Artificial delay of 4 seconds to show animation
      await new Promise(resolve => setTimeout(resolve, 4000));
      const order = await handleConfirmOrder(userDetails, deliveryFee);
      if (order) {
        setCurrentOrderId(order.id);
        localStorage.setItem('active_order_id', order.id.toString());
      }
      setStep('success');
    } catch (error) {
      console.error('Order confirmation failed:', error);
      setToastInfo({ message: 'Error al confirmar el pedido. Inténtalo de nuevo.', type: 'error' });
      setTimeout(() => setToastInfo(null), 3000);
    } finally {
      setIsConfirming(false);
    }
  };

  const renderCartStep = () => (
    <div>
      <div className="space-y-4 mb-6">
        {cartItems.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4">
            {item.product.imageUrl ? (
              <img src={item.product.imageUrl} alt={item.product.name} className="w-20 h-20 rounded-md object-cover flex-shrink-0" />
            ) : (
              <div className="w-20 h-20 rounded-md bg-gray-200 flex items-center justify-center text-gray-500 text-xs text-center p-2 flex-shrink-0">
                No Image
              </div>
            )}
            <div className="flex-grow min-w-0">
              <h3 className="font-semibold text-gray-800 break-words">{item.product.name}</h3>
              <p className="text-sm text-gray-500">${item.product.price.toFixed(2)}</p>
              {(() => {
                const allIngredients = item.product.ingredients || [];
                if (allIngredients.length === 0) return null;

                const selectedNames = new Set(item.customizedIngredients.map(i => i.name));
                const excludedIngredients = allIngredients.filter(i => !selectedNames.has(i));

                const hasCustomization = item.customizedIngredients.length < allIngredients.length;

                if (!hasCustomization) return null;

                return (
                  <div className="text-xs text-gray-600 mt-2 break-words">
                    <p className="font-bold">Personalización:</p>
                    <div className="flex flex-wrap gap-1">
                      {item.customizedIngredients.map(ing => (
                        <span key={ing.name} className="text-green-700 mr-1">{`+${ing.name}`}</span>
                      ))}
                      {excludedIngredients.map(ing => (
                        <span key={ing.name} className="text-red-700 line-through mr-1">{`${ing.name}`}</span>
                      ))}
                    </div>
                  </div>
                )
              })()}

              {/* Render Selected Customization Options */}
              {item.selectedOptions && item.product.customizationOptions && (
                <div className="text-xs text-gray-600 mt-2 break-words">
                  {item.product.customizationOptions.map(group => {
                    const selected = item.selectedOptions?.[group.id];
                    if (!selected || selected.length === 0) return null;

                    return (
                      <div key={group.id} className="mb-1">
                        <span className="font-semibold text-gray-700 mr-1">{group.name}:</span>
                        <span className="flex flex-wrap gap-1 inline-flex">
                          {selected.map((opt, idx) => {
                            const isExtra = idx >= group.includedItems;
                            return (
                              <span key={idx} className={`${isExtra ? 'text-blue-600 font-medium' : 'text-gray-500'} mr-1`}>
                                {isExtra ? `+ ${opt} ($${group.pricePerExtra})` : opt}
                              </span>
                            );
                          })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="flex items-center gap-3 mt-2">
                <button onClick={() => handleUpdateCart(item.id, item.quantity - 1)} className="w-7 h-7 bg-gray-200 rounded-full font-bold">-</button>
                <span className="font-bold w-6 text-center">{item.quantity}</span>
                <button onClick={() => handleUpdateCart(item.id, item.quantity + 1)} className="w-7 h-7 bg-gray-200 rounded-full font-bold">+</button>
              </div>
            </div>
            <div className="flex flex-col items-end ml-2 flex-shrink-0">
              <p className="font-bold text-lg">${calculateItemTotal(item).toFixed(2)}</p>
              {calculateExtrasPerUnit(item) > 0 && (
                <div className="text-[10px] text-gray-500 text-right mt-1 bg-gray-50 p-1 rounded">
                  <p>Unitario: ${item.product.price.toFixed(2)} + ${calculateExtrasPerUnit(item).toFixed(2)}</p>
                  <p className="text-blue-600 font-medium">Extras Total: +${(calculateExtrasPerUnit(item) * item.quantity).toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="space-y-2 mb-3 border-b border-gray-100 pb-3">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Productos</span>
            <span>${productsSubtotal.toFixed(2)}</span>
          </div>
          {extrasSubtotal > 0 && (
            <div className="flex justify-between items-center text-sm text-blue-600">
              <span>Extras</span>
              <span>+${extrasSubtotal.toFixed(2)}</span>
            </div>
          )}
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-800 font-medium">Subtotal</span>
          <span className="font-semibold">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Envío</span>
          <span className="font-semibold">${deliveryFee.toFixed(2)}</span>
        </div>
        {calculatedDistance !== null && (
          <p className="text-xs text-gray-500 text-right mt-1">
            ({calculatedDistance.toFixed(2)} km x ${PRICE_PER_KM.toFixed(2)}/km)
          </p>
        )}
        <hr className="my-3" />
        <div className="flex justify-between items-center font-bold text-xl">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Método de pago</p>
            <p className="font-bold text-gray-800 capitalize">{selectedPaymentMethod.replace(/_/g, ' ')}</p>
          </div>
          <button
            onClick={() => navigate('/payment-methods', { state: { from: '/cart' } })}
            className="font-semibold text-orange-500 text-sm hover:text-orange-600"
          >
            Cambiar
          </button>
        </div>
      </div>

      <button
        onClick={() => setStep('details')}
        disabled={!canProceedToDetails}
        className="w-full py-3 bg-orange-500 text-white font-bold rounded-lg shadow-md hover:bg-orange-600 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Continuar a la Entrega
      </button>
    </div>
  );

  const renderDetailsStep = () => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg space-y-6">
      <h3 className="font-bold text-lg text-gray-800">Datos de Entrega</h3>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
        <div className="relative flex items-center">
          <UserCircleIcon className="absolute left-3 w-5 h-5 text-gray-400" />
          <input type="text" name="name" id="name" value={userDetails.name} onChange={handleInputChange} className="w-full py-3 pl-10 pr-4 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Tu nombre" />
        </div>
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Dirección *</label>
        <div className="flex gap-2">
          <div className="relative flex-grow flex items-center">
            <LocationIcon className="absolute left-3 w-5 h-5 text-gray-400" />
            <input type="text" name="address" id="address" value={userDetails.address} onChange={handleInputChange} className="w-full py-3 pl-10 pr-4 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Calle y número" />
          </div>
          <button
            onClick={handleOpenMap}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors flex items-center gap-1"
          >
            <LocationIcon className="w-4 h-4 text-white" />
            Mapa
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">Tip: Usa el botón de mapa para que el repartidor llegue exacto.</p>
      </div>

      <div>
        <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 mb-1">Barrio / Colonia *</label>
        <input type="text" name="neighborhood" id="neighborhood" value={userDetails.neighborhood} onChange={handleInputChange} className="w-full py-3 px-4 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Tu barrio o colonia" />
      </div>
      <div>
        <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
        <input type="text" name="postalCode" id="postalCode" value={userDetails.postalCode} onChange={handleInputChange} className="w-full py-3 px-4 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Tu código postal" />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Teléfono de Contacto *</label>
        <div className="relative flex items-center">
          <MailIcon className="absolute left-3 w-5 h-5 text-gray-400" />
          <input type="tel" name="phone" id="phone" value={userDetails.phone} onChange={handleInputChange} className="w-full py-3 pl-10 pr-4 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Tu número de WhatsApp" />
        </div>
      </div>
      {calculatedDistance !== null && (
        <div className="bg-blue-50 p-3 rounded-lg text-blue-800 text-sm font-medium flex items-center gap-2">
          <InfoIcon className="w-5 h-5" />
          <span>Distancia estimada: {calculatedDistance.toFixed(2)} km. Costo de envío: ${calculatedDeliveryFee.toFixed(2)}</span>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 pt-4">
        <button onClick={() => setStep('cart')} className="bg-gray-200 text-gray-800 font-bold py-3 rounded-lg">Volver</button>
        <button onClick={() => setStep('confirmation')} disabled={!canProceedToConfirmation} className="bg-orange-500 text-white font-bold py-3 rounded-lg disabled:bg-gray-400">Revisar Pedido</button>
      </div>
    </div>
  );

  const renderConfirmationStep = () => {
    const restaurant = cartItems.length > 0 ? cartItems[0].restaurant : null;
    const restaurantCoords = restaurant?.lat && restaurant?.lng ? { lat: restaurant.lat, lng: restaurant.lng } : null;

    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="p-6 pb-4">
          <h3 className="font-bold text-lg text-gray-800">Resumen del Pedido</h3>
          {restaurant && (
            <div className="mt-4 flex items-center gap-3 p-3 bg-gray-50 rounded-xl border">
              <img src={(restaurant as any).image_url || restaurant.imageUrl} alt={restaurant.name} className="w-12 h-12 rounded-full object-cover" />
              <div>
                <p className="text-sm text-gray-500">Tu pedido de:</p>
                <h4 className="font-bold text-md text-gray-800">{restaurant.name}</h4>
              </div>
            </div>
          )}
        </div>

        {restaurantCoords && userAddressCoords && (() => {
          // Calculate distance between points to determine appropriate zoom
          const distance = haversineDistance(
            restaurantCoords.lat,
            restaurantCoords.lng,
            userAddressCoords.lat,
            userAddressCoords.lng
          );

          // Calculate zoom level based on distance
          // Lower zoom = more area visible, ensures both markers are always shown
          let zoomLevel = 11;
          if (distance < 0.5) zoomLevel = 13;      // Very close (< 500m)
          else if (distance < 1) zoomLevel = 12;   // Close (< 1km)
          else if (distance < 3) zoomLevel = 11;   // Medium (< 3km)
          else if (distance < 5) zoomLevel = 10;   // Far (< 5km)
          else if (distance < 10) zoomLevel = 9;   // Very far (< 10km)
          else zoomLevel = 8;                      // Extremely far (> 10km)

          return (
            <div className="h-40 w-full">
              <Map
                initialViewState={{
                  latitude: (restaurantCoords.lat + userAddressCoords.lat) / 2,
                  longitude: (restaurantCoords.lng + userAddressCoords.lng) / 2,
                  zoom: zoomLevel
                }}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/streets-v11"
                mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
              >
                <Marker longitude={restaurantCoords.lng} latitude={restaurantCoords.lat} color="#00B37E" />
                <Marker longitude={userAddressCoords.lng} latitude={userAddressCoords.lat} color="#FF5A5F" />
              </Map>
            </div>
          );
        })()}

        <div className="p-6 space-y-4">
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <UserCircleIcon className="w-5 h-5 text-orange-500" />
              <p><strong>Nombre:</strong> {userDetails.name}</p>
            </div>
            <div className="flex items-start gap-2">
              <LocationIcon className="w-5 h-5 text-orange-500 mt-1" />
              <p><strong>Dirección:</strong> {userDetails.address}{userDetails.neighborhood ? `, ${userDetails.neighborhood}` : ''}{userDetails.postalCode ? `, C.P. ${userDetails.postalCode}` : ''}</p>
            </div>
            <div className="flex items-center gap-2">
              <MailIcon className="w-5 h-5 text-orange-500" />
              <p><strong>Teléfono:</strong> {userDetails.phone}</p>
            </div>
            <div className="flex items-center gap-2">
              <CreditCardIcon className="w-5 h-5 text-orange-500" />
              <p><strong>Método de Pago:</strong> <span className="font-semibold capitalize">{selectedPaymentMethod.replace(/_/g, ' ')}</span></p>
            </div>
          </div>
          <hr />
          <div className="space-y-3">
            {cartItems.map(item => (
              <div key={item.id} className="flex items-center gap-3">
                {item.product.imageUrl ? (
                  <img src={item.product.imageUrl} alt={item.product.name} className="w-16 h-16 rounded-md object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-md bg-gray-200 flex items-center justify-center text-gray-500 text-xs text-center p-1">
                    No Image
                  </div>
                )}
                <div className="flex-grow">
                  <p className="font-semibold text-gray-800">{item.product.name}</p>
                  <p className="text-sm text-gray-500">{item.quantity} x ${item.product.price.toFixed(2)}</p>
                </div>
                <p className="font-bold text-md">${(item.product.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <hr />
          <div>
            <div className="flex justify-between items-center"><p>Subtotal:</p> <p>${subtotal.toFixed(2)}</p></div>
            <div className="flex justify-between items-center"><p>Envío:</p> <p>${deliveryFee.toFixed(2)}</p></div>
            {calculatedDistance !== null && (
              <p className="text-xs text-gray-500 text-right mt-1">
                ({calculatedDistance.toFixed(2)} km x ${PRICE_PER_KM.toFixed(2)}/km)
              </p>
            )}
            <div className="flex justify-between items-center font-bold text-lg mt-2"><p>Total:</p> <p>${total.toFixed(2)}</p></div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <button onClick={() => setStep('details')} className="bg-gray-200 text-gray-800 font-bold py-3 rounded-lg">Volver</button>
            <button
              onClick={handleFinalOrderConfirmation}
              disabled={!canProceedToConfirmation || isConfirming}
              className="bg-green-500 text-white font-bold py-3 rounded-lg disabled:bg-gray-400 flex justify-center items-center gap-2 transition-all"
            >
              {isConfirming ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Procesando...</span>
                </>
              ) : (
                'Confirmar Pedido'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };



  const handleFinishOrder = () => {
    localStorage.removeItem('active_order_id');
    setCurrentOrderId(null);
    setStep('cart');
    // Optionally clear cart here if needed, but user might want to order again
    // handleUpdateCart(itemId, 0) for all items? 
    // For now, just exiting the tracker is enough.
  };

  return (
    <div className="p-4 bg-gray-50 min-h-full">
      <div className="flex items-center gap-4 mb-6">
        {step === 'cart' && (
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white shadow-sm">
            <ChevronLeftIcon className="w-6 h-6 text-gray-800" />
          </button>
        )}
        {step !== 'success' && (
          <h1 className="text-xl font-bold text-gray-800">{step === 'cart' ? 'Mi Carrito' : 'Checkout'}</h1>
        )}
      </div>

      {cartItems.length === 0 && step !== 'success' ? (
        <div className="text-center py-20">
          <p className="mt-4 text-gray-500">Tu carrito está vacío.</p>
          <button
            onClick={() => navigate('/restaurants')}
            className="mt-6 px-6 py-2 bg-orange-500 text-white font-semibold rounded-full shadow-md hover:bg-orange-600 transition-all"
          >
            Ver Restaurantes
          </button>
        </div>
      ) : (
        <div className={`flex flex-col ${step === 'success' ? 'h-[85vh]' : ''}`}>
          {step !== 'success' && <Stepper currentStep={step} />}
          <AnimatePresence mode="wait">
            {step === 'cart' && (
              <motion.div
                key="cart"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {renderCartStep()}
              </motion.div>
            )}
            {step === 'details' && (
              <motion.div
                key="details"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {renderDetailsStep()}
              </motion.div>
            )}
            {step === 'confirmation' && (
              <motion.div
                key="confirmation"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {renderConfirmationStep()}
              </motion.div>
            )}
            {step === 'success' && currentOrderId && (
              <motion.div
                key="success"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <OrderTracker orderId={currentOrderId} onFinish={handleFinishOrder} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {showMapPicker && (
          <LocationPickerMapModal
            isOpen={showMapPicker}
            onClose={() => {
              setShowMapPicker(false);
              setBottomNavVisible(true);
              setTimeout(() => { isPickingLocation.current = false; }, 800);
            }}
            onConfirm={handleConfirmLocation}
            initialLocation={userAddressCoords || undefined}
            title="Selecciona Ubicación de Entrega"
          />
        )}
      </AnimatePresence>

      {toastInfo && <Toast message={toastInfo.message} type={toastInfo.type} onClose={() => setToastInfo(null)} />}
    </div>
  );
};
