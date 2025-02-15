import i18n from 'i18next';
import { initReactI18next, Translation } from 'react-i18next';

import frLoginScreen from './fr/loginScreen.json';
import enLoginScreen from './en/loginScreen.json';

import frSignUpScreen from './fr/signUpScreen.json';
import enSignUpScreen from './en/signUpScreen.json';

import frForgotPasswordScreen from './fr/forgotPasswordScreen.json';
import enForgotPasswordScreen from './en/forgotPasswordScreen.json';

export const supportedLanguages = ['en', 'fr'] as const;
export type LanguageType = 'auto' | typeof supportedLanguages[number];
export const defaultLanguage: LanguageType = 'en' as const;

const resources = {
    fr: {
        loginScreen: frLoginScreen,
        signUpScreen: frSignUpScreen,
        forgotPasswordScreen: frForgotPasswordScreen,
    },
    en: {
        loginScreen: enLoginScreen,
        signUpScreen: enSignUpScreen,
        forgotPasswordScreen: enForgotPasswordScreen,
    },
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: defaultLanguage,
        ns: ['loginScreen', 'signUpScreen', 'forgotPasswordScreen'],
        defaultNS: 'loginScreen',   
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;