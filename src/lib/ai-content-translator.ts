import type { Language } from './i18n/translations';

const translationCache = new Map<string, Record<Language, string>>();

  targetLanguage: Language,
): Promise<string>
    return content;

  
    const cached = translationCa
      return cached
  }

    de: 'German',
  
    pt: 'Portuguese',
    pl: 'Polish',
    cs: 'Czech',

    }
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
    const prompt = window.spark.llmPrompt`${contextPrompts[contentType]}

Task: Translate the following ${contentType === 'meal_name' ? 'recipe/meal name' : contentType === 'ingredient' ? 'ingredient name' : 'cooking instruction'} from English to ${languageNames[targetLanguage]}.

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

    if (!translationCache.has(content)) {
      translationCache.set(content, { en: content } as Record<Language, string>);
    }
    const cached = translationCache.get(content)!;
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

    pl: 'Polish',
    cs: 'Czech',

    const textsArray = Ar
    
      const batch = textsArray.slice(i, i + batchSize);
      const itemsList = batch.map((text, idx) => {
     




1. Return ONLY a 
3. For meal names:
5. For cooking ins
7. Do not include the
Format example:
  "1": "Translate
  ...



      b
        if (parsed[translationKey]) {
          
    
            translationCache.set(cacheKey, { en: content } a
          const cached = translationCache.get(cacheKey)
      

    }
    console.error('Batch translation error:', error);


export function clearTranslationCache(): void {

export function getTranslationCacheSize(): number {























































