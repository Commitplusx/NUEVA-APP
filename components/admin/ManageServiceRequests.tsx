import React, { useState, useEffect } from 'react';
import { getServiceRequests, updateServiceRequestStatus } from '../../services/api';
import { notifyOrderConfirmed, notifyOrderCanceled } from '../../services/notifications';
import { ServiceRequest } from '../../types';
import { Spinner } from '../Spinner';

export const ManageServiceRequests: React.FC = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>({});

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getServiceRequests();
      setRequests(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar las solicitudes.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (request: ServiceRequest, status: 'confirmed' | 'canceled') => {
    if (!request.id || !request.phone) {
      alert('Esta solicitud no tiene un ID o teléfono para notificar.');
      return;
    }

    setUpdatingStatus(prev => ({ ...prev, [request.id!]: true }));

    try {
      // 1. Update status in DB
      await updateServiceRequestStatus(String(request.id), status);

      // 2. Send notification
      if (status === 'confirmed') {
        await notifyOrderConfirmed(request.phone, String(request.id), {
          name: request.user_id, // Placeholder, ideally we'd have the user's name
          eta: '30 minutos',
          channel: 'whatsapp',
        });
      } else if (status === 'canceled') {
        await notifyOrderCanceled(request.phone, String(request.id), {
          name: request.user_id, // Placeholder
          reason: 'No disponible',
          channel: 'whatsapp',
        });
      }
      
      // 3. Refresh list
      await fetchRequests();

    } catch (err: any) {
      alert(`Error: ${err.message}`);
      console.error(err);
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [request.id!]: false }));
    }
  };

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">Gestionar Solicitudes</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servicio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map((req) => (
              <tr key={req.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.service_id}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    req.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    req.status === 'canceled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {req.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {req.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdateStatus(req, 'confirmed')}
                        disabled={updatingStatus[req.id!]}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50"
                      >
                        {updatingStatus[req.id!] ? 'Confirmando...' : 'Confirmar'}
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(req, 'canceled')}
                        disabled={updatingStatus[req.id!]}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        {updatingStatus[req.id!] ? 'Cancelando...' : 'Cancelar'}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
