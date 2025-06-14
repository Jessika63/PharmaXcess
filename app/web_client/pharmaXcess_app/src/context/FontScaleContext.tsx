/**
 * FontScaleContext
 * 
 * Provides a React Context to manage font scaling preferences across the application.
 * Supports automatic system scaling or manual scaling, with persistent storage using AsyncStorage.
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { PixelRatio } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Defines the available font scaling options.
 * Can be 'auto' (system default) or a specific numeric scale.
 * @typedef {'auto' | number} FontScaleOption
 */
type FontScaleOption = 'auto' | number;

/**
 * The structure of the font scaling context.
 * @typedef {Object} FontScaleContextType
 * @property {number} fontScale - The current font scaling factor.
 * @property {FontScaleOption} selectedFontScale - The selected font scaling option.
 * @property {(option: FontScaleOption) => void} setSelectedFontScale - Function to update the selected font scale.
 */
interface FontScaleContextType {
    fontScale: number;
    selectedFontScale: FontScaleOption;
    setSelectedFontScale: (option: FontScaleOption) => void;
}

const FontScaleContext = createContext<FontScaleContextType | undefined>(undefined);

/**
 * Provides the font scaling context to child components.
 * Handles loading and persisting the font scale selection.
 *
 * @param {{ children: React.ReactNode }} props - The child components.
 * @returns {JSX.Element} The context provider.
 */
export const FontScaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [selectedFontScale, setSelectedFontScaleState] = useState<FontScaleOption>('auto');

    useEffect(() => {
        /**
         * Loads the saved font scale from AsyncStorage when the component mounts.
         * If no value is found, defaults to 'auto'.
         */
        const loadFontScale = async () => {
            try {
                const storedValue = await AsyncStorage.getItem('selectedFontScale');
                if (storedValue !== null) {
                    if (storedValue === "auto") {
                        setSelectedFontScaleState("auto");
                    } else {
                        const parsedValue = parseFloat(storedValue);
                        setSelectedFontScaleState(isNaN(parsedValue) ? "auto" : parseFloat(storedValue));
                    }
                }
            } catch (error) {
                console.error("Error loading font size:", error);
            }
        };
        loadFontScale();
    }
    , []);

    /**
     * Updates the font scale and saves the selection in AsyncStorage.
     *
     * @param {FontScaleOption} option - The new font scale option.
     */
    const changeFontScale = async (option: FontScaleOption) => {
        try {
            if (option !== "auto" && (typeof option !== "number" || isNaN(option))) {
                throw new Error("Invalid font scale value. Must be 'auto' or a number.");
            }
            await AsyncStorage.setItem('selectedFontScale', option.toString());
            setSelectedFontScaleState(option);
        } catch (error) {
            console.error("Error saving font size:", error);
        }
    }

    /**
     * Computes the effective font scaling factor based on the selection.
     * If 'auto' is selected, returns 1 (default scale).
     */
    const fontScale = useMemo(() => {
        return selectedFontScale === 'auto' ? 1 : selectedFontScale / PixelRatio.getFontScale();
    }, [selectedFontScale]);

    return (
        <FontScaleContext.Provider value={{ fontScale, selectedFontScale, setSelectedFontScale: changeFontScale }}>
            {children}
        </FontScaleContext.Provider>
    );
};


/**
 * Custom hook to access the font scaling context.
 * Must be used within a FontScaleProvider.
 *
 * @returns {FontScaleContextType} The font scaling context.
 * @throws {Error} If used outside a FontScaleProvider.
 */
export const useFontScale = (): FontScaleContextType => {
    const context = useContext(FontScaleContext);
    if (!context) {
        throw new Error('useFontScale must be used within a FontScaleProvider');
    }
    return context;
}