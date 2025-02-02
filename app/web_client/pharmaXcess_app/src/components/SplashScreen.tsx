import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

interface SplashScreenProps {
    onReady: () => void;
}

export default function SplashScreenComponent({ onReady } : SplashScreenProps) {

    useEffect(() => {
        SplashScreen.preventAutoHideAsync();

        const loadRessources = async () => {
            SplashScreen.hideAsync();
            onReady();
        };
        loadRessources();
    }, [onReady]);
    
    return null;
}