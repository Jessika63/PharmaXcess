import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 350;
const guidelineBaseHeight = 680;

const scale = (size: number) => (width / guidelineBaseWidth) * size;
const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;
export const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

interface FontScaleContextType {
  fontScale: number;
  setFontScale: (scale: number) => void;
  getFontSize: (baseSize: number) => number;
}

const FontScaleContext = createContext<FontScaleContextType | undefined>(undefined);

interface FontScaleProviderProps {
  children: ReactNode;
}

export const FontScaleProvider: React.FC<FontScaleProviderProps> = ({ children }) => {
  const [fontScale, setFontScale] = useState<number>(1.0);

  const getFontSize = (baseSize: number): number => {
    return moderateScale(baseSize * fontScale);
  };

  const value: FontScaleContextType = {
    fontScale,
    setFontScale,
    getFontSize,
  };

  return (
    <FontScaleContext.Provider value={value}>
      {children}
    </FontScaleContext.Provider>
  );
};

export const useFontScale = (): FontScaleContextType => {
  const context = useContext(FontScaleContext);
  if (context === undefined) {
    throw new Error('useFontScale must be used within a FontScaleProvider');
  }
  return context;
};
