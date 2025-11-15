import React from 'react';
import * as Icons from './icons';
import Lottie from 'lottie-react';
import deliveryAnimation from './animations/delivery-animation.json';

interface ConfirmationStepProps {
  origin: string;
  destination: string;
  description: string;
  shippingCost: number;
  distance: number | null;
  confirmedSchedule: { date: Date; time: string } | null;
  getFormattedScheduledDate: () => string;
  onModify: () => void;
  onConfirm: () => void;
}

export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  origin,
  destination,
  description,
  shippingCost,
  distance,
  confirmedSchedule,
  getFormattedScheduledDate,
  onModify,
  onConfirm,
}) => {
  return (
    <div className="p-4 space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">CONFIRMA TU SOLICITUD</h1>
      <Lottie animationData={deliveryAnimation} loop={true} style={{ height: 150, marginBottom: '1rem' }} />
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg space-y-6">
        <div className="pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Icons.MapPinIcon className="w-5 h-5 text-green-600" />
            Detalles del Servicio
          </h2>
          <div className="space-y-4">
            <div className="flex items-start text-gray-700">
              <Icons.LocationIcon className="w-5 h-5 mr-3 text-[var(--color-rappi-success)] flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-500">ORIGEN</p>
                <p className="font-semibold text-gray-900">{origin}</p>
              </div>
            </div>
            <div className="h-4 w-px bg-gray-300 ml-2.5"></div>
            <div className="flex items-start text-gray-700">
              <Icons.LocationIcon className="w-5 h-5 mr-3 text-[var(--color-rappi-danger)] flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-500">DESTINO</p>
                <p className="font-semibold text-gray-900">{destination}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Icons.PackageIcon className="w-5 h-5 text-[var(--color-rappi-primary)]" />
            Descripción del Paquete
          </h2>
          <p className="text-sm text-gray-700">{description}</p>
        </div>

        <div className="pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Icons.DollarSignIcon className="w-5 h-5 text-green-600" />
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
          onClick={onModify}
          className="bg-gray-200 text-gray-800 font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-300 transition-colors shadow-sm"
        >
          <Icons.EditIcon className="w-5 h-5" />
          Modificar
        </button>
        <button
          onClick={onConfirm}
          className="bg-black text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors shadow-lg"
        >
          Confirmar
          <Icons.ArrowRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
