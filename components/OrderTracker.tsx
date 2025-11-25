import React, { useEffect, useState, useRef } from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '../services/supabase';
import { Order, Profile } from '../types';
import { FaStore, FaUser, FaMotorcycle, FaCheckCircle } from 'react-icons/fa';
import { MdDeliveryDining } from 'react-icons/md';

interface OrderTrackerProps {
    orderId: number;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export const OrderTracker: React.FC<OrderTrackerProps> = ({ orderId }) => {
    const [order, setOrder] = useState<Order | null>(null);
    const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [viewState, setViewState] = useState({
        latitude: 16.25,
        longitude: -92.13,
        zoom: 13
    });

    useEffect(() => {
        if (!orderId) return;

        const fetchOrder = async () => {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('id', orderId)
                .single();

            if (data) {
                setOrder(data);
                // Set initial view to customer or restaurant
                if (data.destination_lat && data.destination_lng) {
                    setViewState(prev => ({
                        ...prev,
                        latitude: data.destination_lat!,
                        longitude: data.destination_lng!,
                        zoom: 14
                    }));
                }
            }
        };

        fetchOrder();
        const interval = setInterval(fetchOrder, 10000);
        return () => clearInterval(interval);
    }, [orderId]);

    useEffect(() => {
        if (!order?.driver_id) return;

        const fetchDriverLocation = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('lat, lng')
                .eq('user_id', order.driver_id);

            if (data && data.length > 0 && data[0].lat && data[0].lng) {
                setDriverLocation({ lat: data[0].lat, lng: data[0].lng });
            }
        };

        fetchDriverLocation();
        const interval = setInterval(fetchDriverLocation, 10000);
        return () => clearInterval(interval);
    }, [order?.driver_id]);

    const getStatusStep = (status: string) => {
        switch (status) {
            case 'pending': return 0;
            case 'accepted': return 1;
            case 'picked_up': return 2;
            case 'delivered': return 3;
            default: return 0;
        }
    };

    const currentStep = order ? getStatusStep(order.status) : 0;

    return (
        <div className="flex flex-col h-full w-full bg-gray-50 rounded-xl overflow-hidden shadow-lg border border-gray-200">
            {/* Map Section */}
            <div className="h-64 w-full relative">
                <Map
                    {...viewState}
                    onMove={evt => setViewState(evt.viewState)}
                    style={{ width: '100%', height: '100%' }}
                    mapStyle="mapbox://styles/mapbox/streets-v11"
                    mapboxAccessToken={MAPBOX_TOKEN}
                >
                    {/* Restaurant Marker */}
                    {order?.origin_lat && order?.origin_lng && (
                        <Marker latitude={order.origin_lat} longitude={order.origin_lng}>
                            <div className="bg-white p-2 rounded-full shadow-md border-2 border-orange-500 flex items-center justify-center">
                                <FaStore size={20} color="orange" />
                            </div>
                        </Marker>
                    )}

                    {/* Customer Marker */}
                    {order?.destination_lat && order?.destination_lng && (
                        <Marker latitude={order.destination_lat} longitude={order.destination_lng}>
                            <div className="bg-white p-2 rounded-full shadow-md border-2 border-green-500 flex items-center justify-center">
                                <FaUser size={20} color="green" />
                            </div>
                        </Marker>
                    )}

                    {/* Driver Marker */}
                    {driverLocation && (
                        <Marker latitude={driverLocation.lat} longitude={driverLocation.lng}>
                            <div className="bg-white p-2 rounded-full shadow-md border-2 border-blue-500 animate-bounce flex items-center justify-center">
                                <FaMotorcycle size={24} color="#3b82f6" />
                            </div>
                        </Marker>
                    )}
                </Map>

                {/* Overlay Status */}
                <div className="absolute top-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 text-sm">
                        {order?.status === 'pending' && 'Esperando confirmación...'}
                        {order?.status === 'accepted' && 'Repartidor en camino al restaurante'}
                        {order?.status === 'picked_up' && 'Repartidor en camino a tu ubicación'}
                        {order?.status === 'delivered' && '¡Pedido entregado!'}
                    </h3>
                </div>
            </div>

            {/* Timeline Section */}
            <div className="p-6 bg-white">
                <div className="flex justify-between items-center relative">
                    {/* Progress Bar Background */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-0"></div>
                    {/* Progress Bar Active */}
                    <div
                        className="absolute top-1/2 left-0 h-1 bg-green-500 -z-0 transition-all duration-500"
                        style={{ width: `${(currentStep / 3) * 100}%` }}
                    ></div>

                    {/* Steps */}
                    {['Confirmado', 'Aceptado', 'En Camino', 'Entregado'].map((step, index) => (
                        <div key={index} className="flex flex-col items-center z-10 bg-white px-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${index <= currentStep ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-gray-300'
                                }`}>
                                {index < currentStep ? <FaCheckCircle /> : index === currentStep ? <MdDeliveryDining /> : <span className="text-xs">{index + 1}</span>}
                            </div>
                            <span className={`text-[10px] mt-1 font-semibold ${index <= currentStep ? 'text-green-600' : 'text-gray-400'}`}>
                                {step}
                            </span>
                        </div>
                    ))}
                </div>

                {/* ETA or Details */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-center">
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">Tiempo Estimado</p>
                        <p className="text-lg font-bold text-gray-800">
                            {order?.status === 'delivered' ? 'Entregado' : '15-25 min'}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase font-bold">Repartidor</p>
                        <p className="text-sm font-semibold text-gray-800">
                            {order?.driver_id ? 'Asignado' : 'Buscando...'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
