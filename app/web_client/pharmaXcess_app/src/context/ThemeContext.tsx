/**
 * ThemeContext
 * 
 * Provides a React Context to manage application themes, including support for light, dark, and color-blind modes.
 * Supports system theme detection, manual theme selection, and persistent storage with AsyncStorage.
 */

import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/src/styles/Colors';
import { PaperProvider, MD3LightTheme, MD3DarkTheme, MD3Theme } from 'react-native-paper';

/**
 * Supported theme names.
 * @typedef {'auto' | 'light' | 'dark' | 'colorBlindLight' | 'colorBlindDark'} ThemeName
 */
type ThemeName = 'auto' | 'light' | 'dark' | 'colorBlindLight' | 'colorBlindDark';

/**
 * The structure of the theme context.
 * @typedef {Object} ThemeType
 * @property {MD3Theme['colors']} colors - The color palette of the current theme.
 * @property {ThemeName} selectedTheme - The selected theme name.
 * @property {(theme: ThemeName) => void} setSelectedTheme - Function to update the theme.
 */
interface ThemeType {
    colors: MD3Theme['colors'];
    selectedTheme: ThemeName;
    setSelectedTheme: (theme: ThemeName) => void;
}


const ThemeContext = createContext<ThemeType>({
    colors: MD3LightTheme.colors,
    selectedTheme: 'auto',
    setSelectedTheme: () => {},
});

/**
 * Provides the theme context to child components.
 * Handles loading and persisting the selected theme.
 * Integrates React Native Paper for theme application.
 *
 * @param {{ children: React.ReactNode }} props - The child components.
 * @returns {JSX.Element} The context and Paper provider.
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const colorScheme = useColorScheme();
    const [selectedTheme, setSelectedTheme] = useState<ThemeName>('auto');

    useEffect(() => {
        /**
         * Loads the saved theme from AsyncStorage when the component mounts.
         * Defaults to 'auto' if no theme is stored.
         */
        const loadTheme = async () => {
            const storedTheme = await AsyncStorage.getItem('selectedTheme') as ThemeName | null;
            if (storedTheme) {
                setSelectedTheme(storedTheme);
            }
        };
        loadTheme();
    }, []);

    /**
     * Updates the theme and saves the selection in AsyncStorage.
     *
     * @param {ThemeName} theme - The new theme to apply.
     */
    const changeTheme = async (theme: ThemeName) => {
        setSelectedTheme(theme);
        await AsyncStorage.setItem('selectedTheme', theme);
    };

    /**
     * Determines the active theme name based on the selection and system preference.
     */
    const activeThemeName: ThemeName = selectedTheme === 'auto' ? (colorScheme === 'dark' ? 'dark' : 'light') : selectedTheme;

    /**
     * Computes the theme object, merging base colors with custom colors for the selected theme.
     */
    const theme: MD3Theme = useMemo(() => {
        const baseTheme = activeThemeName.includes('dark') ? MD3DarkTheme : MD3LightTheme;

        return {
            ...baseTheme,
            colors: {
                ...baseTheme.colors,
                ...Colors[activeThemeName],
            },
        };
    }, [activeThemeName]);
    return (
        <ThemeContext.Provider value={{ colors: theme.colors, selectedTheme, setSelectedTheme: changeTheme }}>
            <PaperProvider theme={theme}>
                {children}
            </PaperProvider>
        </ThemeContext.Provider>
    );
};

/**
 * Custom hook to access the theme context.
 * Must be used within a ThemeProvider.
 *
 * @returns {ThemeType} The theme context.
 * @throws {Error} If used outside a ThemeProvider.
 */
export const useTheme = (): ThemeType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
