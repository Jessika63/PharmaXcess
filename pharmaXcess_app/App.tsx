
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigation from './navigations/RootNavigation';
import { ThemeProvider } from './context/ThemeContext';
import { FontScaleProvider } from './context/FontScaleContext';
import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import { useCORSRegistration } from './hooks/useCORSRegistration';
import CORSLoadingScreen from './components/CORSLoadingScreen';

// Composant interne pour gérer l'enregistrement CORS
function AppWithCORS(): React.JSX.Element {
    const { isRegistered, isLoading, error, retry } = useCORSRegistration();

    // Afficher l'écran de chargement pendant l'enregistrement CORS
    if (isLoading || !isRegistered) {
        return (
            <CORSLoadingScreen
                isLoading={isLoading}
                error={error}
                onRetry={retry}
            />
        );
    }

    // Une fois l'enregistrement CORS réussi, afficher l'application normale
    return (
        <ThemeProvider>
            <FontScaleProvider>
                <AuthProvider>
                    <ProfileProvider>
                        <GestureHandlerRootView style={{ flex: 1 }}>
                            <RootNavigation />
                        </GestureHandlerRootView>
                    </ProfileProvider>
                </AuthProvider>
            </FontScaleProvider>
        </ThemeProvider>
    );
}

// App component serves as the root of the application, providing all context providers and the root navigation
export default function App(): React.JSX.Element {
    return <AppWithCORS />;
}
