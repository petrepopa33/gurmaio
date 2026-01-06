import type { Language } from './i18n/translations';

const translationCache = new Map<string, Record<Language, string>>();

export async function translateContent(
  content: string,
  contentType: 'ingredient' | 'cooking_instruction' | 'meal_name',
  targetLanguage: Language
): Promise<string> {
  if (targetLanguage === 'en') {
    return content;
  }

  const cached = translationCache.get(content);
  if (cached && cached[targetLanguage]) {
    return cached[targetLanguage];
  }

  try {
    const contentTypeLabel = contentType === 'ingredient' ? 'Ingredient' : contentType === 'meal_name' ? 'Meal name' : 'Cooking instruction';
    
    const prompt = (window.spark.llmPrompt as any)`Translate the following ${contentTypeLabel} to ${targetLanguage}: "${content}"
    
Return only the translated text, nothing else.`;
    
    const translatedContent = await window.spark.llm(prompt, 'gpt-4o-mini', false);
    
    const existing = translationCache.get(content) || {} as Record<Language, string>;
    translationCache.set(content, {
      ...existing,
      [targetLanguage]: translatedContent.trim()
    });
    
    return translatedContent.trim();
  } catch (error) {
    console.error(`Translation failed for ${contentType}:`, error);
    return content;
  }
}

export async function batchTranslateContent(
  items: string[],
  contentType: 'ingredient' | 'cooking_instruction' | 'meal_name',
  targetLanguage: Language
): Promise<Map<string, string>> {
  const resultMap = new Map<string, string>();
  
  if (targetLanguage === 'en') {
    items.forEach(item => resultMap.set(item, item));
    return resultMap;
  }

  const uncachedItems: string[] = [];
  
  items.forEach(item => {
    const cached = translationCache.get(item);
    if (cached && cached[targetLanguage]) {
      resultMap.set(item, cached[targetLanguage]);
    } else {
      uncachedItems.push(item);
    }
  });

  if (uncachedItems.length === 0) {
    return resultMap;
  }

  try {
    const contentTypeLabel = contentType === 'ingredient' ? 'Ingredient' : contentType === 'meal_name' ? 'Meal name' : 'Cooking instruction';
    
    const prompt = (window.spark.llmPrompt as any)`Translate the following ${contentTypeLabel}s to ${targetLanguage}. Return a valid JSON object where each key is the original text and the value is the translation.

${contentTypeLabel}s to translate:
${uncachedItems.map((item, idx) => `${idx + 1}. ${item}`).join('\n')}

Return format: {"original text": "translated text", ...}`;
    
    const translationResult = await window.spark.llm(prompt, 'gpt-4o-mini', true);
    const translations = JSON.parse(translationResult);

    uncachedItems.forEach(item => {
      const translated = translations[item];
      if (translated) {
        resultMap.set(item, translated);
        const existing = translationCache.get(item) || {} as Record<Language, string>;
        translationCache.set(item, {
          ...existing,
          [targetLanguage]: translated
        });
      } else {
        resultMap.set(item, item);
      }
    });
  } catch (error) {
    console.error('Batch translation failed:', error);
    uncachedItems.forEach(item => resultMap.set(item, item));
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
