import type { Language } from '@/lib/i18n/translations';

  de: 'German',
  es: 'Spanish',
  de: 'German',
  fr: 'French',
  es: 'Spanish',
  it: 'Italian',
  cs: 'Czech',

  items: string
  contentType: st
  const result
  


    return resultM

  
    const languageName = LANGUAGE
    

- Maintain the original meaning 
- Keep measurements and numbers unchanged
- Do not include any 
Ite


    const translation
   

      } else {
  

  } catch (error) {
    
  }

  ingredients: s
  cookingInstructions: string[],
): Promise<{
  mealNames: Map<string, string>;
}> {
    translateBatchContent(ingredients, targetLanguag


    ingredients: ingredientsMap,

}















    console.error('Translation error:', error);
    uniqueItems.forEach(item => resultMap.set(item, item));
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
  const [ingredientsMap, mealNamesMap, instructionsMap] = await Promise.all([
    translateBatchContent(ingredients, targetLanguage, 'ingredient names'),
    translateBatchContent(mealNames, targetLanguage, 'recipe names'),
    translateBatchContent(cookingInstructions, targetLanguage, 'cooking instructions'),
  ]);

  return {
    ingredients: ingredientsMap,
    mealNames: mealNamesMap,
    cookingInstructions: instructionsMap,
  };
}
