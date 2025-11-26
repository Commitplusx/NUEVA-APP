import React from 'react';
import { ServiceRequest } from '../../types';
import { XCircleIcon, MapPinIcon, ClockIcon, CurrencyDollarIcon, UserIcon, PhoneIcon } from '../icons';

interface ServiceRequestDetailsModalProps {
    request: ServiceRequest;
    onClose: () => void;
}

export const ServiceRequestDetailsModal: React.FC<ServiceRequestDetailsModalProps> = ({ request, onClose }) => {
    if (!request) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-[70] animate-fade-in p-4">
            <style>{`
        @keyframes modalPop {
          0% { opacity: 0; transform: scale(0.95) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-modal-pop {
          animation: modalPop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-modal-pop relative">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Detalles de Solicitud</h2>
                        <p className="text-sm text-gray-500">ID: {request.id.slice(0, 8)}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-200 rounded-full">
                        <XCircleIcon className="w-8 h-8" />
                    </button>
                </div>

                <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                    {/* Status Badge */}
                    <div className="flex justify-center">
                        <span className={`px-4 py-1.5 rounded-full text-sm font-bold capitalize ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                request.status === 'completed' ? 'bg-green-100 text-green-700' :
                                    request.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                        'bg-gray-200 text-gray-600'
                            }`}>
                            {request.status || 'Pendiente'}
                        </span>
                    </div>

                    {/* Route Info */}
                    <div className="bg-blue-50 rounded-xl p-4 space-y-3 border border-blue-100">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 text-blue-500"><MapPinIcon className="w-5 h-5" /></div>
                            <div>
                                <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide">Origen</p>
                                <p className="text-gray-800 font-medium">{request.origin}</p>
                            </div>
                        </div>
                        <div className="pl-2 border-l-2 border-blue-200 ml-2.5 h-4"></div>
                        <div className="flex items-start gap-3">
                            <div className="mt-1 text-red-500"><MapPinIcon className="w-5 h-5" /></div>
                            <div>
                                <p className="text-xs font-semibold text-red-400 uppercase tracking-wide">Destino</p>
                                <p className="text-gray-800 font-medium">{request.destination}</p>
                            </div>
                        </div>
                    </div>

                    {/* Financials & Distance */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-2 mb-1 text-gray-500">
                                <CurrencyDollarIcon className="w-4 h-4" />
                                <span className="text-xs font-medium uppercase">Precio</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-800">${request.price.toFixed(2)}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-2 mb-1 text-gray-500">
                                <MapPinIcon className="w-4 h-4" />
                                <span className="text-xs font-medium uppercase">Distancia</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-800">{request.distance.toFixed(1)} km</p>
                        </div>
                    </div>

                    {/* Customer & Time */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-gray-700">
                            <UserIcon className="w-5 h-5 text-gray-400" />
                            <span className="font-medium">Cliente ID: <span className="text-gray-500 font-normal">{request.user_id.slice(0, 8)}...</span></span>
                        </div>
                        {request.phone && (
                            <div className="flex items-center gap-3 text-gray-700">
                                <PhoneIcon className="w-5 h-5 text-gray-400" />
                                <span>{request.phone}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-3 text-gray-700">
                            <ClockIcon className="w-5 h-5 text-gray-400" />
                            <span>Creado: {new Date(request.created_at).toLocaleString()}</span>
                        </div>
                        {request.description && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Descripción / Notas</p>
                                <p className="text-gray-700 italic">"{request.description}"</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};
