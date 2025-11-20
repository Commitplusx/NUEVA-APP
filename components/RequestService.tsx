
import { ScheduleModal } from './ScheduleModal';
import { SubmittedStep } from './SubmittedStep';
import { ConfirmationStep } from './ConfirmationStep';
import { PriceSkeleton } from './PriceSkeleton';
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import * as Icons from './icons';
import { ServiceRequest, Profile } from '../types';
import { createServiceRequest, getProfile, geocodeAddress } from '../services/api';
import { useAppContext } from '../context/AppContext';
import { useThemeColor } from '../hooks/useThemeColor';
import { Spinner } from './Spinner';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleMap, MarkerF } from '@react-google-maps/api';
import { LocationPickerMapModal } from './LocationPickerMapModal';
import Lottie from 'lottie-react';
import deliveryAnimation from './animations/delivery-animation.json';
import { Stepper, Step } from './Stepper';
import { useServiceLocationPicker } from '../hooks/useServiceLocationPicker';
import { Capacitor } from '@capacitor/core';
import * as api from '../services/api';

// --- Helper Functions ---

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

const getNext7Days = () => {
  const days: Date[] = [];
  const today = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + i);
    days.push(nextDay);
  }
  return days;
};

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour < 22; hour++) {
    slots.push(`${String(hour).padStart(2, '0')}:00`);
    slots.push(`${String(hour).padStart(2, '0')}:30`);
  }
  return slots;
};

// --- Pricing Constants ---
const PRICE_PER_KM = 10; // $10 per km

// --- Components ---

