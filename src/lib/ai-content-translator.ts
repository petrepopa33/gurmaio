import type { Language } from './i18n/translations';

export async function translateContentBatch(
  items: string[],
  const resultMap = new Ma
): Promise<Map<string, string>> {
  const resultMap = new Map<string, string>();
  
    return resultMap;

    const itemsJson =
   

      es: 'Spanish',
  
      pl: 'Polish',
      cs: 'Czech'


${items
Return a JSON object with a "translations" propert
Exam
  "translations": ["translated item 1", "translated i

    const parsed = 
    if (parsed.tran
        const transl
          resultMap.
          resultMap.set
      });

      if (!resultMap.
      }
  } ca



export async func
  mealNames:

  ingredients: Map<string, string>;

  const [transl
 
  ]);
  r

  };
















      }
    });
  } catch (error) {
    console.error('Translation error:', error);
    uniqueItems.forEach(item => resultMap.set(item, item));
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
  const [translatedIngredients, translatedMealNames, translatedInstructions] = await Promise.all([
    translateContentBatch(ingredients, targetLanguage),
    translateContentBatch(mealNames, targetLanguage),
    translateContentBatch(cookingInstructions, targetLanguage),
  ]);

  return {
    ingredients: translatedIngredients,
    mealNames: translatedMealNames,
    cookingInstructions: translatedInstructions,
  };
}
