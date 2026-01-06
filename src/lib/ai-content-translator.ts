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
    
    const promptText = `Translate the following ${contentTypeLabel} to ${targetLanguage}. Return ONLY the translation, nothing else.

${contentTypeLabel}: ${content}

Translation:`;
    
    const prompt = spark.llmPrompt([promptText] as any);
    
    const translatedContent = await spark.llm(prompt, 'gpt-4o-mini');
    
    const existing = translationCache.get(content) || {} as Record<Language, string>;
    existing[targetLanguage] = translatedContent.trim();
    translationCache.set(content, existing);
    
    return translatedContent.trim();
  } catch (error) {
    console.error('Translation error:', error);
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
    
    const promptText = `Translate the following ${contentTypeLabel}s to ${targetLanguage}. Return a valid JSON object where each key is the original text and the value is the translation.

${contentTypeLabel}s to translate:
${uncachedItems.map((item, idx) => `${idx + 1}. ${item}`).join('\n')}

Return format: {"original text": "translated text", ...}`;
    
    const prompt = spark.llmPrompt([promptText] as any);
    
    const translationResult = await spark.llm(prompt, 'gpt-4o-mini', true);
    const translations = JSON.parse(translationResult);

    uncachedItems.forEach(item => {
      const translated = translations[item];
      if (translated) {
        const existing = translationCache.get(item) || {} as Record<Language, string>;
        existing[targetLanguage] = translated;
        translationCache.set(item, existing);
        resultMap.set(item, translated);
      } else {
        resultMap.set(item, item);
      }
    });

    return resultMap;
  } catch (error) {
    console.error('Batch translation error:', error);
    uncachedItems.forEach(item => resultMap.set(item, item));
    return resultMap;
  }
}

export async function batchTranslateMealPlanContent(
  mealNames: string[],
  ingredients: string[],
  cookingInstructions: string[],
  targetLanguage: Language
): Promise<{
  mealNames: Map<string, string>;
  ingredients: Map<string, string>;
  cookingInstructions: Map<string, string>;
}> {
  if (targetLanguage === 'en') {
    const mealNamesMap = new Map<string, string>();
    const ingredientsMap = new Map<string, string>();
    const cookingInstructionsMap = new Map<string, string>();
    
    mealNames.forEach(name => mealNamesMap.set(name, name));
    ingredients.forEach(ing => ingredientsMap.set(ing, ing));
    cookingInstructions.forEach(inst => cookingInstructionsMap.set(inst, inst));
    
    return {
      mealNames: mealNamesMap,
      ingredients: ingredientsMap,
      cookingInstructions: cookingInstructionsMap,
    };
  }

  const [mealNamesMap, ingredientsMap, cookingInstructionsMap] = await Promise.all([
    batchTranslateContent(mealNames, 'meal_name', targetLanguage),
    batchTranslateContent(ingredients, 'ingredient', targetLanguage),
    batchTranslateContent(cookingInstructions, 'cooking_instruction', targetLanguage),
  ]);

  return {
    mealNames: mealNamesMap,
    ingredients: ingredientsMap,
    cookingInstructions: cookingInstructionsMap,
  };
}
