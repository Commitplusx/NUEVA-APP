import { useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { reverseGeocode } from '../services/api';
import { Profile } from '../types';

interface NativeMapPlugin {
  pickLocation(options: { initialPosition?: { latitude: number; longitude: number } }): Promise<{ latitude: number; longitude: number; address: string }>;
}

interface UseServiceLocationPickerProps {
  userProfile: Profile | null;
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  setBottomNavVisible: (visible: boolean) => void;
}

export const useServiceLocationPicker = ({
  userProfile,
  showToast,
  setBottomNavVisible,
}: UseServiceLocationPickerProps) => {
  const [origin, setOrigin] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showOriginMapPicker, setShowOriginMapPicker] = useState(false);
  const [showDestinationMapPicker, setShowDestinationMapPicker] = useState(false);
  const [initialOriginLocation, setInitialOriginLocation] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [initialDestinationLocation, setInitialDestinationLocation] = useState<{ lat: number; lng: number } | undefined>(undefined);

  const handleUseProfileAddress = useCallback(() => {
    if (userProfile) {
      const formattedAddress = [userProfile.street_address, userProfile.neighborhood, userProfile.city, userProfile.postal_code].filter(Boolean).join(', ');
      if (formattedAddress && userProfile.lat && userProfile.lng) {
        setOrigin(formattedAddress);
        setOriginCoords({ lat: userProfile.lat, lng: userProfile.lng });
        setInitialOriginLocation({ lat: userProfile.lat, lng: userProfile.lng });
        showToast('Dirección de origen establecida desde tu perfil.', 'success');
      } else {
        showToast('No tienes una dirección completa guardada en tu perfil.', 'info');
      }
    }
  }, [userProfile, showToast]);

  const handleGetCurrentLocation = useCallback(async () => {
    try {
      const position = await Geolocation.getCurrentPosition();
      const { latitude, longitude } = position.coords;
      const address = await reverseGeocode(latitude, longitude);
      if (address) {
        setOrigin(address);
        setOriginCoords({ lat: latitude, lng: longitude });
        setInitialOriginLocation({ lat: latitude, lng: longitude });
        showToast('Ubicación actual obtenida.', 'success');
      } else {
        showToast('No se pudo encontrar una dirección para tu ubicación.', 'error');
      }
    } catch (error) {
      showToast('No se pudo obtener la ubicación. Asegúrate de tener los permisos activados.', 'error');
    }
  }, [showToast]);

  const handleMapPick = useCallback(async (type: 'origin' | 'destination') => {
    const isNative = Capacitor.getPlatform() !== 'web';

    if (isNative) {
      try {
        console.log('[DEBUG] Intentando acceder al plugin NativeMap...');

        const NativeMap = ((Capacitor as any).Plugins.NativeMap as NativeMapPlugin);
        console.log('[DEBUG] NativeMap plugin:', NativeMap);

        const currentCoords = type === 'origin' ? originCoords : destinationCoords;
        console.log('[DEBUG] Llamando a pickLocation con coords:', currentCoords);

        const result = await NativeMap.pickLocation({
          initialPosition: currentCoords ? { latitude: currentCoords.lat, longitude: currentCoords.lng } : undefined
        });

        console.log('[DEBUG] Resultado de pickLocation:', result);

        if (result && result.latitude && result.longitude) {
          if (type === 'origin') {
            setOrigin(result.address);
            setOriginCoords({ lat: result.latitude, lng: result.longitude });
          } else {
            setDestination(result.address);
            setDestinationCoords({ lat: result.latitude, lng: result.longitude });
          }
          showToast('Ubicación seleccionada con éxito', 'success');
        }
      } catch (err: any) {
        console.error('[DEBUG] Error en handleMapPick:', err);
        if (err.message !== 'Action canceled by user.' && err.message !== 'pickLocation canceled.') {
          showToast(err.message || 'No se pudo abrir el mapa nativo.', 'error');
        }
      }
    } else {
      if (type === 'origin') {
        setInitialOriginLocation(originCoords || undefined);
        setBottomNavVisible(false);
        setShowOriginMapPicker(true);
      } else {
        setInitialDestinationLocation(destinationCoords || undefined);
        setBottomNavVisible(false);
        setShowDestinationMapPicker(true);
      }
    }
  }, [originCoords, destinationCoords, showToast, setBottomNavVisible]);

  const handleConfirmOrigin = useCallback((address: string, lat: number, lng: number) => {
    setOrigin(address);
    setOriginCoords({ lat, lng });
    setShowOriginMapPicker(false);
    setBottomNavVisible(true);
  }, [setBottomNavVisible]);

  const handleConfirmDestination = useCallback((address: string, lat: number, lng: number) => {
    setDestination(address);
    setDestinationCoords({ lat, lng });
    setShowDestinationMapPicker(false);
    setBottomNavVisible(true);
  }, [setBottomNavVisible]);

  return {
    origin, setOrigin,
    destination, setDestination,
    originCoords, setOriginCoords,
    destinationCoords, setDestinationCoords, // Exportar las coordenadas de destino
    showOriginMapPicker, setShowOriginMapPicker,
    showDestinationMapPicker, setShowDestinationMapPicker,
    initialOriginLocation, setInitialOriginLocation,
    initialDestinationLocation, setInitialDestinationLocation,
    handleUseProfileAddress,
    handleGetCurrentLocation,
    handleMapPick,
    handleConfirmOrigin,
    handleConfirmDestination,
  };
};
