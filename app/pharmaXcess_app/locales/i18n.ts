import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import English translations
import enCommon from './en/common';
import enProfile from './en/profile';
import enSettings from './en/settings';

// Import French translations
import frCommon from './fr/common';
import frProfile from './fr/profile';
import frSettings from './fr/settings';

const resources = {
  en: {
    common: enCommon,
    profile: enProfile,
    settings: enSettings,
  },
  fr: {
    common: frCommon,
    profile: frProfile,
    settings: frSettings,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    ns: ['common', 'profile', 'settings'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false, // react already does escaping
    },
    compatibilityJSON: 'v4',
  });

export default i18n;
