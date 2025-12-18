
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigation from './navigations/RootNavigation';
import { ThemeProvider } from './context/ThemeContext';
import { FontScaleProvider } from './context/FontScaleContext';
import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import { useCORSRegistration } from './hooks/useCORSRegistration';
import CORSLoadingScreen from './components/CORSLoadingScreen';
import './utils/i18n';
import documentsApi from './utils/api/documents';
import config from './config';
// Use legacy FileSystem for backward-compatible directory constants and helpers
import * as FileSystem from 'expo-file-system/legacy';
import { useProfile } from './context/ProfileContext';

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

                <AuthProvider>
                    <ProfileProvider>
                        <PreloadManager />
                        <GestureHandlerRootView style={{ flex: 1 }}>
                            <RootNavigation />
                        </GestureHandlerRootView>
                    </ProfileProvider>
                </AuthProvider>

    );
}

// Component that preloads documents for the current profile into the app cache
function PreloadManager(): null {
    const { currentProfile } = useProfile();

    React.useEffect(() => {
        let mounted = true;
        const prefetch = async () => {
            try {
                if (!currentProfile || !currentProfile.id) return;
                const res = await documentsApi.getDocuments(currentProfile.id as any);
                if (!res || !res.ok || !Array.isArray(res.data)) return;

                for (const d of res.data) {
                    if (!mounted) break;
                    const docId = d.id;
                    const filename = (d.filename || d.title || `document_${docId}`).toString().replace(/[^a-z0-9.\-_]/gi, '_');
                    const url = `${config.backendUrl.replace(/\/$/, '')}/documents/${currentProfile.id}/${docId}`;
                    const localPath = `${FileSystem.cacheDirectory}${filename}`;

                    try {
                        const info = await FileSystem.getInfoAsync(localPath);
                        if (!info.exists) {
                            // best-effort download; failures are non-fatal
                            await FileSystem.downloadAsync(url, localPath).catch(() => null);
                        }
                    } catch (e) {
                        // ignore per-file errors
                        // console.warn('Prefetch error for', url, e);
                    }
                }
            } catch (err) {
                // silent fail; prefetch should not block the app
                // console.warn('Prefetch manager failed', err);
            }
        };

        prefetch();
        return () => { mounted = false; };
    }, [currentProfile?.id]);

    return null;
}

// App component serves as the root of the application, providing all context providers and the root navigation
export default function App(): React.JSX.Element {
    return (
        <ThemeProvider>
            <FontScaleProvider>
                <AppWithCORS />
            </FontScaleProvider>
        </ThemeProvider>
    );
}
