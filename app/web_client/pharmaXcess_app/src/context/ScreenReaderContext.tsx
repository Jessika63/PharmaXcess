/**
 * ScreenReaderContext
 * 
 * Provides a React Context to announce accessibility messages for screen readers.
 * Useful for providing verbal feedback for accessibility users.
 */

import React, { createContext, useContext } from "react";
import { AccessibilityInfo } from "react-native";

/**
 * The context provides a function to announce messages for screen readers.
 * @typedef {(message: string) => void} ScreenReaderAnnounce
 */
const ScreenReaderContext = createContext<(message: string) => void>(() => {});

/**
 * Provides the screen reader context to child components.
 * Wraps the announceForAccessibility function from React Native.
 *
 * @param {{ children: React.ReactNode }} props - The child components.
 * @returns {JSX.Element} The context provider.
 */
export const ScreenReaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    /**
     * Announces a message to the screen reader.
     *
     * @param {string} message - The message to be read by the screen reader.
     */
    const announce = (message: string) => {
        AccessibilityInfo.announceForAccessibility(message);
    };
    return (
        <ScreenReaderContext.Provider value={announce}>
            {children}
        </ScreenReaderContext.Provider>
    );
};


/**
 * Custom hook to access the screen reader context.
 * Must be used within a ScreenReaderProvider.
 *
 * @returns {(message: string) => void} The announce function for the screen reader.
 * @throws {Error} If used outside a ScreenReaderProvider.
 */
export const useScreenReader = () => {
    const context = useContext(ScreenReaderContext);
    if (!context) {
        throw new Error("useScreenReader must be used within a ScreenReaderProvider");
    }
    return context;
};