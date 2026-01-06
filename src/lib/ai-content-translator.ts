import type { Language } from './i18n/translations';

const translationCache = new Map<string, Record<Language, string>>();

  contentType: 'meal_name' | 'ingredien
  content: string,
  contentType: 'meal_name' | 'ingredient' | 'cooking_instruction',
  targetLanguage: Language
    return cached[ta

    en: 'English',
   

    nl: 'Dutch',
    ro: 'Romanian',
  };
    return cached[targetLanguage];
  }

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
    cs: 'Czech',
  };

    const cached = translationCache.get(cacheKey)!;

  } catch (error) {
    return content;
}

  ingre
}

  targetLanguage: Language

  }

  const langu
    de: 'German',
    es: 'Spanish',
    pt: 'Portuguese',
    pl: 'Polish',
    cs: 'Czech',

  const uniqueIngredients = new Set<string>();

    uniqueMeal


    const mealNamesList = Array.from(uniqueMealNames);

    if (mealNamesList.length > 0) {


${mealNamesList.map((name, i) => `${i + 1}. ${name}
Requirements:

4. Return ONLY valid JSON in t
  "translations": [
    {"original": "meal name 2", "translated": "translated name 2"}
}`;
   
 

        });
    }
 
      const ingredientsPrompt = `You are translating ingredient names from English to ${languageNames[targetLanguage]} for a meal planning application.

Translate each ingredient name below. Return the result as a valid JSON object with a single property called "translations" that contains an array of objects with "original" and "translated" properties.

Ingredients to translate:
${ingredientsList.map((name, i) => `${i + 1}. ${name}`).join('\n')}

Requirements:
1. Use standard culinary terms for ${languageNames[targetLanguage]}
2. Keep translations simple and clear
3. Return ONLY valid JSON in this format:
{
  "translations": [
    {"original": "ingredient 1", "translated": "translated ingredient 1"},
    {"original": "ingredient 2", "translated": "translated ingredient 2"}
  ]
}`;

      const ingredientsResult = await window.spark.llm(ingredientsPrompt, 'gpt-4o-mini', true);
      const ingredientsData = JSON.parse(ingredientsResult);
      
      if (ingredientsData.translations && Array.isArray(ingredientsData.translations)) {
        ingredientsData.translations.forEach((item: any) => {
          translationsMap.set(`ingredient:${item.original}`, item.translated);
        });
      }
    }

    if (instructionsList.length > 0) {
      const instructionsPrompt = `You are translating cooking instructions from English to ${languageNames[targetLanguage]} for a meal planning application.

Translate each cooking instruction below. Return the result as a valid JSON object with a single property called "translations" that contains an array of objects with "original" and "translated" properties.

Instructions to translate:
${instructionsList.map((inst, i) => `${i + 1}. ${inst}`).join('\n')}

Requirements:
1. Use imperative form (command form) as is standard in recipes
2. Keep translations clear and actionable
3. Maintain important details like measurements and cooking methods
4. Return ONLY valid JSON in this format:
{
  "translations": [
    {"original": "instruction 1", "translated": "translated instruction 1"},
    {"original": "instruction 2", "translated": "translated instruction 2"}
  ]
}`;

      const instructionsResult = await window.spark.llm(instructionsPrompt, 'gpt-4o-mini', true);
      const instructionsData = JSON.parse(instructionsResult);
      
      if (instructionsData.translations && Array.isArray(instructionsData.translations)) {
        instructionsData.translations.forEach((item: any) => {
          translationsMap.set(`instruction:${item.original}`, item.translated);
        });
      }
    }

    return translationsMap;
  } catch (error) {
    console.error('Batch translation failed:', error);
    return translationsMap;
  }
}

export function clearTranslationCache() {
  translationCache.clear();
}
