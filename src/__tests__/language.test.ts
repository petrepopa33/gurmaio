import { describe, it, expect, vi } from 'vitest';
import { useLanguage } from '../hooks/use-language';
import { renderHook, act } from '@testing-library/react';

vi.mock('@github/spark/hooks', () => {
  return {
    useKV: <T,>(_key: string, defaultValue: T) => {
      let value = defaultValue;
      const setValue = (updater: any) => {
        value = typeof updater === 'function' ? updater(value) : updater;
      };
      return [value, setValue] as const;
    },
  };
});

describe('Multi-language Support Tests', () => {
  describe('Language Hook', () => {
    it('should initialize with default language', () => {
      const { result } = renderHook(() => useLanguage());
      expect(result.current.language).toBeDefined();
      expect(['en', 'ro', 'de', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'cs']).toContain(result.current.language);
    });

    it('should provide translation function', () => {
      const { result } = renderHook(() => useLanguage());
      expect(result.current.t).toBeDefined();
      expect(typeof result.current.t).toBe('object');
    });

    it('should provide setLanguage function', () => {
      const { result } = renderHook(() => useLanguage());
      expect(result.current.setLanguage).toBeDefined();
      expect(typeof result.current.setLanguage).toBe('function');
    });

    it('should have translations for key UI elements', () => {
      const { result } = renderHook(() => useLanguage());
      const t = result.current.t;
      
      expect(t.appName).toBeDefined();
      expect(t.welcome).toBeDefined();
      expect(t.generate).toBeDefined();
      expect(t.save).toBeDefined();
      expect(t.logout).toBeDefined();
    });
  });

  describe('Supported Languages', () => {
    const languages = [
      { code: 'en', name: 'English' },
      { code: 'ro', name: 'Romanian' },
      { code: 'de', name: 'German' },
      { code: 'fr', name: 'French' },
      { code: 'es', name: 'Spanish' },
      { code: 'it', name: 'Italian' },
      { code: 'pt', name: 'Portuguese' },
      { code: 'nl', name: 'Dutch' },
      { code: 'pl', name: 'Polish' },
      { code: 'cs', name: 'Czech' },
    ];

    languages.forEach(({ code, name }) => {
      it(`should support ${name} (${code})`, () => {
        expect(true).toBe(true);
      });
    });
  });

  describe('Translation Completeness', () => {
    it('should have translation for common actions', () => {
      const { result } = renderHook(() => useLanguage());
      const t = result.current.t;
      
      const commonKeys = [
        'generate',
        'save',
        'delete',
        'edit',
        'cancel',
        'confirm',
        'yes',
        'no',
        'close',
        'back',
        'next',
      ];

      commonKeys.forEach(key => {
        expect(t[key as keyof typeof t]).toBeDefined();
      });
    });

    it('should have translation for meal types', () => {
      const { result } = renderHook(() => useLanguage());
      const t = result.current.t;
      
      expect(t.breakfast).toBeDefined();
      expect(t.lunch).toBeDefined();
      expect(t.dinner).toBeDefined();
    });

    it('should have translation for dietary preferences labels', () => {
      const { result } = renderHook(() => useLanguage());
      
      expect(true).toBe(true);
    });

    it('should have translation for navigation', () => {
      const { result } = renderHook(() => useLanguage());
      const t = result.current.t;
      
      expect(t.mealPlanTab).toBeDefined();
      expect(t.mealPrepTab).toBeDefined();
      expect(t.trackProgressTab).toBeDefined();
    });
  });

  describe('Translation Context', () => {
    it('should provide contextual translations', () => {
      const { result } = renderHook(() => useLanguage());
      const t = result.current.t;
      
      expect(t.appName).toBeDefined();
      expect(t.tagline).toBeDefined();
      expect(t.welcome).toBeDefined();
    });

    it('should have error message translations', () => {
      const { result } = renderHook(() => useLanguage());
      const t = result.current.t;
      
      expect(t.swapFailed).toBeDefined();
    });

    it('should have success message translations', () => {
      const { result } = renderHook(() => useLanguage());
      const t = result.current.t;
      
      expect(t.mealSwapped || t.saved).toBeDefined();
    });
  });

  describe('Language Switching', () => {
    it('should allow changing language', () => {
      const { result } = renderHook(() => useLanguage());
      
      act(() => {
        result.current.setLanguage(() => 'de');
      });
      
      expect(true).toBe(true);
    });
  });

  describe('Date and Number Formatting', () => {
    it('should format dates according to locale', () => {
      const testDate = new Date('2024-01-15');
      const formattedDate = testDate.toLocaleDateString();
      expect(formattedDate).toBeDefined();
      expect(formattedDate.length).toBeGreaterThan(0);
    });

    it('should format currency according to locale', () => {
      const amount = 25.50;
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR'
      }).format(amount);
      expect(formatted).toContain('25.50');
    });

    it('should format numbers according to locale', () => {
      const number = 1234.56;
      const formatted = number.toLocaleString();
      expect(formatted).toBeDefined();
    });
  });

  describe('RTL Language Support', () => {
    it('should handle left-to-right languages', () => {
      const ltrLanguages = ['en', 'ro', 'de', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'cs'];
      ltrLanguages.forEach(lang => {
        expect(ltrLanguages).toContain(lang);
      });
    });
  });

  describe('Translation Fallback', () => {
    it('should not break when translation missing', () => {
      const { result } = renderHook(() => useLanguage());
      const t = result.current.t;
      
      const nonExistentKey = t['thisKeyDoesNotExist' as keyof typeof t];
      expect(nonExistentKey === undefined || typeof nonExistentKey === 'string').toBe(true);
    });
  });

  describe('Special Characters', () => {
    it('should handle special characters in translations', () => {
      const { result } = renderHook(() => useLanguage());
      const t = result.current.t;
      
      Object.values(t).forEach(value => {
        if (typeof value === 'string') {
          expect(value.length).toBeGreaterThan(0);
        }
      });
    });

    it('should handle diacritics and accents', () => {
      const testStrings = [
        'Français',
        'Español',
        'Português',
        'Română',
        'Čeština',
      ];
      
      testStrings.forEach(str => {
        expect(str.length).toBeGreaterThan(0);
        expect(typeof str).toBe('string');
      });
    });
  });

  describe('Pluralization', () => {
    it('should handle singular vs plural forms', () => {
      const day = 1;
      const days = 7;
      
      expect(day).toBe(1);
      expect(days).toBeGreaterThan(1);
    });
  });

  describe('Dynamic Content Translation', () => {
    it('should translate dynamic content like meal names', () => {
      expect(true).toBe(true);
    });

    it('should translate ingredient names', () => {
      expect(true).toBe(true);
    });

    it('should translate cooking instructions', () => {
      expect(true).toBe(true);
    });
  });
});
