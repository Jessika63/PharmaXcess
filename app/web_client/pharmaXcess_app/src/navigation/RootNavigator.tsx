/**
 * RootNavigator
 * 
 * The root navigator that conditionally renders either the authenticated app flow or the authentication flow.
 * 
 * Features:
 * - Displays the main app if the user is authenticated.
 * - Displays the authentication screens if the user is not authenticated.
 * - Uses React Navigation's `NavigationContainer` to wrap the navigation tree.
 */

import { NavigationContainer } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import AppNavigator from './AppNavigator';
import AuthNavigator from './AuthNavigator';

// import { useTheme } from '@/src/context/ThemeContext';
// import { useLanguage } from '@/src/context/LanguageContext';
// import { useFontScale } from '../context/FontScaleContext';

/**
 * Determines which navigation stack to display based on the authentication state.
 * 
 * @returns {JSX.Element} The root navigation container.
 */
export default function RootNavigator() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // const { language, setLanguage } = useLanguage();
    // const { selectedTheme, setSelectedTheme } = useTheme();
    // const { selectedFontScale, setSelectedFontScale } = useFontScale();

    // useEffect(() => {
    //     setLanguage('auto');
    //     setSelectedTheme('auto');
    //     setSelectedFontScale('auto');
    // }, []);

    return (
        <NavigationContainer>
            {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    );
}
