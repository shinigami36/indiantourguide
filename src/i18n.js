import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import es from './locales/es.json';
import de from './locales/de.json';
import fr from './locales/fr.json';
import ja from './locales/ja.json';
import zh from './locales/zh.json';
import ko from './locales/ko.json';
import ar from './locales/ar.json';
import ru from './locales/ru.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
  de: { translation: de },
  fr: { translation: fr },
  ja: { translation: ja },
  zh: { translation: zh },
  ko: { translation: ko },
  ar: { translation: ar },
  ru: { translation: ru },
};

const SUPPORTED_LANGUAGES = ['en', 'es', 'de', 'fr', 'ja', 'zh', 'ko', 'ar', 'ru'];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES,
    nonExplicitSupportedLngs: false,
    debug: false,

    interpolation: {
      // React already escapes JSX — but enable for safety in non-JSX usage
      escapeValue: true,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

// Validate language from localStorage and reset to English if tampered
i18n.on('languageChanged', (lng) => {
  if (!SUPPORTED_LANGUAGES.includes(lng)) {
    try { localStorage.removeItem('i18nextLng'); } catch { /* ignore */ }
    i18n.changeLanguage('en');
  }
});

export default i18n;