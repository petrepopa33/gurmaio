import type { Language } from './i18n/translations';

const translationCache = new Map<string, Record<Language, string>>();

export async function translateContent(
  content: string,
  contentType: 'meal_name' | 'ingredient' | 'cooking_instruction',
  targetLanguage: Language
): Promise<string> {
  if (targetLanguage === 'en' || !content) {
    return content;
  }

  const cacheKey = `${contentType}:${content}`;
  const cached = translationCache.get(cacheKey);
  if (cached && cached[targetLanguage]) {
    return cached[targetLanguage];
  }

  const languageNames: Record<Language, string> = {
    en: 'English',
    de: 'German',
    fr: 'French',
    es: 'Spanish',
    it: 'Italian',
    pt: 'Portuguese',
    nl: 'Dutch',
    pl: 'Polish',
    ro: 'Romanian',
    cs: 'Czech',
  };

  const contextPrompts: Record<typeof contentType, string> = {
    meal_name: 'You are translating a recipe/meal name for a meal planning application.',
    ingredient: 'You are translating a food ingredient name for a meal planning application.',
    cooking_instruction: 'You are translating a cooking instruction step for a meal planning application.',
  };

  try {
    const contentTypeLabel = contentType === 'meal_name' ? 'recipe/meal name' : contentType === 'ingredient' ? 'ingredient name' : 'cooking instruction';
    const prompt = `${contextPrompts[contentType]}

Task: Translate the following ${contentTypeLabel} from English to ${languageNames[targetLanguage]}.

Original text: "${content}"

Requirements:
1. Provide ONLY the translated text, no explanations or additional text
2. Keep the translation natural and culturally appropriate
3. For meal names: Keep them appetizing and descriptive
4. For ingredients: Use standard culinary terms for that language
5. For cooking instructions: Use imperative form (command form) as is standard in recipes
6. Maintain any important details like measurements or cooking methods
7. DO NOT add quotes or formatting - just the plain translated text

Translation:`;

    const translation = await window.spark.llm(prompt, 'gpt-4o-mini', false);
    const cleanedTranslation = translation.trim().replace(/^["']|["']$/g, '');

    if (!translationCache.has(cacheKey)) {
      translationCache.set(cacheKey, { en: content } as Record<Language, string>);
    }
    const cached = translationCache.get(cacheKey)!;
    cached[targetLanguage] = cleanedTranslation;

    return cleanedTranslation;
  } catch (error) {
    console.error('Translation error:', error);
    return content;
  }
}

export async function translateMealBatch(
  meals: Array<{ recipe_name: string; ingredients: Array<{ name: string }>; cooking_instructions: string[] }>,
  targetLanguage: Language
): Promise<Map<string, string>> {
  if (targetLanguage === 'en') {
    return new Map();
  }

  const translationMap = new Map<string, string>();
  const allTexts = new Set<string>();

  meals.forEach(meal => {
    allTexts.add(meal.recipe_name);
    meal.ingredients.forEach(ing => allTexts.add(ing.name));
    meal.cooking_instructions.forEach(inst => allTexts.add(inst));
  });

  const batchSize = 20;
  const textsArray = Array.from(allTexts);

  for (let i = 0; i < textsArray.length; i += batchSize) {
    try {
      const batch = textsArray.slice(i, i + batchSize);
      
      for (const text of batch) {
        const contentType = meals.some(m => m.recipe_name === text)
          ? 'meal_name'
          : meals.some(m => m.ingredients.some(ing => ing.name === text))
          ? 'ingredient'
          : 'cooking_instruction';
        
        const translated = await translateContent(text, contentType, targetLanguage);
        translationMap.set(text, translated);
      }
    } catch (error) {
      console.error('Batch translation error:', error);
    }
  }

  return translationMap;
}

export function clearTranslationCache(): void {
  translationCache.clear();
}

export function getTranslationCacheSize(): number {
  return translationCache.size;
}
