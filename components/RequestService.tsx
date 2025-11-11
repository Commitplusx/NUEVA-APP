
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import * as Icons from './icons';
import { ServiceRequest, Profile } from '../types';
import { createServiceRequest, getProfile, geocodeAddress } from '../services/api';
import { useAppContext } from '../context/AppContext';
import { useThemeColor } from '../hooks/useThemeColor';
import { Spinner } from './Spinner';
import { ComingSoonModal } from './ComingSoonModal';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon issue with Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

type Step = 'details' | 'confirmation' | 'submitted';

// --- Helper Functions ---

// Haversine formula to calculate distance between two lat/lng points
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

const Stepper: React.FC<{ currentStep: Step }> = ({ currentStep }) => {
  const steps = ['details', 'confirmation', 'submitted'];
  const currentStepIndex = steps.indexOf(currentStep);

  const getStepName = (step: Step) => {
    if (step === 'details') return 'Detalles';
    if (step === 'confirmation') return 'Confirmar';
    return 'Enviado';
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
              {index < currentStepIndex ? <Icons.CheckCircleIcon className="w-6 h-6" /> : index + 1}
            </div>
            <p
              className={`mt-2 text-xs font-bold transition-colors duration-300 ${
                index <= currentStepIndex ? 'text-orange-500' : 'text-gray-500'
              }`}
            >
              {getStepName(step as Step)}
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

// MapUpdater component to dynamically update map view
const MapUpdater: React.FC<{ originCoords: { lat: number; lng: number } | null; destinationCoords: { lat: number; lng: number } | null }> = ({ originCoords, destinationCoords }) => {
  const map = useMap();

  useEffect(() => {
    if (originCoords && destinationCoords) {
      const bounds = L.latLngBounds([originCoords.lat, originCoords.lng], [destinationCoords.lat, destinationCoords.lng]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (originCoords) {
      map.setView([originCoords.lat, originCoords.lng], 13);
    } else if (destinationCoords) {
      map.setView([destinationCoords.lat, destinationCoords.lng], 13);
    }
  }, [map, originCoords, destinationCoords]);

  return null;
};

export const RequestService: React.FC = () => {
  // This comment is added to trigger a re-build and re-evaluation of the component.
  useThemeColor('#f97316');
  const { showToast, baseFee, userRole } = useAppContext();
  const navigate = useNavigate();
  const [isCalculating, setIsCalculating] = useState(false);
  const [step, setStep] = useState<Step>('details');
  const [origin, setOrigin] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [distance, setDistance] = useState<number | null>(null);
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [confirmedSchedule, setConfirmedSchedule] = useState<{ date: Date, time: string } | null>(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [scheduleTime, setScheduleTime] = useState<string>('');
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [newRequestId, setNewRequestId] = useState<string | null>(null);
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);


  const weekDays = useMemo(() => getNext7Days(), []);
  const timeSlots = useMemo(() => generateTimeSlots(), []);

  // --- Effects ---

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getProfile();
        if (profile) {
          setUserProfile(profile);
          if (profile.address && profile.lat && profile.lng) {
            setOrigin(profile.address);
            setOriginCoords({ lat: profile.lat, lng: profile.lng });
          } else {
            showToast('No tienes una dirección de origen guardada. Ve a tu perfil para añadir una.', 'info');
          }
        } else {
            showToast('Ve a tu perfil para configurar tu dirección de origen por defecto.', 'info');
        }
      } catch (error) {
        showToast('No se pudo cargar tu perfil.', 'error');
      }
    };
    fetchProfile();
  }, []);

  // Debounced distance and price calculation
  const calculateDistanceAndPrice = useCallback(async (originProfile: Profile, destAddress: string) => {
    if (!originProfile.lat || !originProfile.lng || !destAddress) {
      setDistance(null);
      setShippingCost(null);
      setDestinationCoords(null);
      return;
    }
    
    setIsCalculating(true);
    try {
      const destCoords = await geocodeAddress(destAddress);
      if (destCoords) {
        setDestinationCoords(destCoords);
        const dist = haversineDistance(originProfile.lat, originProfile.lng, destCoords.lat, destCoords.lng);
        const cost = baseFee + dist * PRICE_PER_KM;
        setDistance(dist);
        setShippingCost(cost);
      } else {
        setDistance(null);
        setShippingCost(null);
        setDestinationCoords(null);
        showToast('No se pudo encontrar la dirección de destino.', 'error');
      }
    } catch (error) {
      showToast('Error al calcular la distancia.', 'error');
    } finally {
      setIsCalculating(false);
    }
  }, [showToast, baseFee]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (destination && userProfile) {
        calculateDistanceAndPrice(userProfile, destination);
      }
    }, 1000); // 1-second debounce

    return () => {
      clearTimeout(handler);
    };
  }, [destination, userProfile, calculateDistanceAndPrice]);


  // --- Handlers ---

  const handleProfileLinkClick = () => {
    if (userRole === 'guest') {
      showToast('Debes iniciar sesión para configurar tu perfil.', 'info');
      navigate('/login');
    } else {
      navigate('/profile');
    }
  };

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
    if (!shippingCost || !distance) return;

    let scheduled_at = null;
    if (confirmedSchedule) {
        const date = new Date(confirmedSchedule.date);
        const [hours, minutes] = confirmedSchedule.time.split(':');
        date.setHours(parseInt(hours), parseInt(minutes));
        scheduled_at = date.toISOString();
    }

    const serviceRequest: ServiceRequest = {
      origin,
      destination,
      description,
      price: shippingCost,
      distance: distance,
      scheduled_at,
      status: 'pending',
      phone: userProfile?.phone,
    };

    try {
      const newRequest = await createServiceRequest(serviceRequest);
      if (newRequest && newRequest.id) {
        setNewRequestId(newRequest.id);
      }
      setStep('submitted');
    } catch (error) {
      showToast('Hubo un error al crear la solicitud.', 'error');
      console.error(error);
    }
  };

  const handleScheduleSubmit = (date: Date, time: string) => {
    if (date && time) {
      setConfirmedSchedule({ date: date, time: time });
      setShowScheduleModal(false);
    } else {
      showToast('Por favor, selecciona un día y una hora.', 'error');
    }
  };

  const handleScheduleCancel = () => {
    setShowScheduleModal(false);
    setSelectedDate(null);
    setScheduleTime('');
  };
  
  const getFormattedScheduledDate = () => {
    if (!confirmedSchedule) return '';
    return confirmedSchedule.date.toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  const whatsappNumber = '14155238886';
  const whatsappMessage = encodeURIComponent('Hola, necesito ayuda con mi servicio.');
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  // --- Render Logic ---

  if (step === 'submitted') {
    const trackWhatsappMessage = encodeURIComponent(`Hola, quiero rastrear mi pedido con ID: ${newRequestId}`);
    const trackWhatsappUrl = `https://wa.me/${whatsappNumber}?text=${trackWhatsappMessage}`;

    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 text-gray-600 animate-fade-in">
        <Stepper currentStep={step} />
        <div className="p-6 bg-green-100 rounded-full">
          <Icons.CheckCircleIcon className="w-16 h-16 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mt-6">¡Solicitud Recibida!</h1>
        <p className="mt-4 max-w-sm">
          Hemos recibido tu solicitud de servicio. Nos pondremos en contacto contigo en breve.
        </p>
        <div className="mt-8 w-full max-w-xs">
          <a
            href={trackWhatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 text-white w-full py-3 rounded-lg font-bold hover:bg-green-600 transition-colors shadow-lg flex items-center justify-center gap-2"
          >
            Rastrear por WhatsApp
          </a>
        </div>
      </div>
    );
  }
  
  if (step === 'confirmation') {
    return (
        <div className="p-4 space-y-6 animate-fade-in">
            <Stepper currentStep={step} />
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">CONFIRMA TU SOLICITUD</h1>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg space-y-6">
                <div className="pb-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Icons.MapPinIcon className="w-5 h-5 text-orange-500" />
                        Detalles del Servicio
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-start text-gray-700">
                            <Icons.LocationIcon className="w-5 h-5 mr-3 text-green-500 flex-shrink-0 mt-1" />
                            <div className="flex-1">
                                <p className="text-xs font-bold text-gray-500">ORIGEN</p>
                                <p className="font-semibold text-gray-900">{origin}</p>
                            </div>
                        </div>
                        <div className="h-4 w-px bg-gray-300 ml-2.5"></div>
                        <div className="flex items-start text-gray-700">
                            <Icons.LocationIcon className="w-5 h-5 mr-3 text-red-500 flex-shrink-0 mt-1" />
                            <div className="flex-1">
                                <p className="text-xs font-bold text-gray-500">DESTINO</p>
                                <p className="font-semibold text-gray-900">{destination}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pb-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Icons.PackageIcon className="w-5 h-5 text-orange-500" />
                        Descripción del Paquete
                    </h2>
                    <p className="text-sm text-gray-700">{description}</p>
                </div>
                
                <div className="pb-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Icons.DollarSignIcon className="w-5 h-5 text-orange-500" />
                        Costo del Envío
                    </h2>
                    <p className="text-3xl font-bold text-gray-900">${shippingCost?.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Distancia: {distance?.toFixed(2)} km</p>
                </div>

                {confirmedSchedule && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h2 className="text-lg font-bold text-green-800 mb-3 flex items-center gap-2">
                            <Icons.CalendarIcon className="w-5 h-5 text-green-600" />
                            Recogida Programada
                        </h2>
                        <p className="text-base font-semibold text-green-900">{getFormattedScheduledDate()} a las {confirmedSchedule.time} hrs.</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
                <button
                    onClick={() => setStep('details')}
                    className="bg-gray-200 text-gray-800 font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-300 transition-colors shadow-sm"
                >
                    <Icons.EditIcon className="w-5 h-5" />
                    Modificar
                </button>
                <button
                    onClick={handleSubmit}
                    className="bg-orange-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors shadow-lg"
                >
                    Confirmar
                    <Icons.ArrowRightIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="p-4 space-y-5">
      <section>
        <h1 className="text-2xl font-bold text-center mb-4">SOLICITA TU SERVICIO</h1>
        <Stepper currentStep={step} />
      </section>

      <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-3">
        <h3 className="font-bold text-lg text-gray-800 mb-2">Detalles del Envío</h3>
        <div>
            <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-1">Origen</label>
            <div className="relative flex items-center">
                <Icons.LocationIcon className="absolute left-3 w-5 h-5 text-green-500" />
                                <input
                                  id="origin"
                                  type="text"
                                  value={origin}
                                  onChange={(e) => setOrigin(e.target.value)}
                                  className="w-full py-2 px-3 pl-10 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />            </div>
            {!userProfile?.address && (
              <button
                onClick={handleProfileLinkClick}
                className="text-xs font-medium underline text-red-600 hover:text-red-700 ml-1 mt-1"
              >
                  No tienes una dirección de origen. Configura tu perfil aquí.
              </button>
            )}
        </div>

        <div className="flex items-center justify-center py-1">
            <div className="flex-grow border-t border-dashed border-gray-300"></div>
            <Icons.ChevronDownIcon className="w-5 h-5 text-gray-400 mx-2 flex-shrink-0" />
            <div className="flex-grow border-t border-dashed border-gray-300"></div>
        </div>

        <div>
            <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">Destino</label>
            <div className="relative flex items-center">
                <Icons.LocationIcon className="absolute left-3 w-5 h-5 text-red-500" />
                <input 
                  id="destination" 
                  type="text" 
                  placeholder="Ej: Calle, Colonia, #Casa" 
                  value={destination} 
                  onChange={(e) => setDestination(e.target.value)} 
                  className="w-full py-2 px-3 pl-10 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={!origin}
                />
            </div>
             {!origin && <p className="text-xs text-red-500 mt-1">Debes configurar una dirección de origen en tu perfil primero.</p>}
        </div>
      </section>

      <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h3 className="font-bold text-lg text-gray-800 mb-2">Costo Estimado</h3>
        {isCalculating ? (
            <div className="flex items-center gap-2 text-gray-500">
                <Spinner /> <span>Calculando...</span>
            </div>
        ) : shippingCost ? (
            <div>
                <p className="text-3xl font-bold text-gray-800">${shippingCost.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Distancia aproximada: {distance?.toFixed(2)} km</p>
            </div>
        ) : (
            <p className="text-sm text-gray-500">Introduce una dirección de destino para calcular el costo.</p>
        )}
        {(originCoords || destinationCoords) && (
          <div className="mt-4 h-64 w-full rounded-lg overflow-hidden shadow-md">
            <MapContainer 
              center={originCoords ? [originCoords.lat, originCoords.lng] : [0, 0]} 
              zoom={originCoords ? 13 : 2} 
              scrollWheelZoom={false} 
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {originCoords && (
                <Marker position={[originCoords.lat, originCoords.lng]}>
                  <Popup>Origen: {origin}</Popup>
                </Marker>
              )}
              {destinationCoords && (
                <Marker position={[destinationCoords.lat, destinationCoords.lng]}>
                  <Popup>Destino: {destination}</Popup>
                </Marker>
              )}
              <MapUpdater originCoords={originCoords} destinationCoords={destinationCoords} />
            </MapContainer>
          </div>
        )}
      </section>

      <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descripción del paquete o mandado</label>
        <textarea 
          id="description" 
          placeholder="Ej: Paquete pequeño, documentos importantes, etc."
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          className="w-full py-2 px-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-24 resize-none"
        ></textarea>
      </section>

      <div className="border-t border-gray-200 pt-5">
        <section className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
              <p className="text-sm font-semibold text-gray-700">¿Quieres programar la recogida?</p>
              <button onClick={() => setShowScheduleModal(true)} className="bg-gray-800 text-white text-xs font-bold py-2 px-4 rounded-full hover:bg-black transition-colors">
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
              className="bg-orange-500 text-white w-full py-3 rounded-lg font-bold hover:bg-orange-600 transition-colors shadow-lg flex items-center justify-center gap-2 disabled:bg-orange-300 disabled:cursor-not-allowed"
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

      <ComingSoonModal
        isOpen={showComingSoonModal}
        onClose={() => setShowComingSoonModal(false)}
        title="¡Funcionalidad Próximamente!"
        message="Este mapa interactivo estará disponible muy pronto. Estamos trabajando para mejorar tu experiencia."
      />

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Programar Recogida</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="schedule-date" className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <select
                  id="schedule-date"
                  className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                >
                  <option value="">Selecciona una fecha</option>
                  {weekDays.map((day) => (
                    <option key={day.toISOString()} value={day.toISOString().split('T')[0]}>
                      {day.toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="schedule-time" className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                <select
                  id="schedule-time"
                  className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                >
                  <option value="">Selecciona una hora</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleScheduleCancel}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleScheduleSubmit(selectedDate!, scheduleTime)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold"
                disabled={!selectedDate || !scheduleTime}
              >
                Confirmar Horario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
