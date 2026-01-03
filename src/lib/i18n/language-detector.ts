import type { Language } from './translations';

const SUPPORTED_LANGUAGES: Language[] = ['en', 'de', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'ro', 'cs'];

const LANGUAGE_MAPPING: Record<string, Language> = {
  'en': 'en',
  'en-US': 'en',
  'en-GB': 'en',
  'de': 'de',
  'de-DE': 'de',
  'de-AT': 'de',
  'de-CH': 'de',
  'fr': 'fr',
  'fr-FR': 'fr',
  'fr-BE': 'fr',
  'fr-CH': 'fr',
  'fr-CA': 'fr',
  'es': 'es',
  'es-ES': 'es',
  'es-MX': 'es',
  'es-AR': 'es',
  'it': 'it',
  'it-IT': 'it',
  'it-CH': 'it',
  'pt': 'pt',
  'pt-PT': 'pt',
  'pt-BR': 'pt',
  'nl': 'nl',
  'nl-NL': 'nl',
  'nl-BE': 'nl',
  'pl': 'pl',
  'pl-PL': 'pl',
  'ro': 'ro',
  'ro-RO': 'ro',
  'cs': 'cs',
  'cs-CZ': 'cs',
};

export function detectBrowserLanguage(): Language {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'en';
  }

  const browserLanguages = navigator.languages || [navigator.language];

  for (const lang of browserLanguages) {
    const exactMatch = LANGUAGE_MAPPING[lang];
    if (exactMatch) {
      return exactMatch;
    }

    const langCode = lang.split('-')[0].toLowerCase();
    const baseMatch = LANGUAGE_MAPPING[langCode];
    if (baseMatch) {
      return baseMatch;
    }

    if (SUPPORTED_LANGUAGES.includes(langCode as Language)) {
      return langCode as Language;
    }
  }

  return 'en';
}