export const RequestService: React.FC = () => {
  useThemeColor('var(--color-rappi-primary)');
  const { showToast, baseFee, userRole, isMapsLoaded: isLoaded, loadError, setBottomNavVisible, destinationCoords, setDestinationCoords } = useAppContext();
  const navigate = useNavigate();
  const [isCalculating, setIsCalculating] = useState(false);
  const [step, setStep] = useState<Step>('details');
  const [description, setDescription] = useState<string>('');
  const [distance, setDistance] = useState<number | null>(null);
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [confirmedSchedule, setConfirmedSchedule] = useState<{ date: Date, time: string } | null>(null);
  const [newRequestId, setNewRequestId] = useState<string | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const {
    origin, setOrigin,
    destination, setDestination,
    originCoords, setOriginCoords,
    showOriginMapPicker, setShowOriginMapPicker,
    showDestinationMapPicker, setShowDestinationMapPicker,
    initialOriginLocation, setInitialOriginLocation,
    initialDestinationLocation, setInitialDestinationLocation,
    handleUseProfileAddress,
    handleGetCurrentLocation,
    handleMapPick,
    handleConfirmOrigin,
    handleConfirmDestination,
  } = useServiceLocationPicker({ userProfile, showToast, setBottomNavVisible, setDestinationCoords });

  useEffect(() => {
    if (destinationCoords) {
      handleConfirmDestination(destination, destinationCoords.lat, destinationCoords.lng);
    }
  }, []);

  const mapRef = useRef<google.maps.Map | null>(null);

  const weekDays = useMemo(() => getNext7Days(), []);
  const timeSlots = useMemo(() => generateTimeSlots(), []);

  // --- Effects ---

  useEffect(() => {
    if (userRole === 'guest') {
      showToast('Por favor, inicie sesión para usar este servicio.', 'info');
      return;
    }
    const fetchProfile = async () => {
      try {
        const profile = await getProfile();
        if (profile) {
          setUserProfile(profile);
        }
      } catch (error) {
        showToast('No se pudo cargar tu perfil.', 'error');
      }
    };
    if (userRole === 'user' || userRole === 'admin') {
      fetchProfile();
    }
  }, [userRole, showToast]);

  useEffect(() => {
    const calculateAndDisplayRoute = async () => {
      if (originCoords && destinationCoords) {
        setIsCalculating(true);
        const isNative = Capacitor.isNativePlatform();
        let calculatedDistance: number | null = null;

        if (isNative) {
          calculatedDistance = await api.calculateAndShowNativeRoute(
            { latitude: originCoords.lat, longitude: originCoords.lng },
            { latitude: destinationCoords.lat, longitude: destinationCoords.lng }
          );
        } else {
          calculatedDistance = haversineDistance(originCoords.lat, originCoords.lng, destinationCoords.lat, destinationCoords.lng);
        }

        if (calculatedDistance !== null) {
          const cost = baseFee + calculatedDistance * PRICE_PER_KM;
          setDistance(calculatedDistance);
          setShippingCost(cost);
        } else {
          showToast('No se pudo calcular la ruta.', 'error');
          setDistance(null);
          setShippingCost(null);
        }
        setIsCalculating(false);
      } else {
        setDistance(null);
        setShippingCost(null);
      }
    };
    calculateAndDisplayRoute();
  }, [originCoords, destinationCoords, baseFee, showToast]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (originCoords && destinationCoords) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(originCoords);
      bounds.extend(destinationCoords);
      mapRef.current.fitBounds(bounds);
    } else if (originCoords) {
      mapRef.current.panTo(originCoords);
      mapRef.current.setZoom(14);
    } else if (destinationCoords) {
      mapRef.current.panTo(destinationCoords);
      mapRef.current.setZoom(14);
    }
  }, [originCoords, destinationCoords]);

  // --- Handlers ---

  // --- Handlers ---

  const handleProceedToConfirmation = () => {
    if (!origin || !destination || !description) {
      showToast('Por favor, completa todos los campos.', 'error');
      return;
    }
    if (!shippingCost) {
      showToast('Espera a que se calcule el precio del envío.', 'error');
      return;
    }
    setStep('confirmation');
  };

  const handleSubmit = async () => {
    if (!origin || !destination || !description || !shippingCost || !userProfile?.user_id) {
      showToast('Faltan datos para crear la solicitud.', 'error');
      return;
    }
    setIsCalculating(true);
    try {
      let scheduledAt = null;
      if (confirmedSchedule) {
        const date = confirmedSchedule.date.toISOString().split('T')[0];
        scheduledAt = `${date}T${confirmedSchedule.time}:00`;
      }
      const newServiceRequest: ServiceRequest = {
        origin,
        destination,
        description,
        price: shippingCost,
        distance: distance || 0,
        user_id: userProfile.user_id,
        scheduled_at: scheduledAt,
        status: 'pending',
        phone: userProfile.phone || undefined,
        origin_lat: originCoords?.lat,
        origin_lng: originCoords?.lng,
        destination_lat: destinationCoords?.lat,
        destination_lng: destinationCoords?.lng,
      };
      const createdRequest = await createServiceRequest(newServiceRequest);
      setNewRequestId(createdRequest.id?.toString() || null);
      setStep('submitted');
      showToast('Solicitud de servicio creada con éxito.', 'success');
    } catch (error) {
      console.error("Error creating service request:", error);
      showToast('Error al crear la solicitud de servicio.', 'error');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleScheduleSubmit = (date: Date, time: string) => {
    setConfirmedSchedule({ date, time });
    setShowScheduleModal(false);
  };

  const handleScheduleCancel = () => {
    setShowScheduleModal(false);
  };

  const getFormattedScheduledDate = () => {
    if (!confirmedSchedule) return '';
    return confirmedSchedule.date.toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  const whatsappNumber = '14155238886';
  const whatsappMessage = encodeURIComponent('Hola, necesito ayuda con mi servicio.');
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  // --- Render Logic ---

  const mapContainerStyle = { width: '100%', height: '100%' };
  const defaultCenter = { lat: 16.25, lng: -92.13 };
  const mapOptions = { disableDefaultUI: true, zoomControl: true, styles: [] };

  if (step === 'submitted') {
    return <SubmittedStep newRequestId={newRequestId} whatsappNumber={whatsappNumber} />;
  }

  if (step === 'confirmation') {
    return (
      <ConfirmationStep
        origin={origin}
        destination={destination}
        description={description}
        shippingCost={shippingCost!}
        distance={distance}
        confirmedSchedule={confirmedSchedule}
        getFormattedScheduledDate={getFormattedScheduledDate}
        onModify={() => setStep('details')}
        onConfirm={handleSubmit}
      />
    );
  }

  return (
    <div className="p-4 space-y-5">
      <section>
        <h1 className="text-2xl font-bold text-center mb-4">Crea tu Solicitud de Envío</h1>
        <Stepper currentStep={step} />
      </section>

      <section className="bg-white p-4 rounded-lg">
        <h3 className="font-bold text-lg text-gray-800 mb-2">Detalles del Envío</h3>
        <div>
            <div className="relative flex items-center bg-gray-100 rounded-md">
                <Icons.LocationIcon className="absolute left-3 w-5 h-5 text-[var(--color-rappi-success)]" />
                <p className="flex-grow py-2 px-3 pl-10 text-gray-800 truncate">{origin || 'Selecciona tu dirección de origen'}</p>
                <button
                  onClick={() => handleMapPick('origin')}
                  className="flex-shrink-0 bg-black text-white text-sm font-bold py-2.5 px-4 rounded-r-lg hover:bg-gray-800 transition-colors shadow-md flex items-center justify-center gap-1"
                >
                  <Icons.MapIcon className="w-4 h-4" />
                  Mapa
                </button>
            </div>
            {userProfile?.street_address && (
              <button
                onClick={handleUseProfileAddress}
                className="text-xs font-medium underline text-green-600 hover:text-green-800 ml-1 mt-1"
              >
                  Usar mi dirección guardada
              </button>
            )}
            <button
                onClick={handleGetCurrentLocation}
                className="text-xs font-medium underline text-green-600 hover:text-green-800 ml-1 mt-1"
              >
                  Usar mi ubicación actual
              </button>
        </div>

        <div className="flex items-center justify-center py-1">
            <div className="flex-grow border-t border-dashed border-gray-300"></div>
            <Icons.ChevronDownIcon className="w-5 h-5 text-gray-400 mx-2 flex-shrink-0" />
            <div className="flex-grow border-t border-dashed border-gray-300"></div>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destino</label>
            <div className="relative flex items-center bg-gray-100 rounded-md">
                <Icons.LocationIcon className="absolute left-3 w-5 h-5 text-[var(--color-rappi-danger)]" />
                <p className="flex-grow py-2 px-3 pl-10 text-gray-800 truncate">{destination || 'Selecciona tu dirección de destino'}</p>
                <button
                  onClick={() => handleMapPick('destination')}
                  className="flex-shrink-0 bg-black text-white text-sm font-bold py-2.5 px-4 rounded-r-lg hover:bg-gray-800 transition-colors shadow-md flex items-center justify-center gap-1"
                >
                  <Icons.MapIcon className="w-4 h-4" />
                  Mapa
                </button>
            </div>
             {!origin && <p className="text-xs text-[var(--color-rappi-danger)] mt-1">Debes configurar una dirección de origen en tu perfil primero.</p>}
        </div>
      </section>

      <section className="bg-white p-4 rounded-lg">
        {isCalculating ? (
            <PriceSkeleton />
        ) : shippingCost ? (
            <>
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <p className="text-3xl font-bold text-gray-800">${shippingCost.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Distancia aproximada: {distance?.toFixed(2)} km</p>
                </motion.div>
                  <motion.div
                    className="mt-4 h-64 w-full rounded-lg overflow-hidden shadow-md"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {isLoaded ? (
                      <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={defaultCenter}
                        zoom={13}
                        options={mapOptions}
                        onLoad={(map) => { mapRef.current = map; }}
                      >
                        {originCoords && <MarkerF position={originCoords} />}
                        {destinationCoords && <MarkerF position={destinationCoords} />}
                      </GoogleMap>
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gray-200">
                        <Spinner />
                      </div>
                    )}
                  </motion.div>
            </>
        ) : (
            <p className="text-sm text-gray-500">Introduce una dirección de destino para calcular el costo.</p>
        )}
      </section>

      <section className="bg-white p-4 rounded-lg">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descripción del paquete o mandado</label>
        <textarea 
          id="description" 
          placeholder="Ej: Paquete pequeño, documentos importantes, etc."
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          className="w-full py-2 px-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 h-24 resize-none"
        ></textarea>
      </section>

      <div className="border-t border-gray-200 pt-5">
        <section className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
              <p className="text-sm font-semibold text-gray-700">¿Quieres programar la recogida?</p>
              <button onClick={() => setShowScheduleModal(true)} className="bg-black text-white text-xs font-bold py-2 px-4 rounded-full hover:bg-gray-800 transition-colors">
                PROGRAMAR
              </button>
            </div>
            {confirmedSchedule && (
              <div className="text-center p-3 bg-green-100 text-green-800 rounded-lg text-sm font-semibold border border-green-200">
                <p>Recogida programada: <strong>{getFormattedScheduledDate()} a las {confirmedSchedule.time} hrs.</strong></p>
              </div>
            )}
            <button
              onClick={handleProceedToConfirmation}
              disabled={!shippingCost || isCalculating}
              className="bg-black text-white w-full py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors shadow-lg flex items-center justify-center gap-2 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              Continuar
              <Icons.ArrowRightIcon className="w-5 h-5" />
            </button>
          </section>
      </div>
      
      <div className="text-center pt-4">
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-700 font-semibold flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Icons.WrenchIcon className="w-4 h-4"/>
          Contactar a Soporte
        </a>
      </div>

      <ScheduleModal
        isOpen={showScheduleModal}
        onClose={handleScheduleCancel}
        onSubmit={handleScheduleSubmit}
        weekDays={weekDays}
        timeSlots={timeSlots}
      />

      <AnimatePresence>
        {showOriginMapPicker && (
          <LocationPickerMapModal
            isOpen={showOriginMapPicker}
            onClose={() => {
              setShowOriginMapPicker(false);
              setBottomNavVisible(true);
            }}
            onConfirm={handleConfirmOrigin}
            initialLocation={initialOriginLocation}
            title="Seleccionar Origen"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDestinationMapPicker && (
          <LocationPickerMapModal
            isOpen={showDestinationMapPicker}
            onClose={() => {
              setShowDestinationMapPicker(false);
              setBottomNavVisible(true);
            }}
            onConfirm={handleConfirmDestination}
            initialLocation={initialDestinationLocation}
            title="Seleccionar Destino"
          />
        )}
      </AnimatePresence>
    </div>
  );
};
