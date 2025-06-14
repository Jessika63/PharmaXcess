/**
 * App.tsx
 * 
 * Entry point of the mobile application.
 * 
 * Handles:
 * - Splash screen display during initial loading
 * - Internationalization setup with i18next
 * - Language context management
 * - Accessibility context setup
 * - Application navigation
 */

import { View } from 'react-native';
import { useState } from 'react';
import { registerRootComponent } from 'expo';
import SplashScreenComponent from './src/screens/SplashScreen';
import RootNavigator from './src/navigation/RootNavigator';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/src/locales/i18n';
import { LanguageProvider } from '@/src/context/LanguageContext';
import { AccessibilityProvider } from '@/src/accessibility/accessibilityContext';

/**
 * App Component
 * 
 * - Displays the splash screen while the app is initializing.
 * - Provides global providers for internationalization, language management, and accessibility.
 * - Loads the main application navigator once ready.
 * 
 * @returns {JSX.Element} The root component of the mobile app.
 */
export default function App () {
    const [appReady, setAppReady] = useState(false);

    if (!appReady) {
        /**
         * SplashScreenComponent is displayed until the onReady callback is called.
         * This typically allows time for initial setup or loading tasks.
         */
        return <SplashScreenComponent onReady={() => setAppReady(true)} />;
    }

    return (
        <I18nextProvider i18n={i18n}>
            <LanguageProvider>
                <AccessibilityProvider>
                    <RootNavigator />
                </AccessibilityProvider>
            </LanguageProvider>
        </I18nextProvider>
    );
};

/**
 * Registers the App component as the root of the Expo project.
 */
registerRootComponent(App);
