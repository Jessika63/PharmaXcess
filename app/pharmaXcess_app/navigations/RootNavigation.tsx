import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AuthNavigation from './AuthNavigation';
import AppNavigation from './AppNavigation';

export default function RootNavigation(): React.JSX.Element {
    const { isAuthenticated, isLoading } = useAuth();
    const { colors } = useTheme();

    if (isLoading) {
        return (
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: colors.background
            }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {isAuthenticated ? <AppNavigation /> : <AuthNavigation />}
        </NavigationContainer>
    );
}
