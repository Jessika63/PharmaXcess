import { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from './Colors';

interface ThemeType {
    colors: {
        primary: string;
        primaryLight: string;
        background: string;
        inputBackground: string;
        text: string;
        warning: string;
        success: string;
        disabled: string;
        selectionOpacity: number;
    };
}


const ThemeContext = createContext<ThemeType>({ colors: Colors.light });

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const colorScheme = useColorScheme() || 'light';
    const isDarkMode = colorScheme === 'dark';

    const theme = useMemo(() => ({
        colors: isDarkMode ? Colors.dark : Colors.light,
    }), [isDarkMode]);

    return (
        <ThemeContext.Provider value={theme}>
            {children}
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
