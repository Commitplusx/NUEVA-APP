
import { ScheduleModal } from './ScheduleModal';
import { SubmittedStep } from './SubmittedStep';
import { ConfirmationStep } from './ConfirmationStep';
import { PriceSkeleton } from './PriceSkeleton';
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import * as Icons from './icons';
import { ServiceRequest, Profile } from '../types';
import { createServiceRequest, getProfile } from '../services/api';
import { useAppContext } from '../context/AppContext';
import { useThemeColor } from '../hooks/useThemeColor';
import { Spinner } from './Spinner';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LocationPickerMapModal } from './LocationPickerMapModal';
import { Stepper } from './Stepper';
import { useServiceLocationPicker } from '../hooks/useServiceLocationPicker';
import { Capacitor } from '@capacitor/core';
import * as api from '../services/api';
import Map, { Marker, ViewState, MapRef, Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

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
const PRICE_PER_KM = 5;

interface NativeMapPlugin {
  calculateRoute(options: { origin: { lat: number, lng: number }, destination: { lat: number, lng: number } }): Promise<{ distance: number, geometry: any }>;
}

export const RequestService: React.FC = () => {
  useThemeColor('var(--color-rappi-primary)');
  const { showToast, baseFee, userRole, setBottomNavVisible, profile } = useAppContext(); // Get profile from context
  const [isCalculating, setIsCalculating] = useState(false);
  const [step, setStep] = useState<'details' | 'confirmation' | 'submitted'>('details');
  const [description, setDescription] = useState<string>('');
  const [distance, setDistance] = useState<number | null>(null);
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  // const [userProfile, setUserProfile] = useState<Profile | null>(null); // Remove local state
  const [confirmedSchedule, setConfirmedSchedule] = useState<{ date: Date, time: string } | null>(null);
  const [newRequestId, setNewRequestId] = useState<string | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [routeGeoJSON, setRouteGeoJSON] = useState<any>(null);
  const mapRef = useRef<MapRef | null>(null);

  const { origin, destination, originCoords, destinationCoords, showOriginMapPicker, setShowOriginMapPicker, showDestinationMapPicker, setShowDestinationMapPicker, initialOriginLocation, initialDestinationLocation, handleUseProfileAddress, handleGetCurrentLocation, handleMapPick, handleConfirmOrigin, handleConfirmDestination, } = useServiceLocationPicker({ userProfile: profile, showToast, setBottomNavVisible }); // Use profile from context

  const weekDays = useMemo(() => getNext7Days(), []);
  const timeSlots = useMemo(() => generateTimeSlots(), []);

  useEffect(() => {
    if (userRole === 'guest') {
      showToast('Por favor, inicie sesión para usar este servicio.', 'info');
      return;
    }
    // Remove local fetch
  }, [userRole, showToast]);

  useEffect(() => {
    const calculateAndDisplayRoute = async () => {
      if (originCoords && destinationCoords) {
        setIsCalculating(true);
        try {
          let dist = 0;
          let geometry = null;

          if (Capacitor.isNativePlatform()) {
            const NativeMap = ((Capacitor as any).Plugins.NativeMap as NativeMapPlugin);
            const result = await NativeMap.calculateRoute({
              origin: { lat: originCoords.lat, lng: originCoords.lng },
              destination: { lat: destinationCoords.lat, lng: destinationCoords.lng }
            });
            dist = result.distance;
            geometry = result.geometry;
          } else {
            // Web implementation using Mapbox API directly
            const query = await fetch(
              `https://api.mapbox.com/directions/v5/mapbox/driving/${originCoords.lng},${originCoords.lat};${destinationCoords.lng},${destinationCoords.lat}?geometries=geojson&overview=full&access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`
            );
            const json = await query.json();
            if (json.routes && json.routes.length > 0) {
              dist = json.routes[0].distance / 1000;
              geometry = json.routes[0].geometry;
            }
          }

          if (dist > 0) {
            const cost = baseFee + dist * PRICE_PER_KM;
            setDistance(dist);
            setShippingCost(cost);
            setRouteGeoJSON(geometry);
          } else {
            setDistance(null);
            setShippingCost(null);
            setRouteGeoJSON(null);
          }
        } catch (error) {
          console.error("Error calculating route:", error);
          setDistance(null);
          setShippingCost(null);
          setRouteGeoJSON(null);
        } finally {
          setIsCalculating(false);
        }
      } else {
        setDistance(null);
        setShippingCost(null);
        setRouteGeoJSON(null);
      }
    };
    calculateAndDisplayRoute();
  }, [originCoords, destinationCoords, baseFee]);

  const fitMapToBounds = () => {
    try {
      if (mapRef.current && originCoords && destinationCoords) {
        const minLng = Math.min(originCoords.lng, destinationCoords.lng);
        const minLat = Math.min(originCoords.lat, destinationCoords.lat);
        const maxLng = Math.max(originCoords.lng, destinationCoords.lng);
        const maxLat = Math.max(originCoords.lat, destinationCoords.lat);

        mapRef.current.fitBounds(
          [
            [minLng, minLat],
            [maxLng, maxLat]
          ],
          { padding: 80, duration: 1000 }
        );
      }
    } catch (error) {
      console.error("Error fitting map bounds:", error);
    }
  };

  useEffect(() => {
    if (originCoords && destinationCoords) {
      setTimeout(fitMapToBounds, 500);
    }
  }, [originCoords, destinationCoords]);

  const handleScheduleSubmit = (date: Date, time: string) => {
    setConfirmedSchedule({ date, time });
    setShowScheduleModal(false);
  };

  const handleScheduleCancel = () => {
    setShowScheduleModal(false);
  };

  const handleProceedToConfirmation = () => {
    if (!origin || !destination || !description || !shippingCost) {
      showToast('Por favor, completa todos los campos.', 'error');
      return;
    }
    setStep('confirmation');
  };

  const handleSubmit = async () => {
    if (!origin || !destination || !description || !shippingCost || !profile?.user_id) { // Use profile
      showToast('Faltan datos para crear la solicitud.', 'error');
      return;
    }
    setIsCalculating(true);
    try {
      const newServiceRequest = {
        origin, destination, description, price: shippingCost, distance: distance || 0, user_id: profile.user_id, status: 'pending', phone: profile.phone || undefined, origin_lat: originCoords?.lat, origin_lng: originCoords?.lng, destination_lat: destinationCoords?.lat, destination_lng: destinationCoords?.lng, // Use profile
        scheduled_at: confirmedSchedule ? `${confirmedSchedule.date.toISOString().split('T')[0]}T${confirmedSchedule.time}:00` : null,
      };
      const createdRequest = await createServiceRequest(newServiceRequest as ServiceRequest);
      setNewRequestId(createdRequest.id?.toString() || null);
      setStep('submitted');
      showToast('Solicitud de servicio creada con éxito.', 'success');
    } catch (error) {
      showToast('Error al crear la solicitud de servicio.', 'error');
    } finally {
      setIsCalculating(false);
    }
  };

  const getFormattedScheduledDate = () => confirmedSchedule ? confirmedSchedule.date.toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' }) : '';

  if (step === 'submitted') return <SubmittedStep newRequestId={newRequestId} whatsappNumber="14155238886" />;
  if (step === 'confirmation') return <ConfirmationStep origin={origin} destination={destination} description={description} shippingCost={shippingCost!} distance={distance} confirmedSchedule={confirmedSchedule} getFormattedScheduledDate={getFormattedScheduledDate} onModify={() => setStep('details')} onConfirm={handleSubmit} />;

  return (
    <div className="p-4 space-y-5">
      <section>
        <h1 className="text-2xl font-bold text-center mb-4">Crea tu Solicitud de Envío</h1>
        <Stepper currentStep={step} />
      </section>

      <section className="bg-white p-4 rounded-lg">
        <h3 className="font-bold text-lg text-gray-800 mb-2">Detalles del Envío</h3>
        {/* Inputs para Origen y Destino */}
        <div>
          <div className="relative flex items-center bg-gray-100 rounded-md">
            <Icons.LocationIcon className="absolute left-3 w-5 h-5 text-[var(--color-rappi-success)]" />
            <p className="flex-grow py-2 px-3 pl-10 text-gray-800 truncate">{origin || 'Selecciona tu dirección de origen'}</p>
            <button onClick={() => handleMapPick('origin')} className="flex-shrink-0 bg-black text-white text-sm font-bold py-2.5 px-4 rounded-r-lg"><Icons.MapIcon className="w-4 h-4" />Mapa</button>
          </div>
          {profile?.street_address && <button onClick={handleUseProfileAddress} className="text-xs font-medium underline text-green-600">Usar mi dirección guardada</button>}
          <button onClick={handleGetCurrentLocation} className="text-xs font-medium underline text-green-600 ml-2">Usar mi ubicación actual</button>
        </div>
        <div className="flex items-center justify-center py-1"><div className="flex-grow border-t border-dashed border-gray-300"></div><Icons.ChevronDownIcon className="w-5 h-5 text-gray-400 mx-2" /><div className="flex-grow border-t border-dashed border-gray-300"></div></div>
        <div>
          <div className="relative flex items-center bg-gray-100 rounded-md">
            <Icons.LocationIcon className="absolute left-3 w-5 h-5 text-[var(--color-rappi-danger)]" />
            <p className="flex-grow py-2 px-3 pl-10 text-gray-800 truncate">{destination || 'Selecciona tu dirección de destino'}</p>
            <button onClick={() => handleMapPick('destination')} className="flex-shrink-0 bg-black text-white text-sm font-bold py-2.5 px-4 rounded-r-lg"><Icons.MapIcon className="w-4 h-4" />Mapa</button>
          </div>
        </div>
      </section>

      <section className="bg-white p-4 rounded-lg">
        {isCalculating ? <PriceSkeleton /> : shippingCost ? (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><p className="text-3xl font-bold">${shippingCost.toFixed(2)}</p><p className="text-sm text-gray-600">Distancia: {distance?.toFixed(2)} km</p></motion.div>

            <motion.div className="mt-4 h-64 w-full rounded-lg overflow-hidden shadow-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {import.meta.env.VITE_MAPBOX_TOKEN ? (
                <Map
                  ref={mapRef}
                  initialViewState={{ latitude: 16.25, longitude: -92.13, zoom: 12 }}
                  style={{ width: '100%', height: '100%' }}
                  mapStyle="mapbox://styles/mapbox/streets-v11"
                  mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}

                >
                  {originCoords && <Marker longitude={originCoords.lng} latitude={originCoords.lat} color="#00B37E" />}
                  {destinationCoords && <Marker longitude={destinationCoords.lng} latitude={destinationCoords.lat} color="#FF5A5F" />}
                  {routeGeoJSON && (
                    <Source id="route" type="geojson" data={{ type: 'Feature', properties: {}, geometry: routeGeoJSON }}>
                      <Layer
                        id="route"
                        type="line"
                        paint={{
                          'line-color': '#000000',
                          'line-width': 3
                        }}
                      />
                    </Source>
                  )}
                </Map>
              ) : (
                <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center p-4 text-center">
                  <Icons.MapIcon className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-gray-500 font-medium">Mapa no disponible</p>
                  <p className="text-xs text-gray-400 mt-1">Verifica la configuración de Mapbox</p>
                </div>
              )}
            </motion.div>
          </>
        ) : <p className="text-sm text-gray-500">Introduce origen y destino para calcular el costo.</p>}
      </section>

      <section className="bg-white p-4 rounded-lg">
        <label htmlFor="description" className="block text-sm font-medium">Descripción del paquete</label>
        <textarea id="description" placeholder="Ej: Paquete pequeño, documentos..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full py-2 px-3 bg-gray-100 rounded-md h-24 resize-none"></textarea>
      </section>

      <div className="border-t pt-5">
        <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
          <p className="text-sm font-semibold">¿Programar recogida?</p>
          <button onClick={() => setShowScheduleModal(true)} className="bg-black text-white text-xs font-bold py-2 px-4 rounded-full">PROGRAMAR</button>
        </div>
        {confirmedSchedule && <div className="text-center p-3 bg-green-100 text-green-800 rounded-lg text-sm font-semibold"><p>Recogida: <strong>{getFormattedScheduledDate()} a las {confirmedSchedule.time} hrs.</strong></p></div>}
        <button onClick={handleProceedToConfirmation} disabled={!shippingCost || isCalculating} className="bg-black text-white w-full py-3 mt-4 rounded-lg font-bold flex items-center justify-center gap-2 disabled:bg-gray-600">Continuar <Icons.ArrowRightIcon className="w-5 h-5" /></button>
      </div>

      <AnimatePresence>
        {showOriginMapPicker && <LocationPickerMapModal isOpen={showOriginMapPicker} onClose={() => setShowOriginMapPicker(false)} onConfirm={handleConfirmOrigin} initialLocation={initialOriginLocation} title="Seleccionar Origen" />}
        {showDestinationMapPicker && <LocationPickerMapModal isOpen={showDestinationMapPicker} onClose={() => setShowDestinationMapPicker(false)} onConfirm={handleConfirmDestination} initialLocation={initialDestinationLocation} title="Seleccionar Destino" />}
      </AnimatePresence>
      <ScheduleModal isOpen={showScheduleModal} onClose={handleScheduleCancel} onSubmit={handleScheduleSubmit} weekDays={weekDays} timeSlots={timeSlots} />
    </div>
  );
};
