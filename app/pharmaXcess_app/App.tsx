import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigation from './AppNavigation';

export default function App(): JSX.Element {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <AppNavigation />
        </GestureHandlerRootView>
    );
}