import type { Language } from './i18n/translations';

const translationCache = new Map<string, Record<Language, string>>();

export async function translateContent(
  content: string,
  targetLanguage: Language,
  contentType: 'meal_name' | 'ingredient' | 'cooking_instruction'
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
      fr: 'French',
      es: 'Spanish',
      it: 'Italian',
      pt: 'Portuguese',
      nl: 'Dutch',
      pl: 'Polish',
      ro: 'Romanian',
      cs: 'Czech',
    };

    let instructions = '';
    if (contentType === 'meal_name') {
      instructions = `1. Use natural, appetizing language
2. Keep cultural context where appropriate
3. Make translations sound delicious and appealing`;
    } else if (contentType === 'ingredient') {
      instructions = `1. Use the common culinary term in ${languageNames[targetLanguage]}
2. Keep measurements and quantities as-is
3. Use the most familiar local name for the ingredient`;
    } else {
      instructions = `1. Use clear, imperative cooking instructions
2. Keep technical cooking terms accurate
3. Make instructions easy to follow`;
    }

    const prompt = window.spark.llmPrompt`Translate this ${contentType.replace('_', ' ')} from English to ${languageNames[targetLanguage]}.

Content to translate: "${content}"

Requirements:
${instructions}

Return ONLY the translated text, nothing else.`;

    const translation = await window.spark.llm(prompt, 'gpt-4o-mini');
    
    const cacheEntry = translationCache.get(cacheKey) || {} as Record<Language, string>;
    cacheEntry[targetLanguage] = translation.trim();
    translationCache.set(cacheKey, cacheEntry);
    
    return translation.trim();
  } catch (error) {
    console.error('Translation error:', error);
    return content;
  }
}

export async function batchTranslateContent(
  items: string[],
  contentType: 'meal_name' | 'ingredient' | 'cooking_instruction',
  targetLanguage: Language
): Promise<Map<string, string>> {
  const resultMap = new Map<string, string>();
  
  if (targetLanguage === 'en') {
    items.forEach(item => resultMap.set(item, item));
    return resultMap;
  }

  const uncachedItems: string[] = [];
  items.forEach(item => {
    const cacheKey = `${contentType}:${item}`;
    const cached = translationCache.get(cacheKey);
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

    let instructions = '';
    if (contentType === 'meal_name') {
      instructions = `1. Use natural, appetizing language
2. Keep cultural context where appropriate
3. Make translations sound delicious and appealing`;
    } else if (contentType === 'ingredient') {
      instructions = `1. Use the common culinary term in ${languageNames[targetLanguage]}
2. Keep measurements and quantities as-is
3. Use the most familiar local name for the ingredient`;
    } else {
      instructions = `1. Use clear, imperative cooking instructions
2. Keep technical cooking terms accurate
3. Make instructions easy to follow`;
    }

    const itemsList = uncachedItems.map((item, i) => `${i + 1}. ${item}`).join('\n');
    const prompt = window.spark.llmPrompt`Translate these ${contentType.replace('_', ' ')}s from English to ${languageNames[targetLanguage]}.

Items to translate:
${itemsList}

Requirements:
${instructions}

Return ONLY a JSON array with this exact format:
[
  {"original": "item 1", "translated": "translated item 1"},
  {"original": "item 2", "translated": "translated item 2"}
]`;

    const response = await window.spark.llm(prompt, 'gpt-4o-mini', true);
    const data = JSON.parse(response);
    
    if (data.translations && Array.isArray(data.translations)) {
      data.translations.forEach((t: { original: string; translated: string }) => {
        const cacheKey = `${contentType}:${t.original}`;
        const cacheEntry = translationCache.get(cacheKey) || {} as Record<Language, string>;
        cacheEntry[targetLanguage] = t.translated;
        translationCache.set(cacheKey, cacheEntry);
        resultMap.set(t.original, t.translated);
      });
    }
  } catch (error) {
    console.error('Batch translation error:', error);
    uncachedItems.forEach(item => {
      resultMap.set(item, item);
    });
  }

  return resultMap;
}

export async function translateMealPlanContent(
  meals: Array<{
    recipe_name: string;
    ingredients: Array<{ name: string }>;
    cooking_instructions: string[];
  }>,
  targetLanguage: Language
): Promise<Map<string, string>> {
  const resultMap = new Map<string, string>();

  if (targetLanguage === 'en') {
    return resultMap;
  }

  const allRecipeNames = meals.map(m => m.recipe_name);
  const allIngredients: string[] = [];
  const allInstructions: string[] = [];

  meals.forEach(meal => {
    meal.ingredients.forEach(ing => {
      if (!allIngredients.includes(ing.name)) {
        allIngredients.push(ing.name);
      }
    });
    meal.cooking_instructions.forEach(inst => {
      if (!allInstructions.includes(inst)) {
        allInstructions.push(inst);
      }
    });
  });

  const [recipeNamesMap, ingredientsMap, instructionsMap] = await Promise.all([
    batchTranslateContent(allRecipeNames, 'meal_name', targetLanguage),
    batchTranslateContent(allIngredients, 'ingredient', targetLanguage),
    batchTranslateContent(allInstructions, 'cooking_instruction', targetLanguage),
  ]);

  recipeNamesMap.forEach((translated, original) => resultMap.set(original, translated));
  ingredientsMap.forEach((translated, original) => resultMap.set(original, translated));
  instructionsMap.forEach((translated, original) => resultMap.set(original, translated));

  return resultMap;
}
