import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigation from './navigations/RootNavigation';
import { ThemeProvider } from './context/ThemeContext';
import { FontScaleProvider } from './context/FontScaleContext';
import { AuthProvider } from './context/AuthContext';

// App component serves as the root of the application, providing all context providers and the root navigation
export default function App(): React.JSX.Element {
    return (
        <ThemeProvider>
            <FontScaleProvider>
                <AuthProvider>
                    <GestureHandlerRootView style={{ flex: 1 }}>
                        <RootNavigation />
                    </GestureHandlerRootView>
                </AuthProvider>
            </FontScaleProvider>
        </ThemeProvider>
    );
}