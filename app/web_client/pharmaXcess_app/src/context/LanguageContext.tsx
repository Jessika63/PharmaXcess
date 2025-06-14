/**
 * LanguageContext
 * 
 * Provides a React Context to manage the application's language selection.
 * Supports system language detection, manual language selection, and persistence using AsyncStorage.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import * as Localization from 'expo-localization';
import { supportedLanguages, LanguageType, defaultLanguage } from '@/src/locales/i18n';

/**
 * The structure of the language context.
 * @typedef {Object} LanguageContextType
 * @property {LanguageType} language - The current language in use.
 * @property {(lang: LanguageType) => void} setLanguage - Function to update the language.
 */
interface LanguageContextType {
    language: LanguageType;
    setLanguage: (lang: LanguageType) => void;
}

const LanguageContext = createContext<LanguageContextType>({
    language: 'auto',
    setLanguage: () => {},
});

/**
 * Provides the language context to child components.
 * Handles loading and persisting the selected language.
 *
 * @param {{ children: React.ReactNode }} props - The child components.
 * @returns {JSX.Element} The context provider.
 */
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<LanguageType>('auto');
    
    useEffect(() => {
        /**
         * Loads the saved language from AsyncStorage when the component mounts.
         * Falls back to system language if no selection is found.
         */
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

    /**
     * Updates the language and saves the selection in AsyncStorage.
     * If 'auto' is selected, the system language is applied.
     *
     * @param {LanguageType} lang - The new language to apply.
     */
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


/**
 * Custom hook to access the language context.
 * Must be used within a LanguageProvider.
 *
 * @returns {LanguageContextType} The language context.
 * @throws {Error} If used outside a LanguageProvider.
 */
export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}