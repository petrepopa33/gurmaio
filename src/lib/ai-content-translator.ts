import type { Language } from './i18n/translations';

const translationCache = new Map<string, Record<string, string>>();

export async function translateContent(
  content: string,
  contentType: 'ingredient' | 'cooking_instruction' | 'meal_name',
  targetLanguage: Language
): Promise<string> {
  if (targetLanguage === 'en' || !content || content.trim() === '') {
    return content;
  }

  const cached = translationCache.get(content);
  if (cached && cached[targetLanguage]) {
    return cached[targetLanguage];
  }

  try {
    const contextMap = {
      ingredient: 'food ingredient',
      cooking_instruction: 'cooking instruction',
      meal_name: 'meal or recipe name'
    };

    const prompt = (window.spark.llmPrompt as any)`Translate this ${contextMap[contentType]} to ${targetLanguage}. Return ONLY the translation, no explanations: "${content}"`;
    
    const translated = await window.spark.llm(prompt);

    const existing = translationCache.get(content) || {};
    existing[targetLanguage] = translated;
    translationCache.set(content, existing);

    return translated;
  } catch (error) {
    console.error('Translation error:', error);
    return content;
  }
}

export async function batchTranslateContent(
  items: string[],
  contentType: 'ingredient' | 'cooking_instruction' | 'meal_name',
  targetLanguage: Language
): Promise<Map<string, string>> {
  const resultMap = new Map<string, string>();
  
  if (targetLanguage === 'en') {
    items.forEach(item => resultMap.set(item, item));
    return resultMap;
  }

  const uncachedItems: string[] = [];
  items.forEach(item => {
    const cached = translationCache.get(item);
    if (cached && cached[targetLanguage]) {
      resultMap.set(item, cached[targetLanguage]);
    } else {
      uncachedItems.push(item);
    }
  });

  if (uncachedItems.length === 0) {
    return resultMap;
  }

  try {
    const contextMap = {
      ingredient: 'food ingredients',
      cooking_instruction: 'cooking instructions',
      meal_name: 'meal or recipe names'
    };

    const itemsList = uncachedItems.map((item, i) => `${i + 1}. ${item}`).join('\n');
    
    const prompt = (window.spark.llmPrompt as any)`Translate these ${contextMap[contentType]} to ${targetLanguage}. Return ONLY the translations in the same numbered format, one per line:

${itemsList}`;
    
    const translated = await window.spark.llm(prompt);
    
    const translatedLines = translated.split('\n').filter(line => line.trim());
    
    uncachedItems.forEach((item, index) => {
      let translatedItem = item;
      
      const matchingLine = translatedLines.find(line => 
        line.startsWith(`${index + 1}.`) || line.startsWith(`${index + 1} `)
      );
      
      if (matchingLine) {
        translatedItem = matchingLine.replace(/^\d+[\.\)\s]+/, '').trim();
      } else if (translatedLines[index]) {
        translatedItem = translatedLines[index].replace(/^\d+[\.\)\s]+/, '').trim();
      }
      
      resultMap.set(item, translatedItem);
      
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
