import React, { useEffect, useState, useRef } from 'react';
import Map, { Marker, Source, Layer, MapRef } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import { supabase } from '../services/supabase';
import { Order, Profile } from '../types';
import { FaStore, FaUser, FaMotorcycle, FaCheckCircle, FaPhone } from 'react-icons/fa';
import { MdDeliveryDining } from 'react-icons/md';

interface OrderTrackerProps {
    orderId: number;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export const OrderTracker: React.FC<OrderTrackerProps> = ({ orderId }) => {
    const [order, setOrder] = useState<Order | null>(null);
    const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [driverProfile, setDriverProfile] = useState<Profile | null>(null);
    const [routeGeoJSON, setRouteGeoJSON] = useState<any>(null);
    const [viewState, setViewState] = useState({
        latitude: 16.25,
        longitude: -92.13,
        zoom: 13
    });
    const mapRef = useRef<MapRef>(null);

    // Fetch Order Data
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
            }
        };

        fetchOrder();
        const interval = setInterval(fetchOrder, 10000);
        return () => clearInterval(interval);
    }, [orderId]);

    // Fetch Driver Location & Profile
    useEffect(() => {
        if (!order?.driver_id) return;

        const fetchDriverData = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', order.driver_id)
                .single();

            if (data) {
                setDriverProfile(data);
                if (data.lat && data.lng) {
                    setDriverLocation({ lat: data.lat, lng: data.lng });
                }
            }
        };

        fetchDriverData();
        const interval = setInterval(fetchDriverData, 10000); // Polling every 10s
        return () => clearInterval(interval);
    }, [order?.driver_id]);

    // Fetch Route & Fit Bounds
    useEffect(() => {
        if (!order || !driverLocation) return;

        const fetchRoute = async () => {
            const start = [driverLocation.lng, driverLocation.lat];
            const end = [order.destination_lng!, order.destination_lat!];

            // If status is accepted, route from driver to restaurant
            // If picked_up, route from driver to customer
            const destination = order.status === 'accepted'
                ? [order.origin_lng!, order.origin_lat!]
                : [order.destination_lng!, order.destination_lat!];

            const query = await fetch(
                `https://api.mapbox.com/directions/v5/mapbox/driving/${start.join(',')};${destination.join(',')}?steps=true&geometries=geojson&access_token=${MAPBOX_TOKEN}`
            );
            const json = await query.json();
            const data = json.routes[0];
            const route = data.geometry.coordinates;

            const geojson = {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: route
                }
            };
            setRouteGeoJSON(geojson);

            // Fit Bounds
            if (mapRef.current) {
                const bounds = new mapboxgl.LngLatBounds();
                bounds.extend(start as [number, number]);
                bounds.extend(destination as [number, number]);

                mapRef.current.fitBounds(bounds, {
                    padding: 50,
                    duration: 1000
                });
            }
        };

        fetchRoute();
    }, [driverLocation, order]);

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

    const getStatusText = () => {
        switch (order?.status) {
            case 'pending': return 'Esperando confirmación del restaurante...';
            case 'accepted': return '¡Tu pedido ha sido aceptado! Repartidor en camino al restaurante.';
            case 'picked_up': return '¡Tu pedido va en camino! El repartidor se dirige a tu ubicación.';
            case 'delivered': return '¡Pedido entregado! Disfruta tu comida.';
            default: return 'Procesando tu pedido...';
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-gray-50 rounded-xl overflow-hidden shadow-lg border border-gray-200">
            {/* Map Section */}
            <div className="h-72 w-full relative">
                <Map
                    ref={mapRef}
                    initialViewState={viewState}
                    style={{ width: '100%', height: '100%' }}
                    mapStyle="mapbox://styles/mapbox/streets-v11"
                    mapboxAccessToken={MAPBOX_TOKEN}
                >
                    {/* Route Line */}
                    {routeGeoJSON && (
                        <Source id="route" type="geojson" data={routeGeoJSON}>
                            <Layer
                                id="route"
                                type="line"
                                source="route"
                                layout={{
                                    'line-join': 'round',
                                    'line-cap': 'round'
                                }}
                                paint={{
                                    'line-color': '#3b82f6',
                                    'line-width': 4,
                                    'line-opacity': 0.8
                                }}
                            />
                        </Source>
                    )}

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
                            <div className="bg-white p-2 rounded-full shadow-md border-2 border-blue-500 animate-bounce flex items-center justify-center transform transition-all duration-1000 ease-linear">
                                <FaMotorcycle size={24} color="#3b82f6" />
                            </div>
                        </Marker>
                    )}
                </Map>

                {/* Overlay Status */}
                <div className="absolute top-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-100 animate-fade-in-down">
                    <h3 className="font-bold text-gray-800 text-sm text-center">
                        {getStatusText()}
                    </h3>
                </div>
            </div>

            {/* Timeline Section */}
            <div className="p-6 bg-white">
                <div className="flex justify-between items-center relative mb-8">
                    {/* Progress Bar Background */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-0 rounded-full"></div>
                    {/* Progress Bar Active */}
                    <div
                        className="absolute top-1/2 left-0 h-1 bg-green-500 -z-0 transition-all duration-1000 rounded-full"
                        style={{ width: `${(currentStep / 3) * 100}%` }}
                    ></div>

                    {/* Steps */}
                    {['Confirmado', 'Preparando', 'En Camino', 'Entregado'].map((step, index) => (
                        <div key={index} className="flex flex-col items-center z-10 bg-white px-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${index <= currentStep ? 'bg-green-500 border-green-500 text-white scale-110 shadow-md' : 'bg-white border-gray-200 text-gray-300'
                                }`}>
                                {index < currentStep ? <FaCheckCircle /> : index === currentStep ? <MdDeliveryDining /> : <span className="text-xs font-bold">{index + 1}</span>}
                            </div>
                            <span className={`text-[10px] mt-2 font-bold uppercase tracking-wide ${index <= currentStep ? 'text-green-600' : 'text-gray-300'}`}>
                                {step}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Driver Info & ETA */}
                <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center border-2 border-white shadow-sm">
                            {driverProfile?.avatar ? (
                                <img src={driverProfile.avatar} alt="Repartidor" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-gray-400">
                                    <FaUser />
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Tu Repartidor</p>
                            <p className="font-bold text-gray-800">
                                {driverProfile?.full_name || (order?.driver_id ? 'Asignado' : 'Buscando...')}
                            </p>
                            {driverProfile?.phone && (
                                <div className="flex items-center text-xs text-blue-600 font-medium mt-0.5">
                                    <span className="mr-1">
                                        <FaPhone size={10} />
                                    </span>
                                    <span>{driverProfile.phone}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Llegada</p>
                        <p className="text-xl font-black text-gray-800">
                            {order?.status === 'delivered' ? 'Listo' : '15-25 min'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
