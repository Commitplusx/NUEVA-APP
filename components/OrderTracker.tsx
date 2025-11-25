import React, { useEffect, useState, useRef } from 'react';
import Map, { Marker, Source, Layer, MapRef } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '../services/supabase';
import { FaMotorcycle, FaStore, FaMapMarkerAlt, FaPhoneAlt, FaUser, FaStar, FaCheckCircle, FaPhone } from 'react-icons/fa';
import { MdDeliveryDining } from 'react-icons/md';
import { Profile } from '../types';
import mapboxgl from 'mapbox-gl';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderTrackerProps {
    orderId: number;
    onFinish?: () => void;
}

import { useAppContext } from '../context/AppContext';

export const OrderTracker: React.FC<OrderTrackerProps> = ({ orderId, onFinish }) => {
    const { setBottomNavVisible } = useAppContext();
    const [order, setOrder] = useState<any>(null);
    const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [driverProfile, setDriverProfile] = useState<Profile | null>(null);
    const [routeGeoJSON, setRouteGeoJSON] = useState<any>(null);
    const [isFinishing, setIsFinishing] = useState(false);
    const mapRef = useRef<MapRef>(null);

    useEffect(() => {
        setBottomNavVisible(false);
        return () => setBottomNavVisible(true);
    }, [setBottomNavVisible]);

    // Fetch Order Data
    useEffect(() => {
        const fetchOrder = async () => {
            const { data, error } = await supabase
                .from('orders')
                .select('*, restaurants(name, image_url)')
                .eq('id', orderId)
                .single();

            if (data) setOrder(data);
        };

        fetchOrder();
        const interval = setInterval(fetchOrder, 5000); // Polling every 5s
        return () => clearInterval(interval);
    }, [orderId]);

    // Fetch Driver Location & Profile
    useEffect(() => {
        if (!order?.driver_id) return;

        const fetchDriverData = async () => {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('user_id', order.driver_id)
                    .limit(1);

                if (error) return;

                const profile = data && data.length > 0 ? data[0] : null;

                if (profile) {
                    setDriverProfile(profile);
                    if (profile.lat && profile.lng) {
                        setDriverLocation({ lat: profile.lat, lng: profile.lng });
                    }
                }
            } catch (err) {
                console.error('Unexpected error fetching driver:', err);
            }
        };

        fetchDriverData();
        const interval = setInterval(fetchDriverData, 10000); // Polling every 10s
        return () => clearInterval(interval);
    }, [order?.driver_id]);

    // Update map bounds to fit all markers
    useEffect(() => {
        if (!mapRef.current || !order) return;

        // Don't auto-fit if delivered (animation) or on_way/pickup (follow driver)
        if (order.status === 'delivered' || order.status === 'on_way' || order.status === 'pickup') return;

        const bounds = new mapboxgl.LngLatBounds();

        if (order.origin_lng && order.origin_lat) {
            bounds.extend([order.origin_lng, order.origin_lat]);
        }
        if (order.destination_lng && order.destination_lat) {
            bounds.extend([order.destination_lng, order.destination_lat]);
        }
        if (driverLocation) {
            bounds.extend([driverLocation.lng, driverLocation.lat]);
        }

        if (!bounds.isEmpty()) {
            mapRef.current.fitBounds(bounds, { padding: 70, maxZoom: 15, duration: 1000 });
        }
    }, [order, driverLocation]);

    // Fetch Route
    useEffect(() => {
        if (!order || !order.origin_lng || !order.origin_lat || !order.destination_lng || !order.destination_lat) return;

        const fetchRoute = async () => {
            try {
                let start = [order.origin_lng, order.origin_lat];
                let end = [order.destination_lng, order.destination_lat];

                // If driver is assigned and location is available
                if (driverLocation) {
                    start = [driverLocation.lng, driverLocation.lat];

                    // If order is NOT picked up yet (accepted, pending), route to Restaurant
                    if (order.status === 'accepted' || order.status === 'pending') {
                        end = [order.origin_lng, order.origin_lat];
                    }
                    // Otherwise (picked_up, on_way, delivered), route to Customer (default end)
                }

                const query = await fetch(
                    `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`
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
            } catch (error) {
                console.error('Error fetching route:', error);
            }
        };

        fetchRoute();
    }, [order, driverLocation]);


    // Map Animations based on status
    useEffect(() => {
        if (!mapRef.current || !order) return;

        if (order.status === 'delivered') {
            // Cinematic fly to customer
            mapRef.current.flyTo({
                center: [order.destination_lng, order.destination_lat],
                zoom: 17,
                pitch: 60,
                bearing: -20,
                duration: 3000,
                essential: true
            });
        } else if (order.status === 'accepted') {
            // Cinematic fly to restaurant
            mapRef.current.flyTo({
                center: [order.origin_lng, order.origin_lat],
                zoom: 16,
                pitch: 45,
                bearing: 20,
                duration: 2500,
                essential: true
            });
        } else if ((order.status === 'on_way' || order.status === 'pickup') && driverLocation) {
            // Follow driver
            mapRef.current.flyTo({
                center: [driverLocation.lng, driverLocation.lat],
                zoom: 14.5,
                pitch: 40,
                duration: 2000,
                essential: true
            });
        }
    }, [order?.status, driverLocation?.lat, driverLocation?.lng]);


    if (!order) return <div className="p-4 text-center">Cargando pedido...</div>;

    const getStatusStep = (status: string) => {
        switch (status) {
            case 'pending': return 0;
            case 'accepted': return 1;
            case 'pickup': return 2; // Note: 'pickup' might be 'picked_up' in DB, checking consistency
            case 'on_way': return 2;
            case 'picked_up': return 2;
            case 'delivered': return 3;
            default: return 0;
        }
    };

    const currentStep = order ? getStatusStep(order.status) : 0;

    const getStatusText = () => {
        switch (order?.status) {
            case 'pending': return '¡Tu pedido ha sido recibido! Esperando confirmación del restaurante.';
            case 'accepted': return 'El restaurante está preparando tu comida. 🍳';
            case 'picked_up': return '¡Tu repartidor ya tiene tu pedido! Va en camino. 🏍️💨';
            case 'on_way': return '¡Tu repartidor ya tiene tu pedido! Va en camino. 🏍️💨';
            case 'delivered': return '¡Llegamos! Tu pedido ha sido entregado. ¡Buen provecho! 😋';
            default: return 'Procesando tu pedido...';
        }
    };



    const handleFinish = () => {
        setIsFinishing(true);
        setTimeout(() => {
            if (onFinish) onFinish();
        }, 2500);
    };

    return (
        <div className="flex flex-col h-full w-full bg-white relative">
            {/* Success Overlay Animation */}
            <AnimatePresence>
                {isFinishing && (
                    <motion.div
                        initial={{ opacity: 0, y: '100%' }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="absolute inset-0 z-50 bg-gradient-to-br from-green-500 to-emerald-700 flex flex-col items-center justify-center text-white p-8 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                            className="bg-white text-green-600 p-6 rounded-full shadow-2xl mb-6"
                        >
                            <FaCheckCircle size={60} />
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="text-4xl font-black mb-2"
                        >
                            ¡Gracias por tu compra!
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="text-xl font-medium opacity-90"
                        >
                            Esperamos que disfrutes tu comida. 😋
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Map Section */}
            <div className="h-[60vh] w-full relative">
                <Map
                    ref={mapRef}
                    initialViewState={{
                        longitude: order.destination_lng || -99.1332,
                        latitude: order.destination_lat || 19.4326,
                        zoom: 13
                    }}
                    style={{ width: '100%', height: '100%' }}
                    mapStyle="mapbox://styles/mapbox/streets-v11"
                    mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
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
                                    'line-width': 5,
                                    'line-opacity': 0.75
                                }}
                            />
                        </Source>
                    )}

                    {/* Restaurant Marker */}
                    {order.origin_lat && order.origin_lng && (
                        <Marker latitude={order.origin_lat} longitude={order.origin_lng}>
                            <div className="relative group">
                                <div className="bg-white rounded-full shadow-lg border-2 border-orange-500 flex items-center justify-center w-12 h-12 overflow-hidden transform transition-transform duration-300 hover:scale-110">
                                    {/* @ts-ignore - Supabase join returns nested object */}
                                    {order.restaurants?.image_url ? (
                                        /* @ts-ignore */
                                        <img src={order.restaurants.image_url} alt="Restaurante" className="w-full h-full object-cover" />
                                    ) : (
                                        <FaStore size={20} color="orange" />
                                    )}
                                </div>
                                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    {/* @ts-ignore */}
                                    {order.restaurants?.name || 'Restaurante'}
                                </div>
                            </div>
                        </Marker>
                    )}

                    {/* Customer Marker */}
                    {order.destination_lat && order.destination_lng && (
                        <Marker latitude={order.destination_lat} longitude={order.destination_lng}>
                            <div className="bg-white p-2 rounded-full shadow-lg border-2 border-red-500">
                                <FaMapMarkerAlt size={24} color="red" />
                            </div>
                        </Marker>
                    )}

                    {/* Driver Marker */}
                    {driverLocation && (
                        <Marker latitude={driverLocation.lat} longitude={driverLocation.lng}>
                            <div className="relative group">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                                    className="relative z-20"
                                >
                                    <div className="bg-white p-1 rounded-full shadow-xl border-2 border-blue-600 relative">
                                        <FaMotorcycle size={24} color="#2563eb" />
                                    </div>
                                    <div className="absolute top-0 left-0 w-full h-full bg-blue-400 rounded-full animate-ping opacity-75"></div>
                                </motion.div>
                                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 text-xs font-bold px-3 py-1 rounded-full shadow-md border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30 pointer-events-none">
                                    {driverProfile?.full_name || 'Repartidor'}
                                </div>
                            </div>
                        </Marker>
                    )}
                </Map>
            </div>

            {/* Timeline Section */}
            <div className="flex-grow bg-white flex flex-col -mt-6 rounded-t-3xl relative z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <div className="p-6 flex flex-col h-full">
                    {/* Status Header */}
                    <div className="mb-6 text-center">
                        <h2 className="text-xl font-extrabold text-gray-800 mb-1">
                            {order?.status === 'pending' && 'Confirmando tu pedido'}
                            {order?.status === 'accepted' && 'Preparando tu comida'}
                            {(order?.status === 'picked_up' || order?.status === 'on_way') && 'Tu pedido va en camino'}
                            {order?.status === 'delivered' && '¡Pedido entregado!'}
                        </h2>
                        <p className="text-sm text-gray-500 font-medium">
                            {getStatusText()}
                        </p>
                    </div>

                    <div className="flex justify-between items-center relative mb-8">
                        {/* Progress Bar Background */}
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-0 rounded-full"></div>
                        {/* Progress Bar Active */}
                        <div
                            className="absolute top-1/2 left-0 h-1 bg-green-500 -z-0 transition-all duration-1000 rounded-full"
                            style={{ width: `${(currentStep / 3) * 100}%` }}
                        ></div>

                        {/* Steps Icons Only */}
                        {['Confirmado', 'Preparando', 'En Camino', 'Entregado'].map((step, index) => (
                            <div key={index} className="flex flex-col items-center z-10 bg-white px-1">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${index <= currentStep ? 'bg-green-500 border-green-500 text-white scale-110 shadow-md' : 'bg-white border-gray-200 text-gray-300'
                                    }`}>
                                    {index === 0 && <FaCheckCircle size={14} />}
                                    {index === 1 && <FaStore size={14} />}
                                    {index === 2 && <FaMotorcycle size={14} />}
                                    {index === 3 && <MdDeliveryDining size={16} />}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Driver Info & ETA */}
                    <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 flex items-center justify-between mb-6 shadow-sm">
                        <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border-2 border-white shadow-md">
                                {driverProfile?.avatar_url ? (
                                    <img src={driverProfile.avatar_url} alt="Repartidor" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-gray-400">
                                        <FaUser size={20} />
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Tu Repartidor</p>
                                <p className="font-bold text-gray-800 text-lg leading-tight">
                                    {driverProfile?.full_name || (order?.driver_id ? 'Asignado' : 'Buscando...')}
                                </p>
                                {driverProfile?.phone && (
                                    <a href={`tel:${driverProfile.phone}`} className="inline-flex items-center gap-2 text-sm text-blue-600 font-semibold mt-1 hover:text-blue-700 transition-colors bg-blue-50 px-2 py-1 rounded-lg">
                                        <FaPhone size={12} />
                                        <span>{driverProfile.phone}</span>
                                    </a>
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

                    {/* Finish Button - Only when delivered */}
                    <AnimatePresence>
                        {order.status === 'delivered' && (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="flex justify-center mt-4"
                            >
                                <button
                                    onClick={handleFinish}
                                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 px-10 rounded-xl shadow-xl shadow-green-500/30 hover:shadow-green-500/50 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3 text-lg"
                                >
                                    <span className="text-2xl"><FaCheckCircle /></span>
                                    <span>Finalizar y Salir</span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
