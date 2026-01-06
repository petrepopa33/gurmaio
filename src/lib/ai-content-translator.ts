import type { Language } from './i18n/translations';

export async function translateContent(

): Promise<string> {
    return content

  if (cached && cached[tar
): Promise<string> {
  if (targetLanguage === 'en' || !content || content.trim() === '') {
    return content;
   

  const cached = translationCache.get(content);
  if (cached && cached[targetLanguage]) {
    return cached[targetLanguage];
  }


    existing[targetLangu

  } catch (error) {
    return content;
}

  contentType: 'ingredient' | 'cooking_instruction' | 'meal_name',
): P
  

  }
  const uncachedItems: string[] = [];
    const cached = translationCache.get(item

      uncachedItems.pu
  });
  if (uncachedItems.length === 0) {
  }
  t
 


    

    
    
    
  
      const matchingLine = trans
      );
      if (matchingLin
   

      resultMap.set(item, translatedI
      const existing = tr
      translationCache.set(item, existing);
  } catch (error) {
    uncachedItems.forEach(item => resultMap.set(it

}
expor
  ing

  mealNames: Map<string, string>;
  cookingInstructions
  c

  ]);
  return {
    ingredients: ingredientsMap,
  };




























      const existing = translationCache.get(item) || {};
      existing[targetLanguage] = translatedItem;
      translationCache.set(item, existing);
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
    batchTranslateContent(cookingInstructions, 'cooking_instruction', targetLanguage)
  ]);

  return {
    mealNames: mealNamesMap,
    ingredients: ingredientsMap,
    cookingInstructions: cookingInstructionsMap
  };
}
