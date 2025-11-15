import React from 'react';
import * as Icons from './icons';
import { Stepper, Step } from './Stepper';

interface SubmittedStepProps {
  newRequestId: string | null;
  whatsappNumber: string;
}

export const SubmittedStep: React.FC<SubmittedStepProps> = ({ newRequestId, whatsappNumber }) => {
  const trackWhatsappMessage = encodeURIComponent(`Hola, quiero rastrear mi pedido con ID: ${newRequestId}`);
  const trackWhatsappUrl = `https://wa.me/${whatsappNumber}?text=${trackWhatsappMessage}`;

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 text-gray-600 animate-fade-in">
      <Stepper currentStep="submitted" />
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
          className="bg-black text-white w-full py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors shadow-lg flex items-center justify-center gap-2"
        >
          Rastrear por WhatsApp
        </a>
      </div>
    </div>
  );
};
