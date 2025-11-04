import React, { useState, useMemo, useEffect } from 'react';
import { TariffCard } from './TariffCard';
import * as Icons from './icons';
import { Tariff, ServiceRequest } from '../types';
import { createServiceRequest } from '../services/api';
import { useTariffs } from '../hooks/useTariffs';
import { Spinner } from './Spinner';
import { ComingSoonModal } from './ComingSoonModal';

type Step = 'details' | 'confirmation' | 'submitted';

// Helper to get the next 7 days for the calendar view
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

// Helper to generate time slots
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour < 22; hour++) {
    slots.push(`${String(hour).padStart(2, '0')}:00`);
    slots.push(`${String(hour).padStart(2, '0')}:30`);
  }
  return slots;
};

const IconComponent: React.FC<{ iconName: string }> = ({ iconName }) => {
    const Icon = Icons[iconName as keyof typeof Icons];
    return Icon ? <Icon className="w-6 h-6 mx-auto mb-1" /> : <Icons.WrenchIcon className="w-6 h-6 mx-auto mb-1" />;
};

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

export const RequestService: React.FC = () => {
  const [step, setStep] = useState<Step>('details');
  const { tariffs, loading, error } = useTariffs();
  const [selectedTariffId, setSelectedTariffId] = useState<number | null>(null);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [description, setDescription] = useState('');

  const [showComingSoonModal, setShowComingSoonModal] = useState(false);

  // State for scheduling
  const [isScheduling, setIsScheduling] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [scheduleTime, setScheduleTime] = useState('');
  const [confirmedSchedule, setConfirmedSchedule] = useState<{ date: Date; time: string } | null>(null);

  const weekDays = useMemo(() => getNext7Days(), []);
  const timeSlots = useMemo(() => generateTimeSlots(), []);

  useEffect(() => {
    if (tariffs.length > 0 && selectedTariffId === null) {
      setSelectedTariffId(tariffs[0].id);
    }
  }, [tariffs, selectedTariffId]);

  const handleProceedToConfirmation = () => {
    if (!origin || !destination || !description || !selectedTariffId) {
      alert('Por favor, completa todos los campos y selecciona una tarifa.');
      return;
    }
    setStep('confirmation');
  };

  const handleSubmit = async () => {
    if (!selectedTariffId) return;

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
      tariff_id: selectedTariffId,
      scheduled_at,
      status: 'pending',
    };

    try {
      await createServiceRequest(serviceRequest);
      setStep('submitted');
    } catch (error) {
      alert('Hubo un error al crear la solicitud. Por favor, inténtalo de nuevo.');
      console.error(error);
    }
  };

  const handleScheduleSubmit = () => {
    if (selectedDate && scheduleTime) {
      setConfirmedSchedule({ date: selectedDate, time: scheduleTime });
      setIsScheduling(false);
    } else {
      alert('Por favor, selecciona un día y una hora.');
    }
  };

  const handleScheduleCancel = () => {
    setIsScheduling(false);
    setSelectedDate(null);
    setScheduleTime('');
  };
  
  const getFormattedScheduledDate = () => {
    if (!confirmedSchedule) return '';
    return confirmedSchedule.date.toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  const whatsappNumber = '529631539156';
  const whatsappMessage = encodeURIComponent('Hola, necesito ayuda con mi servicio.');
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;


  if (step === 'submitted') {
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
      </div>
    );
  }
  
  if (step === 'confirmation') {
    const selectedTariff = tariffs.find(t => t.id === selectedTariffId);
    return (
        <div className="p-4 space-y-4 animate-fade-in">
            <Stepper currentStep={step} />
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">CONFIRMA TU SOLICITUD</h1>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg space-y-6">
                <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-3">Detalles del Servicio</h2>
                    <div className="space-y-4">
                        <div className="flex items-center text-gray-700">
                            <Icons.LocationIcon className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-xs font-bold text-gray-500">ORIGEN</p>
                                <p className="font-semibold text-gray-900">{origin}</p>
                            </div>
                        </div>
                        <div className="h-4 w-px bg-gray-300 ml-2.5"></div>
                        <div className="flex items-center text-gray-700">
                            <Icons.LocationIcon className="w-5 h-5 mr-3 text-red-500 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-xs font-bold text-gray-500">DESTINO</p>
                                <p className="font-semibold text-gray-900">{destination}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-3">Descripción</h2>
                    <p className="text-sm text-gray-700">{description}</p>
                </div>
                
                {selectedTariff && (
                  <div className="border-t border-gray-200 pt-6">
                      <h2 className="text-lg font-bold text-gray-800 mb-3">Tarifa Seleccionada</h2>
                      <p className="text-base font-bold capitalize text-gray-900">{selectedTariff.name} - ${selectedTariff.price}</p>
                  </div>
                )}

                {confirmedSchedule && (
                    <div className="border-t border-gray-200 pt-6 bg-green-50 p-4 rounded-lg">
                        <h2 className="text-lg font-bold text-green-800 mb-3">Recogida Programada</h2>
                        <p className="text-base font-semibold text-green-900">{getFormattedScheduledDate()} a las {confirmedSchedule.time} hrs.</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6">
                <button
                    onClick={() => setStep('details')}
                    className="bg-gray-200 text-gray-800 font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-300 transition-colors shadow-sm"
                >
                    <Icons.EditIcon className="w-5 h-5" />
                    Modificar
                </button>
                <button
                    onClick={handleSubmit}
                    className="bg-red-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-red-700 transition-colors shadow-lg"
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

      <section>
        {error ? (
          <div className="text-center text-red-500 p-4 bg-red-50 rounded-lg">
            <Icons.AlertTriangleIcon className="w-10 h-10 mx-auto mb-2 text-red-400" />
            <p className="font-semibold">{error}</p>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-5"><Spinner /></div>
        ) : tariffs.length > 0 ? (
          <>
            <div className="grid grid-cols-3 gap-2">
              {tariffs.map(tariff => (
                <TariffCard
                  key={tariff.id}
                  icon={<IconComponent iconName={tariff.icon} />}
                  title={tariff.name.toUpperCase()}
                  price={tariff.price}
                  isSelected={selectedTariffId === tariff.id}
                  onClick={() => setSelectedTariffId(tariff.id)}
                />
              ))}
            </div>
            <p className="text-xs text-center text-gray-500 mt-2">Por favor, selecciona una tarifa para tu servicio.</p>
          </>
        ) : (
          <div className="text-center text-gray-500 p-4 bg-gray-100 rounded-lg">
            <p>No hay tarifas de servicio disponibles en este momento.</p>
            <p className="text-sm mt-2">Por favor, contacta a soporte para más información.</p>
          </div>
        )}
      </section>

      {!isScheduling && (
        <section className="space-y-4 animate-fade-in">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-3">
            <h3 className="font-bold text-lg text-gray-800 mb-2">Detalles del Envío</h3>
            <div>
                <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-1">Origen</label>
                <div className="relative flex items-center">
                    <Icons.LocationIcon className="absolute left-3 w-5 h-5 text-green-500" />
                    <input 
                      id="origin" 
                      type="text" 
                      placeholder="Ej: Calle, Colonia, #Casa" 
                      value={origin} 
                      onChange={(e) => setOrigin(e.target.value)} 
                      className="w-full py-3 pl-10 pr-4 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                </div>
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
                      className="w-full py-3 pl-10 pr-4 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-lg text-gray-800 mb-2">Ubicación de Referencia</h3>
            <div className="relative h-40 bg-gray-100 rounded-lg flex flex-col items-center justify-center text-center overflow-hidden border-2 border-dashed border-gray-300">
                <Icons.LocationIcon className="w-10 h-10 text-gray-300" />
                <p className="text-xs font-semibold text-gray-500 mt-2">El mapa interactivo estará disponible pronto</p>
                <button 
                    onClick={() => setShowComingSoonModal(true)}
                    className="mt-3 bg-gray-800 text-white text-xs font-bold py-2 px-4 rounded-full hover:bg-black transition-all"
                >
                    Abrir mapa
                </button>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descripción del paquete o mandado</label>
            <textarea 
              id="description" 
              placeholder="Ej: Paquete pequeño, documentos importantes, etc."
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="w-full py-3 px-4 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-24 resize-none"
            ></textarea>
          </div>
       </section>
      )}

      <div className="border-t border-gray-200 pt-5">
        {!isScheduling && (
          <section className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
              <p className="text-sm font-semibold text-gray-700">¿Quieres programar la recogida?</p>
              <button onClick={() => setIsScheduling(true)} className="bg-gray-800 text-white text-xs font-bold py-2 px-4 rounded-full hover:bg-black transition-colors">
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
              className="bg-orange-500 text-white w-full py-4 rounded-lg font-bold hover:bg-orange-600 transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              Continuar
              <Icons.ArrowRightIcon className="w-5 h-5" />
            </button>
          </section>
        )}
      </div>

      {isScheduling && (
        <section className="p-4 bg-gray-100 rounded-lg space-y-4 animate-fade-in border border-gray-200">
            <h3 className="font-bold text-center text-gray-700">Selecciona un día</h3>
            <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
              {weekDays.map((day) => {
                  const isSelected = selectedDate?.toDateString() === day.toDateString();
                  return (
                      <button key={day.toISOString()} onClick={() => setSelectedDate(day)} className={`flex-shrink-0 flex flex-col items-center p-2 rounded-lg border-2 w-16 h-20 justify-center transition-colors duration-200 ${isSelected ? 'bg-orange-500 text-white border-orange-500 shadow-md' : 'bg-white border-gray-300 hover:bg-gray-50'}`}>
                          <span className="text-xs font-semibold uppercase">{day.toLocaleDateString('es-ES', { weekday: 'short' }).slice(0, 3)}</span>
                          <span className="text-2xl font-bold">{day.getDate()}</span>
                      </button>
                  );
              })}
            </div>

            {selectedDate && (
              <div className="animate-fade-in pt-2 space-y-3">
                <h3 className="font-bold text-center text-gray-700">Selecciona la hora</h3>
                <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map(time => {
                        const isSelected = scheduleTime === time;
                        return (
                            <button 
                                key={time} 
                                onClick={() => setScheduleTime(time)}
                                className={`p-2 rounded-lg border-2 text-sm font-semibold transition-colors duration-200 ${isSelected ? 'bg-orange-500 text-white border-orange-500 shadow-md' : 'bg-white border-gray-300 hover:bg-gray-50'}`}>
                                {time}
                            </button>
                        );
                    })}
                </div>
              </div>
            )}
            
            <div className="flex gap-3 pt-3">
                <button onClick={handleScheduleCancel} className="w-full bg-gray-300 text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-400 transition-colors">Cancelar</button>
                <button onClick={handleScheduleSubmit} disabled={!selectedDate || !scheduleTime} className="w-full bg-gray-800 text-white font-bold py-3 rounded-lg hover:bg-black transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                  Confirmar Hora
                </button>
            </div>
        </section>
      )}
      
      <div className="text-center pt-4">
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-700 font-semibold flex items-center justify-center gap-2">
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
    </div>
  );
};