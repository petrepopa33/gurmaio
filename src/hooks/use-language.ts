import { useKV } from '@github/spark/hooks';
import { translations, type Language } from '@/lib/i18n/translations';
import { detectBrowserLanguage } from '@/lib/i18n/language-detector';

export function useLanguage() {
  const detectedLanguage = detectBrowserLanguage();
  const [language, setLanguage] = useKV<Language>('user_language', detectedLanguage);

  const t = translations[language || 'en'];

  return {
    language: language || 'en',
    setLanguage,
    t,
  };
}
