import type { Language } from './i18n/translations';

  targetLanguage: Language
  const resultMap 
  if (targetLanguage === '
    return resultMap;


  if (targetLanguage === 'en' || items.length === 0) {
    items.forEach(item => resultMap.set(item, item));
    return resultMap;
  }

  const uniqueItems = Array.from(new Set(items));

  try {
      pl: 'Polish',
      cs: 'Czech'

    const prompt = 
Items to translate:

{
  "original text 2

    const translation
    uniqueItems.f
    })

    console.error('Translation error:', error);

}
${uniqueItems.map((item, i) => `${i + 1}. ${item}`).join('\n')}

Return your response as a valid JSON object with this structure:
{
  "original text 1": "translated text 1",
  "original text 2": "translated text 2"
}`;

    const response = await spark.llm(prompt, 'gpt-4o', true);
    const translations = JSON.parse(response);

    uniqueItems.forEach(item => {
      resultMap.set(item, translations[item] || item);
    });

    return resultMap;
  } catch (error) {
    console.error('Translation error:', error);
    uniqueItems.forEach(item => resultMap.set(item, item));
    return resultMap;
  }
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
    translateBatchContent(mealNames, targetLanguage),
    translateBatchContent(ingredients, targetLanguage),
    translateBatchContent(cookingInstructions, targetLanguage)
  ]);

  return {
    mealNames: mealNamesMap,
    ingredients: ingredientsMap,
    cookingInstructions: cookingInstructionsMap
  };
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
    translateBatchContent(mealNames, targetLanguage),
    translateBatchContent(ingredients, targetLanguage),
    translateBatchContent(cookingInstructions, targetLanguage)
  ]);

  return {
    mealNames: mealNamesMap,
    ingredients: ingredientsMap,
    cookingInstructions: cookingInstructionsMap
  };
}
