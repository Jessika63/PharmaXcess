import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigation from './AppNavigation';

// App component serves as the root of the application, wrapping the AppNavigation component in a GestureHandlerRootView to enable gesture handling across the app, ensuring a smooth user experience with touch interactions.
export default function App(): JSX.Element {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <AppNavigation />
        </GestureHandlerRootView>
    );
}