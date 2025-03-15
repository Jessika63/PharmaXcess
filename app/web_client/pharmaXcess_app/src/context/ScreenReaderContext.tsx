import React, { createContext, useContext } from "react";
import { AccessibilityInfo } from "react-native";

const ScreenReaderContext = createContext<(message: string) => void>(() => {});

export const ScreenReaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const announce = (message: string) => {
        AccessibilityInfo.announceForAccessibility(message);
    };
    return (
        <ScreenReaderContext.Provider value={announce}>
            {children}
        </ScreenReaderContext.Provider>
    );
};

export const useScreenReader = () => {
    const context = useContext(ScreenReaderContext);
    if (!context) {
        throw new Error("useScreenReader must be used within a ScreenReaderProvider");
    }
    return context;
};