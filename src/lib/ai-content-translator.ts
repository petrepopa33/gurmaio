import type { Language } from '@/lib/i18n/translations';

const LANGUAGE_NAMES: Record<Language, string> = {
  es: 'Spanish',
  pl: 'Polish',
  nl: 'Dutch',
  pl: 'Polish',
  cs: 'Czech',
  nl: 'Dutch',
  ro: 'Romanian',

  fr: 'French',
  it: 'Italian',
};targetLanguage: Language,
 string

  try {
    const uniqueItems = Array.from(new Set(items));
    const languageName = LANGUAGE_NAMES[targetLanguage] || targetLanguage;
    
    const itemsList = uniqueItems.join('\n');
    const prompt = (window.spark.llmPrompt as any)`You are a professional food and recipe translator. Translate the following ${contentType} from English to ${languageName}.

Rules:
- Translate naturally and idiomatically
- Maintain the original meaning and culinary context
- Keep measurements and numbers unchanged
- Do not include any explanations, only provide translations
- Return a JSON object where keys are the original English text and values are the translations

Items to translate:
${itemsList}

Return the result as a JSON object.`;

    const result = await window.spark.llm(prompt, 'gpt-4o-mini', true);
    
    try {
      const translation = JSON.parse(result);
      
      if (typeof translation === 'object' && translation !== null) {
        Object.entries(translation).forEach(([key, value]) => {
          if (typeof value === 'string') {
            resultMap.set(key, value);
          }
        });
      }
    } catch (parseError) {
      console.warn('Failed to parse translation result:', parseError);
      uniqueItems.forEach(item => resultMap.set(item, item));
    }
  } catch (error) {
    console.error('Translation error:', error);
    items.forEach(item => resultMap.set(item, item));
  }

  return resultMap;
}

export async function translateRecipe(
  recipeName: string,
  ingredients: string[],
  cookingInstructions: string[],
  targetLanguage: Language
): Promise<{
  recipeName: string;
  ingredients: string[];
  cookingInstructions: string[];
}> {
  if (targetLanguage === 'en') {
    return {
      recipeName,
      ingredients,
      cookingInstructions,
    };
  }

  const recipeNameMap = await translateBatchContent([recipeName], targetLanguage, 'recipe name');
  const ingredientsMap = await translateBatchContent(ingredients, targetLanguage, 'ingredients');
  const instructionsMap = await translateBatchContent(cookingInstructions, targetLanguage, 'cooking instructions');

  return {
    recipeName: recipeNameMap.get(recipeName) || recipeName,
    ingredients: ingredients.map(ing => ingredientsMap.get(ing) || ing),
    cookingInstructions: cookingInstructions.map(inst => instructionsMap.get(inst) || inst),
  };
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
  if (targetLanguage === 'en') {
    const ingredientsMap = new Map<string, string>();
    const mealNamesMap = new Map<string, string>();
    const cookingInstructionsMap = new Map<string, string>();
    
    ingredients.forEach(item => ingredientsMap.set(item, item));
    mealNames.forEach(item => mealNamesMap.set(item, item));
    cookingInstructions.forEach(item => cookingInstructionsMap.set(item, item));
    
    return {
      ingredients: ingredientsMap,
      mealNames: mealNamesMap,
      cookingInstructions: cookingInstructionsMap,
    };
  }

  const [ingredientsMap, mealNamesMap, cookingInstructionsMap] = await Promise.all([
    translateBatchContent(ingredients, targetLanguage, 'ingredients'),
    translateBatchContent(mealNames, targetLanguage, 'meal names'),
    translateBatchContent(cookingInstructions, targetLanguage, 'cooking instructions'),
  ]);

  return {
    ingredients: ingredientsMap,
    mealNames: mealNamesMap,
    cookingInstructions: cookingInstructionsMap,
  };
}















