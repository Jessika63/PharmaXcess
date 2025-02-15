import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import * as Localization from 'expo-localization';
import { supportedLanguages, LanguageType, defaultLanguage } from '@/src/locales/i18n';

interface LanguageContextType {
    language: LanguageType;
    setLanguage: (lang: LanguageType) => void;
}

const LanguageContext = createContext<LanguageContextType>({
    language: 'auto',
    setLanguage: () => {},
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<LanguageType>('auto');
    
    useEffect(() => {
        const loadLanguage = async () => {
            const storedLanguage = await AsyncStorage.getItem('userLanguage') as LanguageType | null;
            if (storedLanguage) {
                if (supportedLanguages.includes(storedLanguage as Exclude<LanguageType, 'auto'>)) {
                    setLanguage(storedLanguage);
                    i18n.changeLanguage(storedLanguage);
                } else {
                    setLanguage(defaultLanguage);
                    i18n.changeLanguage(defaultLanguage);
                }
            } else {
                const systemLanguage = Localization.locale.split('-')[0];
                const validLanguage: LanguageType = supportedLanguages.includes(systemLanguage as Exclude<LanguageType, 'auto'>) ? (systemLanguage as LanguageType) : defaultLanguage;
                setLanguage(validLanguage);
                i18n.changeLanguage(validLanguage);
            }
        };
        loadLanguage();
    }, []);

    const changeLanguage = async (lang: LanguageType) => {
        if (lang === 'auto') {
            const systemLanguage = Localization.locale.split('-')[0];
            const validLanguage: LanguageType = supportedLanguages.includes(systemLanguage as Exclude<LanguageType, 'auto'>) ? (systemLanguage as LanguageType) : defaultLanguage;
            setLanguage(validLanguage);
            await AsyncStorage.removeItem('userLanguage');
            i18n.changeLanguage(systemLanguage);
        } else if (supportedLanguages.includes(lang)) {
            setLanguage(lang);
            await AsyncStorage.setItem('userLanguage', lang);
            i18n.changeLanguage(lang);
        } else {
            setLanguage(defaultLanguage);
            await AsyncStorage.setItem('userLanguage', defaultLanguage);
            i18n.changeLanguage(defaultLanguage);
        }
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: changeLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}