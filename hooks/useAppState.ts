import { useEffect, useState } from 'react';
import { App, AppState } from '@capacitor/app';
import { PluginListenerHandle } from '@capacitor/core';

export const useAppState = (onForeground?: () => void) => {
    const [appState, setAppState] = useState<AppState>({ isActive: true });

    useEffect(() => {
        let handle: PluginListenerHandle;

        const setupListener = async () => {
            handle = await App.addListener('appStateChange', (state) => {
                if (!appState.isActive && state.isActive) {
                    // App came to foreground
                    if (onForeground) {
                        onForeground();
                    }
                }
                setAppState(state);
            });
        };

        setupListener();

        return () => {
            if (handle) {
                handle.remove();
            }
        };
    }, [onForeground, appState.isActive]);

    return appState;
};
