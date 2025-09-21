import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { Colors, ColorScheme } from '../styles/Colors';

export type ThemeType = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: ThemeType;
  colors: ColorScheme;
  setTheme: (theme: ThemeType) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  // for the moment, the theme is set to 'auto' only
  const theme: ThemeType = 'auto';
  
  // code to allow manual theme change (to be reactivated later)
  // const [theme, setTheme] = useState<ThemeType>('auto');
  // const setTheme = (newTheme: ThemeType) => {
  //   setTheme(newTheme);
  // };
  
  // placeholder function for setTheme (to maintain compatibility)
  const setTheme = (newTheme: ThemeType) => {
    console.log('Changement de thème désactivé pour le moment. Thème demandé:', newTheme);
    // this function does nothing for now
  };
  
  // determine the effective theme based on user choice and system
  const getEffectiveTheme = (): 'light' | 'dark' => {
    // in 'auto' mode, we always follow the system
    return systemColorScheme === 'dark' ? 'dark' : 'light';
    
    // original code (to be reactivated later)
    // if (theme === 'auto') {
    //   return systemColorScheme === 'dark' ? 'dark' : 'light';
    // }
    // return theme;
  };
  
  const effectiveTheme = getEffectiveTheme();
  const colors = Colors[effectiveTheme];
  const isDark = effectiveTheme === 'dark';
  
  const value: ThemeContextType = {
    theme,
    colors,
    setTheme,
    isDark,
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
