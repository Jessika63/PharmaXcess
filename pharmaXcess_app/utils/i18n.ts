
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Exemple de traductions
const resources = {
  en: {
    translation: {
      welcome: "Welcome",
      // ... tes autres clés
    },
  },
  fr: {
    translation: {
      welcome: "Bienvenue",
      // ... tes autres clés
    },
  },
};

i18n
  .use(initReactI18next) // connecte i18next à React
  .init({
    resources,
    lng: 'fr',           // langue par défaut
    fallbackLng: 'en',   // langue de secours
    interpolation: {
      escapeValue: false, // React gère l'échappement
    },
  });

export default i18n;
