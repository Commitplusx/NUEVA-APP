import React, { useState, useMemo, useEffect } from 'react';
import { TariffCard } from './TariffCard';
import * as Icons from './icons';
import { Tariff, ServiceRequest } from '../types';
import { createServiceRequest } from '../services/api';
import { useTariffs } from '../hooks/useTariffs';
import { Spinner } from './Spinner';

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

export const RequestService: React.FC = () => {
  const [step, setStep] = useState<Step>('details');
  const { tariffs, loading, error } = useTariffs();
  const [selectedTariffId, setSelectedTariffId] = useState<number | null>(null);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [description, setDescription] = useState('');

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
            <h1 className="text-2xl font-bold text-center">CONFIRMA TU SOLICITUD</h1>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-4">
                <div>
                    <div className="flex items-center text-gray-700">
                        <Icons.LocationIcon className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-xs font-bold text-gray-500">DE</p>
                            <p className="font-semibold">{origin}</p>
                        </div>
                    </div>
                    <div className="h-4 w-px bg-gray-300 ml-2.5"></div>
                    <div className="flex items-center text-gray-700">
                        <Icons.LocationIcon className="w-5 h-5 mr-3 text-red-500 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-xs font-bold text-gray-500">A</p>
                            <p className="font-semibold">{destination}</p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-3">
                    <p className="text-xs font-bold text-gray-500">DESCRIPCIÓN</p>
                    <p className="text-sm">{description}</p>
                </div>
                
                {selectedTariff && (
                  <div className="border-t border-gray-200 pt-3">
                      <p className="text-xs font-bold text-gray-500">TARIFA SELECCIONADA</p>
                      <p className="text-sm font-bold capitalize">{selectedTariff.name} - ${selectedTariff.price}</p>
                  </div>
                )}

                {confirmedSchedule && (
                    <div className="border-t border-gray-200 pt-3 bg-green-50 p-2 rounded-md">
                        <p className="text-xs font-bold text-green-800">PROGRAMADO</p>
                        <p className="text-sm font-semibold text-green-900">{getFormattedScheduledDate()} a las {confirmedSchedule.time} hrs.</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                    onClick={() => setStep('details')}
                    className="bg-gray-200 text-gray-800 font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-300 transition-colors"
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
      <section className="text-center">
        <h1 className="text-2xl font-bold">SOLICITA TU SERVICIO</h1>
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
        <section className="space-y-3 animate-fade-in">
           <div className="relative flex items-center">
               <Icons.LocationIcon className="absolute left-3 w-5 h-5 text-gray-400" />
               <input type="text" placeholder="Origen (ej: Centro, Plaza)" value={origin} onChange={(e) => setOrigin(e.target.value)} className="w-full py-3 pl-10 pr-4 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" />
           </div>
           <div className="relative flex items-center">
               <Icons.LocationIcon className="absolute left-3 w-5 h-5 text-gray-400" />
               <input type="text" placeholder="Destino (ej: Orilla, Fuera)" value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full py-3 pl-10 pr-4 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black" />
           </div>
           <div className="h-40 bg-gray-200 rounded-lg overflow-hidden">
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src="https://www.openstreetmap.org/export/embed.html?bbox=-92.275%2C16.242%2C-92.255%2C16.252&layer=mapnik">
              </iframe>
           </div>
            <textarea placeholder="Descripción del paquete o mandado..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full py-3 px-4 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black h-20 resize-none"></textarea>
       </section>
      )}

      <section className="grid grid-cols-2 gap-3">
        <button onClick={() => setIsScheduling(!isScheduling)} className="bg-gray-700 text-white text-xs font-bold py-3 rounded-md hover:bg-black transition-colors">
          {isScheduling ? 'VOLVER A DETALLES' : (confirmedSchedule ? 'REPROGRAMAR' : 'PROGRAMAR RECOGIDA')}
        </button>
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="bg-green-600 text-white text-center text-xs font-bold py-3 rounded-md hover:bg-green-700 transition-colors">
          CONTACTAR SOPORTE
        </a>
      </section>

      {isScheduling && (
        <section className="p-4 bg-gray-100 rounded-lg space-y-4 animate-fade-in border border-gray-200">
            <h3 className="font-bold text-center text-gray-700">Selecciona un día</h3>
            <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
              {weekDays.map((day) => {
                  const isSelected = selectedDate?.toDateString() === day.toDateString();
                  return (
                      <button key={day.toISOString()} onClick={() => setSelectedDate(day)} className={`flex-shrink-0 flex flex-col items-center p-2 rounded-lg border-2 w-14 h-16 justify-center transition-colors duration-200 ${isSelected ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white border-gray-300 hover:bg-gray-50'}`}>
                          <span className="text-xs font-semibold uppercase">{day.toLocaleDateString('es-ES', { weekday: 'short' }).slice(0, 3)}</span>
                          <span className="text-xl font-bold">{day.getDate()}</span>
                      </button>
                  );
              })}
            </div>

            {selectedDate && (
              <div className="animate-fade-in pt-2 space-y-2">
                <h3 className="font-bold text-center text-gray-700">Selecciona la hora</h3>
                <select value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className="w-full py-2 px-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black">
                    <option value="" disabled>Elige un horario</option>
                    {timeSlots.map(time => <option key={time} value={time}>{time}</option>)}
                </select>
              </div>
            )}
            
            <div className="flex gap-2 mt-2">
                <button onClick={handleScheduleCancel} className="w-full bg-gray-500 text-white text-xs font-bold py-2 rounded-md hover:bg-gray-600 transition-colors">Cancelar</button>
                <button onClick={handleScheduleSubmit} disabled={!selectedDate || !scheduleTime} className="w-full bg-black text-white text-xs font-bold py-2 rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400">Confirmar Hora</button>
            </div>
        </section>
      )}
      
      {!isScheduling && (
        <section className="animate-fade-in">
          {confirmedSchedule && (
            <div className="text-center mb-3 p-2 bg-green-100 text-green-800 rounded-md text-sm font-semibold">
              <p>Recogida programada: {getFormattedScheduledDate()} a las {confirmedSchedule.time} hrs.</p>
            </div>
          )}
          <button
            onClick={handleProceedToConfirmation}
            className="bg-red-600 text-white w-full py-4 rounded-md font-bold hover:bg-red-700 transition-colors shadow-lg"
          >
            CONTINUAR
          </button>
        </section>
      )}
    </div>
  );
};