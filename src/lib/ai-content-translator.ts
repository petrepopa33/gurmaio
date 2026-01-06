import type { Language } from './i18n/translations';

const translationCache = new Map<string, Record<Language, string>>();

  contentType: 'meal_name' | 'ingredien
  content: string,
  contentType: 'meal_name' | 'ingredient' | 'cooking_instruction',
  targetLanguage: Language

  if (targetLanguage === 'en') {
      es: 'Spanish'
  }

  const cacheKey = `${contentType}:${content}`;
  const cached = translationCache.get(cacheKey);
  if (cached && cached[targetLanguage]) {

   

Require
2. Keep cultural context where appropriate

    } else if (cont

1. Use the common c

    } else {

1. Use clear, imper

    }
    co

    }
    
    translationCache.set(cacheKey, cac
    return translation.trim();

  }

  items: Array<{ content: string; type: 'm
): Promise<Map<string, string>> {

    items.forEach(item => {
    });
  }

  try {
      en: 'English',
      es: 'Spanish',

      nl: 'Dutch',
      ro: 'R
    };

    const ins
    if (mealNames.length > 0) {
      const mealNamesPrompt = window


    }

Return ONLY valid JSON in this format:
  "t
    {"original": "meal 
}`;
     

    const cacheEntry = translationCache.get(cacheKey) || {} as Record<Language, string>;
    cacheEntry[targetLanguage] = translation.trim();
    translationCache.set(cacheKey, cacheEntry);
    
    return translation.trim();
  } catch (error) {
    console.error('Translation error:', error);
    return content;
  }
}

export async function translateBatch(
  items: Array<{ content: string; type: 'meal_name' | 'ingredient' | 'cooking_instruction' }>,
  targetLanguage: Language
): Promise<Map<string, string>> {
  const resultMap = new Map<string, string>();

  if (targetLanguage === 'en') {
    items.forEach(item => {
      resultMap.set(item.content, item.content);
    });
    return resultMap;
  }

  const translationsMap = new Map<string, string>();

  try {
    const languageNames: Record<Language, string> = {
      en: 'English',
      de: 'German',
      es: 'Spanish',
      fr: 'French',
      it: 'Italian',
      pt: 'Portuguese',
      nl: 'Dutch',
      pl: 'Polish',
      ro: 'Romanian',
      cs: 'Czech',
    };

    const mealNames = items.filter(i => i.type === 'meal_name');
    const ingredients = items.filter(i => i.type === 'ingredient');
    const instructions = items.filter(i => i.type === 'cooking_instruction');

    if (mealNames.length > 0) {
      const mealNamesList = mealNames.map(m => m.content);
      const mealNamesPrompt = window.spark.llmPrompt`Translate these meal/recipe names from English to ${languageNames[targetLanguage]}. Return the result as a valid JSON object with a single property called "translations" that contains an array of objects with "original" and "translated" properties.

Meal names to translate:
${mealNamesList.map((name, i) => `${i + 1}. ${name}`).join('\n')}

Requirements:
1. Use natural, appetizing language
2. Keep cultural context where appropriate
3. Make translations sound delicious and appealing

Return ONLY valid JSON in this format:
{
  "translations": [
    {"original": "meal name 1", "translated": "translated name 1"},
    {"original": "meal name 2", "translated": "translated name 2"}
  ]
}`;
      
































































































































