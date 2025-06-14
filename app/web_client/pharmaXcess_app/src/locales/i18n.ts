/**
 * i18n Configuration File
 * 
 * Initializes internationalization (i18n) support for the application using `react-i18next`.
 * Provides:
 * - Multi-language support (English and French)
 * - Language resources for multiple screens
 * - Fallback and namespace management
 * 
 * Supported languages:
 * - English ('en')
 * - French ('fr')
 */

import i18n from 'i18next';
import { initReactI18next, Translation } from 'react-i18next';

import frLoginScreen from './fr/loginScreen.json';
import enLoginScreen from './en/loginScreen.json';

import frSignUpScreen from './fr/signUpScreen.json';
import enSignUpScreen from './en/signUpScreen.json';

import frForgotPasswordScreen from './fr/forgotPasswordScreen.json';
import enForgotPasswordScreen from './en/forgotPasswordScreen.json';

import frCommon from "./fr/common.json"
import enCommon from "./en/common.json"

/**
 * List of supported languages for the application.
 * @constant {readonly string[]}
 * @example supportedLanguages = ['en', 'fr']
 */
export const supportedLanguages = ['en', 'fr'] as const;

/**
 * Defines the language type, which can be 'auto', 'en', or 'fr'.
 * @typedef {'auto' | 'en' | 'fr'} LanguageType
 */
export type LanguageType = 'auto' | typeof supportedLanguages[number];

/**
 * The default language used when no preference is found.
 * @constant {LanguageType}
 * @default 'en'
 */
export const defaultLanguage: LanguageType = 'en' as const;

/**
 * Defines all translation resources categorized by language and screen.
 * @constant {Object}
 * @property {Object} fr - French translations for each screen.
 * @property {Object} en - English translations for each screen.
 */
const resources = {
    fr: {
        loginScreen: frLoginScreen,
        signUpScreen: frSignUpScreen,
        forgotPasswordScreen: frForgotPasswordScreen,
        common: frCommon
    },
    en: {
        loginScreen: enLoginScreen,
        signUpScreen: enSignUpScreen,
        forgotPasswordScreen: enForgotPasswordScreen,
        common: enCommon
    },
};

/**
 * Initializes i18n with React integration and configures:
 * - Available resources
 * - Fallback language
 * - Namespaces
 * - Interpolation settings
 */
i18n
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: defaultLanguage,
        ns: ['loginScreen', 'signUpScreen', 'forgotPasswordScreen', 'common'],
        defaultNS: 'loginScreen',   
        interpolation: {
            escapeValue: false, // React already handles escaping
        },
    });

export default i18n;