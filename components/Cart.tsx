import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, UserCircleIcon, LocationIcon, InfoIcon, MailIcon } from './icons';
import { geocodeAddress } from '../services/api';
import { useAppContext } from '../context/AppContext';
import { useThemeColor } from '../hooks/useThemeColor';
import { OrderUserDetails } from '../types';
import { Toast, ToastType } from './Toast';
import { AnimatePresence, motion } from 'framer-motion';
import { GoogleMap, MarkerF } from '@react-google-maps/api';
import Lottie from 'lottie-react';
import orderingAnimation from './animations/ordering-animation.json';
import deliveryAnimation from './animations/delivery-animation.json';
import foodAnimation from './animations/food-animation.json';
import deliveryManAnimation from './animations/delivery-man-animation.json';

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
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors duration-300 ${
                index <= currentStepIndex ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {index < currentStepIndex ? <ChevronLeftIcon className="w-6 h-6 rotate-180" /> : index + 1}
            </div>
            <p
              className={`mt-2 text-xs font-bold transition-colors duration-300 ${
                index <= currentStepIndex ? 'text-orange-500' : 'text-gray-500'
              }`}
            >
              {getStepName(step)}
            </p>
          </div>
          {index < steps.length - 1 && (
            <div className={`flex-auto border-t-2 transition-colors duration-300 mx-2 ${
              index < currentStepIndex ? 'border-orange-500' : 'border-gray-200'
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
    isMapsLoaded,
    user,
    profile
  } = useAppContext();
  const navigate = useNavigate();
  const [step, setStep] = useState<CartStep>('cart');
  const [userAddressCoords, setUserAddressCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [calculatedDistance, setCalculatedDistance] = useState<number | null>(null);
  const [calculatedDeliveryFee, setCalculatedDeliveryFee] = useState<number>(0);

  // State for user details form
  const [userDetails, setUserDetails] = useState<OrderUserDetails>({
    name: '',
    address: '',
    postalCode: '',
    neighborhood: '',
    phone: ''
  });
  const [toastInfo, setToastInfo] = useState<{ message: string; type: ToastType } | null>(null);

  useEffect(() => {
    if (user && profile) {
      setUserDetails(prev => ({
        ...prev,
        name: profile.full_name || prev.name,
        address: profile.street_address || prev.address,
        neighborhood: profile.neighborhood || prev.neighborhood,
        postalCode: profile.postal_code || prev.postalCode,
        phone: profile.phone || prev.phone,
      }));
    }
  }, [user, profile]);

  // Debounced geocoding for user address
  useEffect(() => {
    if (!userDetails.address) {
      setUserAddressCoords(null);
      return;
    }
    const handler = setTimeout(async () => {
      try {
        const coords = await geocodeAddress(userDetails.address);
        setUserAddressCoords(coords);
      } catch (error) {
        console.error("Error geocoding address:", error);
        setUserAddressCoords(null);
      }
    }, 1000);
    return () => clearTimeout(handler);
  }, [userDetails.address]);

  // Calculate distance and price whenever coordinates change
  useEffect(() => {
    const restaurant = cartItems[0]?.restaurant;
    if (userAddressCoords && restaurant?.lat && restaurant?.lng) {
      const dist = haversineDistance(restaurant.lat, restaurant.lng, userAddressCoords.lat, userAddressCoords.lng);
      const fee = dist * PRICE_PER_KM;
      setCalculatedDistance(dist);
      setCalculatedDeliveryFee(fee);
    } else {
      setCalculatedDistance(null);
      setCalculatedDeliveryFee(0);
    }
  }, [userAddressCoords, cartItems]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserDetails(prev => ({ ...prev, [name]: value }));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const restaurant = cartItems.length > 0 ? cartItems[0].restaurant : null;
  const deliveryFee = calculatedDeliveryFee;
  const total = subtotal + deliveryFee;

  console.log("Debug canProceedToConfirmation:");
  console.log("  user:", user);
  console.log("  userDetails.name:", userDetails.name);
  console.log("  userDetails.address:", userDetails.address);
  console.log("  userDetails.phone:", userDetails.phone);
  console.log("  userDetails.name.trim() !== '':", userDetails.name.trim() !== '');
  console.log("  userDetails.address.trim() !== '':", userDetails.address.trim() !== '');
  console.log("  userDetails.phone.trim().length >= 10:", userDetails.phone.trim().length >= 10);

  const canProceedToDetails = cartItems.length > 0;
  const canProceedToConfirmation = 
    user !== null && // Add this check
    userDetails.name.trim() !== '' &&
    userDetails.address.trim() !== '' &&
    userDetails.phone.trim().length >= 10;

  const handleFinalOrderConfirmation = async () => {
    if (!canProceedToConfirmation) {
      setToastInfo({ message: 'Por favor, completa todos los campos requeridos.', type: 'info' });
      setTimeout(() => setToastInfo(null), 3000); // Ocultar después de 3 segundos
      return;
    }
    try {
      await handleConfirmOrder(userDetails, deliveryFee);
      setStep('success'); // Set to success step after successful order
    } catch (error) {
      console.error('Order confirmation failed:', error);
      setToastInfo({ message: 'Error al confirmar el pedido. Inténtalo de nuevo.', type: 'error' });
      setTimeout(() => setToastInfo(null), 3000);
    }
  };

  const renderCartStep = () => (
    <div>
      <div className="space-y-4 mb-6">
        {cartItems.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4">
            {item.product.imageUrl ? (
              <img src={item.product.imageUrl} alt={item.product.name} className="w-20 h-20 rounded-md object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-md bg-gray-200 flex items-center justify-center text-gray-500 text-xs text-center p-2">
                No Image
              </div>
            )}
            <div className="flex-grow">
              <h3 className="font-semibold text-gray-800">{item.product.name}</h3>
              <p className="text-sm text-gray-500">${item.product.price.toFixed(2)}</p>
              {(() => {
                const allIngredients = item.product.ingredients || [];
                if (allIngredients.length === 0) return null;

                const selectedNames = new Set(item.customizedIngredients.map(i => i.name));
                const excludedIngredients = allIngredients.filter(i => !selectedNames.has(i));

                // Only show customizations if something was actually removed
                const hasCustomization = item.customizedIngredients.length < allIngredients.length;

                if (!hasCustomization) return null;

                return (
                  <div className="text-xs text-gray-600 mt-2">
                    <p className="font-bold">Personalización:</p>
                    {item.customizedIngredients.map(ing => (
                      <span key={ing.name} className="mr-2 text-green-700">{`+${ing.name}`}</span>
                    ))}
                    {excludedIngredients.map(ing => (
                      <span key={ing} className="mr-2 text-red-700 line-through">{`${ing}`}</span>
                    ))}
                  </div>
                )
              })()}
              <div className="flex items-center gap-3 mt-2">
                <button onClick={() => handleUpdateCart(item.id, item.quantity - 1)} className="w-7 h-7 bg-gray-200 rounded-full font-bold">-</button>
                <span className="font-bold w-6 text-center">{item.quantity}</span>
                <button onClick={() => handleUpdateCart(item.id, item.quantity + 1)} className="w-7 h-7 bg-gray-200 rounded-full font-bold">+</button>
              </div>
            </div>
            <p className="font-bold text-lg">${(item.product.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Subtotal</span>
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
          <div className="relative flex items-center">
              <LocationIcon className="absolute left-3 w-5 h-5 text-gray-400" />
              <input type="text" name="address" id="address" value={userDetails.address} onChange={handleInputChange} className="w-full py-3 pl-10 pr-4 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Calle y número" />
          </div>
      </div>
      <div>
          <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 mb-1">Barrio / Colonia</label>
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

    const comitanBounds = {
      north: 16.35,
      south: 16.15,
      west: -92.25,
      east: -92.00,
    };

    const mapOptions = {
      disableDefaultUI: true,
      styles: [
        { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
        { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
        { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] },
      ],
      restriction: {
        latLngBounds: comitanBounds,
        strictBounds: false,
      },
    };

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

            {isMapsLoaded && restaurantCoords && userAddressCoords && (
              <div className="h-40 w-full">
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  options={mapOptions}
                  onLoad={(map) => {
                    const bounds = new window.google.maps.LatLngBounds();
                    bounds.extend(restaurantCoords);
                    bounds.extend(userAddressCoords);
                    map.fitBounds(bounds);

                    const listener = window.google.maps.event.addListener(map, 'idle', () => {
                      if (map.getZoom() > 16) map.setZoom(16);
                      window.google.maps.event.removeListener(listener);
                    });
                  }}
                >
                  <MarkerF position={restaurantCoords} animation={window.google.maps.Animation.DROP} />
                  <MarkerF position={userAddressCoords} animation={window.google.maps.Animation.DROP} />
                </GoogleMap>
              </div>
            )}

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
              </div>
              <hr/>
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
              <hr/>
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
                  <button onClick={handleFinalOrderConfirmation} disabled={!canProceedToConfirmation} className="bg-green-500 text-white font-bold py-3 rounded-lg disabled:bg-gray-400">Confirmar Pedido</button>
              </div>
            </div>
        </div>
    );
  };

  const renderSuccessStep = () => (
    <div className="flex flex-col items-center justify-center bg-white p-6 rounded-xl border border-gray-200 shadow-lg text-center">
      <Lottie animationData={orderingAnimation} loop={false} style={{ width: 200, height: 200 }} />
      <h3 className="font-bold text-2xl text-green-600 mt-4">¡Pedido Recibido!</h3>
      <p className="text-gray-600 mt-2">Tu pedido ha sido enviado con éxito y está siendo procesado.</p>
      <button 
        onClick={() => navigate('/restaurants')} 
        className="mt-6 px-6 py-3 bg-orange-500 text-white font-semibold rounded-full shadow-md hover:bg-orange-600 transition-all"
      >
        Volver a Restaurantes
      </button>
    </div>
  );

  return (
    <div className="p-4 bg-gray-50 min-h-full">
      <div className="flex items-center gap-4 mb-6">
        {step === 'cart' && (
            <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white shadow-sm">
                <ChevronLeftIcon className="w-6 h-6 text-gray-800" />
            </button>
        )}
        <h1 className="text-xl font-bold text-gray-800">{step === 'cart' ? 'Mi Carrito' : 'Checkout'}</h1>
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
        <div>
            <Stepper currentStep={step} />
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
              {step === 'success' && (
                <motion.div
                  key="success"
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderSuccessStep()}
                </motion.div>
              )}
            </AnimatePresence>
        </div>
      )}
      {toastInfo && <Toast message={toastInfo.message} type={toastInfo.type} onClose={() => setToastInfo(null)} />}
    </div>
  );
};


