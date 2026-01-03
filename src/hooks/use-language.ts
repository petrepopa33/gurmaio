import { useKV } from '@github/spark/hooks';
import { translations, type Language } from '@/lib/i18n/translations';

export function useLanguage() {
  const [language, setLanguage] = useKV<Language>('user_language', 'en');

  const t = translations[language || 'en'];

  return {
    language: language || 'en',
    setLanguage,
    t,
  };
}
