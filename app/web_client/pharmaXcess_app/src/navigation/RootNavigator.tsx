import { NavigationContainer } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import AppNavigator from './AppNavigator';
import AuthNavigator from './AuthNavigator';

// import { useTheme } from '@/src/context/ThemeContext';
// import { useLanguage } from '@/src/context/LanguageContext';
// import { useFontScale } from '../context/FontScaleContext';

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
