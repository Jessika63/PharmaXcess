import { NavigationContainer } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import AppNavigator from './AppNavigator';
import AuthNavigator from './AuthNavigator';

// import { useTheme } from '../styles/Theme';
// import { useLanguage } from '@/src/context/LanguageContext';

export default function RootNavigator() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // const { language, setLanguage } = useLanguage();
    // const { selectedTheme, setSelectedTheme } = useTheme();

    // useEffect(() => {
    //     setLanguage('auto');
    //     setSelectedTheme('auto');
    // }, []);

    return (
        <NavigationContainer>
            {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    );
}
