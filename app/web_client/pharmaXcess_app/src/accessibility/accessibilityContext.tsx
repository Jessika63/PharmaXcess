/**
 * Accessibility Context Setup
 * This file wraps the application with all accessibility-related providers:
 * - Screen Reader Context
 * - Font Scaling Context
 * - Theme Context
 */

import React, { createContext, useContext } from 'react';
import { ScreenReaderProvider } from '@/src/context/ScreenReaderContext';
import { FontScaleProvider } from '@/src/context/FontScaleContext';
import { ThemeProvider } from '@/src/context/ThemeContext';

const AccessibilityContext = createContext(null);

/**
 * AccessibilityProvider
 * Wraps the app with all necessary accessibility providers.
 * 
 * @param {Object} props - React props.
 * @param {React.ReactNode} props.children - Components to be wrapped with accessibility providers.
 * @returns {JSX.Element} The provider-wrapped components.
 */
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
