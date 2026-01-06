import type { Language } from './i18n/translations';

async function batchTranslateContent(
  items: string[],
  contentType: 'ingredient' | 'meal_name' | 'cooking_instruction',
  targetLanguage: Language
): Promise<Map<string, string>> {
  const resultMap = new Map<string, string>();

  if (targetLanguage === 'en') {
    items.forEach(item => resultMap.set(item, item));
    return resultMap;
  }

  const uncachedItems: string[] = [];
  
  items.forEach(item => {
    if (!item || item.trim() === '') {
      resultMap.set(item, item);
    } else {
      uncachedItems.push(item);
    }
  });

  if (uncachedItems.length === 0) {
    return resultMap;
  }

  try {
    const contentTypeLabel = contentType === 'ingredient' ? 'ingredient' 
      : contentType === 'meal_name' ? 'meal name' 
      : 'cooking instruction';

    const itemsJson = JSON.stringify(uncachedItems);
    
    const promptText = `Translate the following ${contentTypeLabel}s to ${targetLanguage}. Return a JSON object where keys are the original texts and values are the translations. Preserve any measurements, numbers, and cooking terms appropriately.

Items to translate:
${itemsJson}

Return ONLY a valid JSON object mapping original text to translated text.`;

    const translationResponse = await spark.llm(promptText, 'gpt-4o-mini', true);
    const translations = JSON.parse(translationResponse);

    uncachedItems.forEach(item => {
      const translated = translations[item];
      if (translated && typeof translated === 'string') {
        resultMap.set(item, translated);
      } else {
        resultMap.set(item, item);
      }
    });
  } catch (error) {
    console.error('Translation error:', error);
    uncachedItems.forEach(item => {
      resultMap.set(item, item);
    });
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
  const [ingredientsMap, mealNamesMap, cookingInstructionsMap] = await Promise.all([
    batchTranslateContent(ingredients, 'ingredient', targetLanguage),
    batchTranslateContent(mealNames, 'meal_name', targetLanguage),
    batchTranslateContent(cookingInstructions, 'cooking_instruction', targetLanguage)
  ]);

  return {
    ingredients: ingredientsMap,
    mealNames: mealNamesMap,
    cookingInstructions: cookingInstructionsMap
  };
}
