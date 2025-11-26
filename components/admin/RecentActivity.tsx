import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useServiceRequests } from '../../hooks/useServiceRequests';
import { ClockIcon, MapPinIcon, CurrencyDollarIcon } from '../icons';
import { ServiceRequestDetailsModal } from './ServiceRequestDetailsModal';
import { ServiceRequest } from '../../types';

export const RecentActivity: React.FC = () => {
    const { requests, loading } = useServiceRequests();
    const [searchParams, setSearchParams] = useSearchParams();

    const requestId = searchParams.get('request_id');
    const selectedRequest = requestId ? requests.find(r => r.id === requestId) || null : null;

    // Get only the last 5 requests
    const recentRequests = requests.slice(0, 5);

    const handleRequestClick = (id: string) => {
        setSearchParams(prev => {
            prev.set('request_id', id);
            return prev;
        });
    };

    const handleCloseModal = () => {
        setSearchParams(prev => {
            prev.delete('request_id');
            return prev;
        });
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
                <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-gray-100 rounded-xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-gray-800">Actividad Reciente</h2>
                    <span className="text-xs font-medium text-blue-500 bg-blue-50 px-2 py-1 rounded-full">
                        Últimos Pedidos
                    </span>
                </div>

                <div className="space-y-4">
                    {recentRequests.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No hay actividad reciente.</p>
                    ) : (
                        recentRequests.map((request) => (
                            <div
                                key={request.id}
                                onClick={() => handleRequestClick(request.id)}
                                className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors border border-gray-100 group cursor-pointer"
                            >
                                <div className="mt-1 p-2 bg-white rounded-lg shadow-sm text-blue-500 group-hover:text-blue-600">
                                    <ClockIcon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-semibold text-gray-800 truncate pr-2">
                                            Solicitud #{request.id.slice(0, 8)}
                                        </h3>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                            request.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                'bg-gray-200 text-gray-600'
                                            }`}>
                                            {request.status || 'Pendiente'}
                                        </span>
                                    </div>

                                    <div className="mt-2 space-y-1">
                                        <div className="flex items-center text-xs text-gray-500">
                                            <MapPinIcon className="w-3 h-3 mr-1 text-gray-400" />
                                            <span className="truncate max-w-[200px]">{request.origin}</span>
                                            <span className="mx-1">→</span>
                                            <span className="truncate max-w-[200px]">{request.destination}</span>
                                        </div>
                                        <div className="flex items-center text-xs font-medium text-gray-700">
                                            <CurrencyDollarIcon className="w-3 h-3 mr-1 text-gray-400" />
                                            ${request.price.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {selectedRequest && (
                <ServiceRequestDetailsModal
                    request={selectedRequest}
                    onClose={handleCloseModal}
                />
            )}
        </>
    );
};
