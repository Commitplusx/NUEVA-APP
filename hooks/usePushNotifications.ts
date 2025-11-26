import { useEffect, useState } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../services/supabase';

export const usePushNotifications = () => {
    const { user } = useAppContext();
    const [fcmToken, setFcmToken] = useState<string | null>(null);

    useEffect(() => {
        if (!Capacitor.isNativePlatform()) {
            return;
        }

        const addListeners = async () => {
            await PushNotifications.addListener('registration', token => {
                console.log('Push registration success, token: ' + token.value);
                setFcmToken(token.value);
            });

            await PushNotifications.addListener('registrationError', err => {
                console.error('Push registration error: ', err.error);
            });

            await PushNotifications.addListener('pushNotificationReceived', notification => {
                console.log('Push notification received: ', notification);
            });

            await PushNotifications.addListener('pushNotificationActionPerformed', notification => {
                console.log('Push notification action performed', notification.actionId, notification.inputValue);
            });
        };

        const registerNotifications = async () => {
            let permStatus = await PushNotifications.checkPermissions();

            if (permStatus.receive === 'prompt') {
                permStatus = await PushNotifications.requestPermissions();
            }

            if (permStatus.receive !== 'granted') {
                console.log('User denied permissions!');
                return;
            }

            await PushNotifications.register();
        };

        addListeners();
        registerNotifications();

        return () => {
            if (Capacitor.isNativePlatform()) {
                PushNotifications.removeAllListeners();
            }
        };
    }, []);

    // Sync token with Supabase when user logs in or token changes
    useEffect(() => {
        const saveTokenToSupabase = async () => {
            if (user && fcmToken) {
                const { error } = await supabase
                    .from('profiles')
                    .update({ fcm_token: fcmToken })
                    .eq('user_id', user.id);

                if (error) {
                    console.error('Error saving FCM token:', error);
                } else {
                    console.log('FCM token saved to profile successfully');
                }
            }
        };

        saveTokenToSupabase();
    }, [user, fcmToken]);
};
