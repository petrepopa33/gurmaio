import type { Language } from './i18n/translations';

export async function translateAIContent(

export async function translateAIContent(
  content: string,
  contentType: 'meal_name' | 'ingredient' | 'cooking_instruction',
  targetLanguage: Language
): Promise<string> {
  if (targetLanguage === 'en') {
    return content;
  }

  const cacheKey = `${contentType}:${content}`;
  const cached = translationCache.get(cacheKey);
  if (cached && cached[targetLanguage]) {
    return cached[targetLanguage];
  }

  try {
    const languageNames: Record<Language, string> = {
      en: 'English',
      de: 'German',
      es: 'Spanish',
      fr: 'French',
      it: 'Italian',
      pt: 'Portuguese',
      nl: 'Dutch',
      pl: 'Polish',
      ro: 'Romanian',
      cs: 'Czech',
    };


    
    
      translationCache.set(cacheKey, {} as Record
    

    return translated.trim();
    
  }

  items: Array<{ content: string; type: 'm
): Promise<Map<string, string>> {
    c
    
    return resultMap;


    const languageNames: Reco
      de: 'German',
      fr: 'French',
      pt: 'Portugue
   
 

    const ingredients = items.filter(i => i.

      const mealNamesList 

${mealNamesList.map((name, i) =>
Requirements:
2. Keep cultural context wh

{
    return resultMap;
  }

  const translationsMap = new Map<string, string>();

  try {
    const languageNames: Record<Language, string> = {
      en: 'English',
      de: 'German',
      es: 'Spanish',
      fr: 'French',
      it: 'Italian',
      pt: 'Portuguese',
      nl: 'Dutch',
      pl: 'Polish',
      ro: 'Romanian',
      cs: 'Czech',
    };

    const mealNames = items.filter(i => i.type === 'meal_name');
    const ingredients = items.filter(i => i.type === 'ingredient');
    const instructions = items.filter(i => i.type === 'cooking_instruction');

    if (mealNames.length > 0) {
      const mealNamesList = mealNames.map(m => m.content);
      const mealNamesPrompt = window.spark.llmPrompt`Translate these meal/recipe names from English to ${languageNames[targetLanguage]}. Return the result as a valid JSON object with a single property called "translations" that contains an array of objects with "original" and "translated" properties.

Meal names to translate:
${mealNamesList.map((name, i) => `${i + 1}. ${name}`).join('\n')}

Requirements:
1. Use natural, appetizing language
2. Keep cultural context where appropriate
3. Make translations sound delicious and appealing

Return ONLY valid JSON in this format:
{
  "translations": [
    {"original": "meal name 1", "translated": "translated name 1"},
    {"original": "meal name 2", "translated": "translated name 2"}
  ]
}`;
      
      const mealNamesResult = await window.spark.llm(mealNamesPrompt, 'gpt-4o-mini', true);
      const mealNamesData = JSON.parse(mealNamesResult);
      
      if (mealNamesData.translations && Array.isArray(mealNamesData.translations)) {
        mealNamesData.translations.forEach((item: any) => {
          translationsMap.set(item.original, item.translated);
        });
      }
    }

    if (ingredients.length > 0) {
      const ingredientsList = ingredients.map(i => i.content);
      const ingredientsPrompt = window.spark.llmPrompt`Translate each ingredient name below from English to ${languageNames[targetLanguage]}. Return the result as a valid JSON object with a single property called "translations" that contains an array of objects with "original" and "translated" properties.

Ingredients to translate:
${ingredientsList.map((name, i) => `${i + 1}. ${name}`).join('\n')}

Requirements:
1. Use standard culinary terms
2. Keep it simple and clear
3. Return ONLY valid JSON in this format:
{
  "translations": [
          translationsMap.set(item.original, item.translated);
      }

  }
    co
      fallbackMap.set(item.content, item.content);
    return fallbackMap;
}
export async function translateMealPlanContent(
    recipe_name: string;
    cooking_instructions: string[];
  targetLan
  const
  mea

    });
      items.push({ content: inst, type: 'cooking_instruction' })
  });


  translationCache.clear();



























































