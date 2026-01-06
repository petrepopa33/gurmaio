import type { Language } from './i18n/translations';

export async function translateContentBatch(
  items: string[],
  targetLanguage: Language
): Promise<Map<string, string>> {
  const resultMap = new Map<string, string>();

  if (targetLanguage === 'en') {
    items.forEach(item => resultMap.set(item, item));
    return resultMap;
  }

  const uniqueItems = Array.from(new Set(items)).filter(item => item && item.trim() !== '');
  
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

    const targetLanguageName = languageNames[targetLanguage];

    const promptText = `You are a professional culinary translator. Translate the following list of food-related terms from English to ${targetLanguageName}.

Items to translate:
${itemsJson}

Important guidelines:
- Maintain culinary accuracy and use common cooking terminology
- Keep measurements and numbers unchanged
- Preserve the natural flow of cooking instructions
- Return a JSON object with a single property "translations" containing an array of objects with "original" and "translated" keys

Example format:
{
  "translations": [
    {"original": "Chicken Breast", "translated": "Pechuga de Pollo"},
    {"original": "Olive Oil", "translated": "Aceite de Oliva"}
  ]
}`;

    const response = await window.spark.llm(promptText, 'gpt-4o-mini', true);
    const parsed = JSON.parse(response);
    
    if (parsed.translations && Array.isArray(parsed.translations)) {
      parsed.translations.forEach((item: { original: string; translated: string }) => {
        if (item.original && item.translated) {
          resultMap.set(item.original, item.translated);
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
