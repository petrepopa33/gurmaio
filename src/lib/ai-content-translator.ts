import type { Language } from './i18n/translations';

export async function translateAIContent(

export async function translateAIContent(
  content: string,
  contentType: 'meal_name' | 'ingredient' | 'cooking_instruction',
  targetLanguage: Language

  
    const cached = 
   

  try {
  
      fr: 'French',
      it: 'Italian',
      nl: 'Dutch',
      ro: 'Romanian',
    }
   

    };
    const promptText = `Translate this ${contextMap[c
    
    
      translationCa
    
    cached[targetLan
    return translated.t
    console.error(
  }
      ro: 'Romanian',
      cs: 'Czech',
    };

    const contextMap = {
      meal_name: 'meal/recipe name',
      ingredient: 'ingredient name',
      cooking_instruction: 'cooking instruction',
    };

    const prompt = window.spark.llmPrompt`Translate this ${contextMap[contentType]} from English to ${languageNames[targetLanguage]}: "${content}". Return only the translated text, nothing else.`;
    
    const translated = await window.spark.llm(prompt, 'gpt-4o-mini', false);
    
    if (!translationCache.has(cacheKey)) {
      translationCache.set(cacheKey, {} as Record<Language, string>);
    }
    
    const cached = translationCache.get(cacheKey)!;
    cached[targetLanguage] = translated.trim();
    
    return translated.trim();
  } catch (error) {
    console.error('Translation failed:', error);
    return content;
  }
}

export async function batchTranslateContent(
  items: Array<{ content: string; type: 'meal_name' | 'ingredient' | 'cooking_instruction' }>,
  targetLanguage: Language
): Promise<Map<string, string>> {
    const uniqueMealNames = new Set<string>();

    ingredients.forEach(item => 
    const uniqueInstruction

    con

   

Meal na

1. Use natural, appe
3. Make translation
{
    {"original": "me
  ]

      const mealNa
      if (mealNames
          translation
      }


Translate each ingredient name below. Return the result as a valid JSO
Ingredients to translate:


3. Return ONLY valid JSON in this format:
  "translations": [

}`;
      const ingredientsResult = await window.spark.llm(ingredientsPro

        ingredientsData.translations.forEach((ite
        });

    if (instructionsList.length > 0) {



Requirements:
2. Keep translations clear and actionable

  "translations": [

}`;
      const instructionsResult = await window.spark.llm(instructi

        instr
        });
    }
    return translationsMap;
    console.error('Batch translation fail
 

  meals: Array<{
    ingredients: Array<{ name: string }>;
  }
): 

    items.push({ content: meal.recipe_name, type: 'meal_name' });
    meal.ingredients.forEach(ing => {
    })
    meal.cooking_instructions.forEach(inst => {
    });


  
    c

    }
    meal.ingredients.forEach(ing => {

        resultMap.set(ingKey, translatedIng);

    meal.cooking_instruct
      const translatedInst = translationsMap.get(`instruction:${ins

    });

}
export function clearTranslationCache() {
}
























































