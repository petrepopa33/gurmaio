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
    
    const translation = await spark.llm(promptText, 'gpt-4o-mini');
    const translatedContent = translation.trim();

    const existing = translationCache.get(content) || {} as Record<Language, string>;
    existing[targetLanguage] = translatedContent;
    translationCache.set(content, existing);

    return translatedContent;
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
    const itemsList = uncachedItems.map((item, idx) => `${idx + 1}. ${item}`).join('\n');

    const promptText = `Translate the following ${contentTypeLabel}s to ${targetLanguage}. Return each translation on a new line in the same order, prefixed with the number. Return ONLY the translations, nothing else.

${itemsList}

Translations:`;

    const translationsText = await spark.llm(promptText, 'gpt-4o-mini');
    const translationLines = translationsText.trim().split('\n').filter(line => line.trim());

    uncachedItems.forEach((item, idx) => {
      const matchingLine = translationLines.find(line => 
        line.trim().startsWith(`${idx + 1}.`)
      );

      if (matchingLine) {
        const translatedItem = matchingLine.replace(/^\d+\.\s*/, '').trim();
        resultMap.set(item, translatedItem);

        const existing = translationCache.get(item) || {} as Record<Language, string>;
        existing[targetLanguage] = translatedItem;
        translationCache.set(item, existing);
      } else {
        resultMap.set(item, item);
      }
    });
  } catch (error) {
    console.error('Batch translation error:', error);
    uncachedItems.forEach(item => resultMap.set(item, item));
  }

  return resultMap;
}

export async function translateMealPlanContent(
  mealNames: string[],
  ingredients: string[],
  cookingInstructions: string[],
  targetLanguage: Language
): Promise<{
  mealNames: Map<string, string>;
  ingredients: Map<string, string>;
  cookingInstructions: Map<string, string>;
}> {
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
