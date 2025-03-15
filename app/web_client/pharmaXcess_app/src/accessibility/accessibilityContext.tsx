import React, { createContext, useContext } from 'react';
import { ScreenReaderProvider } from '@/src/context/ScreenReaderContext';
import { FontScaleProvider } from '@/src/context/FontScaleContext';
import { ThemeProvider } from '@/src/context/ThemeContext';

const AccessibilityContext = createContext(null);

export const AccessibilityProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ScreenReaderProvider>
      <FontScaleProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </FontScaleProvider>
    </ScreenReaderProvider>
  );
};

export const useAccessibility = () => useContext(AccessibilityContext);
