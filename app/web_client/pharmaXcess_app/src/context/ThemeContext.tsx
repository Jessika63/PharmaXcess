import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/src/styles/Colors';
import { PaperProvider, MD3LightTheme, MD3DarkTheme, MD3Theme } from 'react-native-paper';

type ThemeName = 'auto' | 'light' | 'dark' | 'colorBlindLight' | 'colorBlindDark';

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

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const colorScheme = useColorScheme();
    const [selectedTheme, setSelectedTheme] = useState<ThemeName>('auto');

    useEffect(() => {
        const loadTheme = async () => {
            const storedTheme = await AsyncStorage.getItem('selectedTheme') as ThemeName | null;
            if (storedTheme) {
                setSelectedTheme(storedTheme);
            }
        };
        loadTheme();
    }, []);

    const changeTheme = async (theme: ThemeName) => {
        setSelectedTheme(theme);
        await AsyncStorage.setItem('selectedTheme', theme);
    };

    const activeThemeName: ThemeName = selectedTheme === 'auto' ? (colorScheme === 'dark' ? 'dark' : 'light') : selectedTheme;

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

export const useTheme = (): ThemeType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
