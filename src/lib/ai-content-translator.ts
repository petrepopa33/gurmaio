import type { Language } from './i18n/translations';

export async function translateContentBatch(
  items: string[],
  targetLanguage: Language
): Promise<Map<string, string>> {
  const resultMap = new Map<string, string>();
  
  if (targetLanguage === 'en' || items.length === 0) {
    items.forEach(item => resultMap.set(item, item));
    return resultMap;
  }

  const uniqueItems = Array.from(new Set(items));
  
  if (uniqueItems.length === 0) {
    return resultMap;
  }

  try {
    const itemsJson = JSON.stringify(uniqueItems);
    
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
      cs: 'Czech'
    };

    const prompt = (window.spark.llmPrompt as any)`Translate the following array of text items to ${languageNames[targetLanguage]}.

Input JSON array:
${itemsJson}

Return a JSON object with a "translations" property containing an array of translated strings in the same order as the input. Keep the translation natural and contextually appropriate for food/cooking content.

Example format:
{
  "translations": ["translated item 1", "translated item 2", ...]
}`;

    const response = await window.spark.llm(prompt, 'gpt-4o-mini', true);
    const parsed = JSON.parse(response);
    
    if (parsed.translations && Array.isArray(parsed.translations)) {
      uniqueItems.forEach((item, index) => {
        const translated = parsed.translations[index];
        if (translated && typeof translated === 'string') {
          resultMap.set(item, translated);
        } else {
          resultMap.set(item, item);
        }
      });
    }

    uniqueItems.forEach(item => {
      if (!resultMap.has(item)) {
        resultMap.set(item, item);
      }
    });
  } catch (error) {
    console.error('Translation error:', error);
    uniqueItems.forEach(item => resultMap.set(item, item));
  }

  return resultMap;
}

export async function translateMealPlanContent(
  ingredients: string[],
  mealNames: string[],
  cookingInstructions: string[],
  targetLanguage: Language
): Promise<{
  ingredients: Map<string, string>;
  mealNames: Map<string, string>;
  cookingInstructions: Map<string, string>;
}> {
  const [translatedIngredients, translatedMealNames, translatedInstructions] = await Promise.all([
    translateContentBatch(ingredients, targetLanguage),
    translateContentBatch(mealNames, targetLanguage),
    translateContentBatch(cookingInstructions, targetLanguage),
  ]);

  return {
    ingredients: translatedIngredients,
    mealNames: translatedMealNames,
    cookingInstructions: translatedInstructions,
  };
}
