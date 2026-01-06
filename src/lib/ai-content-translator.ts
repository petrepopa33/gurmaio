import type { Language } from './i18n/translations';

async function batchTranslateContent(

): Promise<Map<string, string>> {

    items.forEach(item => resultMap.set(item, item));
  }
  const uncachedItems: string[] =
  items.forEach(item => {

    } else {
    }

   

    const contentTypeLabel = contentT
  
${contentTypeLabel}s to t

    
    const translations = JSON.parse(translationRes
    uncached
      if (translated) {
     
     

        resultMap.set(item, item);
    });
   

  retur

  in
  cookingInstructions: string[],

  mealNames: Map<string, string>;
}> {

    batchTranslateContent(cookingInstructions, 'cooking_in

    ingredients: ingredientsMap,
    cookingInstructions: cookingInstructionsMap






















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
