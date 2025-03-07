import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { PixelRatio } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type FontScaleOption = 'auto' | number;

interface FontScaleContextType {
    fontScale: number;
    selectedFontScale: FontScaleOption;
    setSelectedFontScale: (option: FontScaleOption) => void;
}

const FontScaleContext = createContext<FontScaleContextType | undefined>(undefined);

export const FontScaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [selectedFontScale, setSelectedFontScaleState] = useState<FontScaleOption>('auto');

    useEffect(() => {
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

    const fontScale = useMemo(() => {
        return selectedFontScale === 'auto' ? 1 : selectedFontScale / PixelRatio.getFontScale();
    }, [selectedFontScale]);

    return (
        <FontScaleContext.Provider value={{ fontScale, selectedFontScale, setSelectedFontScale: changeFontScale }}>
            {children}
        </FontScaleContext.Provider>
    );
};

export const useFontScale = (): FontScaleContextType => {
    const context = useContext(FontScaleContext);
    if (!context) {
        throw new Error('useFontScale must be used within a FontScaleProvider');
    }
    return context;
}