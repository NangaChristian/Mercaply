import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation files
const resources = {
  fr: {
    translation: {
      "language": "Français",
      "home": "Accueil",
      "products": "Produits",
      "services": "Services",
      "search_placeholder": "Rechercher...",
      "my_account": "Mon Compte",
      "login": "Se connecter",
      "cart": "Panier"
    }
  },
  en: {
    translation: {
      "language": "English",
      "home": "Home",
      "products": "Products",
      "services": "Services",
      "search_placeholder": "Search...",
      "my_account": "My Account",
      "login": "Login",
      "cart": "Cart"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false, // react already safes from xss
    }
  });

export default i18n;
