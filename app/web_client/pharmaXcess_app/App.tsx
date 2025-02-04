import { View } from 'react-native';
import { useState } from 'react';
import { registerRootComponent } from 'expo';
import SplashScreenComponent from './src/screens/SplashScreen';
import RootNavigator from './src/navigation/RootNavigator';
import { ThemeProvider } from './src/styles/Theme';

export default function App () {
    const [appReady, setAppReady] = useState(false);

    if (!appReady) {
        return <SplashScreenComponent onReady={() => setAppReady(true)} />;
    }

    return (
    <ThemeProvider>
        <RootNavigator />
    </ThemeProvider>
    );
};

registerRootComponent(App);
