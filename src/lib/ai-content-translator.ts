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

  items.forEach(item => {
    if (!item || item.trim() === '') {
      return;
    }
  });

  const validItems = items.filter(item => item && item.trim() !== '');
  
  if (validItems.length === 0) {
    return resultMap;
  }

  try {
    const itemsJson = JSON.stringify(validItems);
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

    const contentTypeLabels = {
      ingredient: 'ingredient names',
      meal_name: 'meal/recipe names',
      cooking_instruction: 'cooking instructions'
    };

    const prompt = (window.spark.llmPrompt as any)`You are a culinary translation expert. Translate the following ${contentTypeLabels[contentType]} from English to ${languageNames[targetLanguage]}.

Input items (as JSON array):
${itemsJson}

Instructions:
- Maintain culinary accuracy and cultural appropriateness
- Keep ingredient names authentic to the target language
- For cooking instructions, preserve technical cooking terms
- Return ONLY a valid JSON object where keys are the original English items and values are the translations

Example format:
{
  "original item 1": "translated item 1",
  "original item 2": "translated item 2"
}

Return ONLY the JSON object, no additional text.`;

    const response = await window.spark.llm(prompt, 'gpt-4o-mini', true);
    const translations = JSON.parse(response);

    for (const [original, translated] of Object.entries(translations)) {
      if (typeof translated === 'string' && translated.trim() !== '') {
        resultMap.set(original, translated);
      } else {
        resultMap.set(original, original);
      }
    }

    return resultMap;
  } catch (error) {
    console.error('Translation error:', error);
    validItems.forEach(item => resultMap.set(item, item));
    return resultMap;
  }
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
