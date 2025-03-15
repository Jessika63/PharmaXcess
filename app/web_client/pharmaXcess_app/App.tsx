import { View } from 'react-native';
import { useState } from 'react';
import { registerRootComponent } from 'expo';
import SplashScreenComponent from './src/screens/SplashScreen';
import RootNavigator from './src/navigation/RootNavigator';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/src/locales/i18n';
import { LanguageProvider } from '@/src/context/LanguageContext';
import { AccessibilityProvider } from '@/src/accessibility/accessibilityContext';


export default function App () {
    const [appReady, setAppReady] = useState(false);

    if (!appReady) {
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

registerRootComponent(App);
