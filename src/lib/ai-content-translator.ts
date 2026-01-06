import type { Language } from './i18n/translations';

export async function translateContent(

export async function translateContent(
  content: string,
  targetLanguage: Language
): Promise<string> {
  const cached = translationCache.get(conten
    return cached[t


      de: 'German',
      es: 'Spanish',
      pt: 'Portuguese',
   

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

    const prompt = window.spark.llmPrompt`Translate the following text to ${languageNames[targetLanguage]}. Return ONLY the translation, nothing else:

${content}`;


  it
  targetLanguage: Language
  const resultMap = new Map<string, string>();
  if 
    return resultMap;

  it
    if (cached && cache
    } else {
    }

   


      de: 'German',
      es: 'Spanish
      pt: 'Portuguese',
      pl: 'Polish',
      cs: 'Czech',

  
      cooking_instruction: `Translate cooking ins

    


Return the translations as a JSON obj
    const response = awai
    const translations: string[] = parsed.tran
    uncachedItems.forEach((item, index) => 
      resultMap.set(item, translation);
      if (!t
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

    const contextInstructions: Record<typeof contentType, string> = {
      meal_name: `Translate meal/recipe names to ${languageNames[targetLanguage]}. Keep cultural context where appropriate.`,
      ingredient: `Translate ingredient names to ${languageNames[targetLanguage]}. Keep measurements and quantities as-is.`,
      cooking_instruction: `Translate cooking instructions to ${languageNames[targetLanguage]}. Keep technical cooking terms accurate.`,
    };

    const itemsList = uncachedItems.map((item, i) => `${i + 1}. ${item}`).join('\n');
    
    const prompt = window.spark.llmPrompt`${contextInstructions[contentType]}

Items to translate:
${itemsList}

Return the translations as a JSON object with a single property "translations" that contains an array of translated strings in the same order. Only return the JSON, nothing else.`;

    const response = await window.spark.llm(prompt, 'gpt-4o-mini', true);
    const parsed = JSON.parse(response);
    const translations: string[] = parsed.translations || [];

    uncachedItems.forEach((item, index) => {
      const translation = translations[index] || item;
      resultMap.set(item, translation);
      
      if (!translationCache.has(item)) {
        translationCache.set(item, {} as Record<Language, string>);
      }
      const cacheEntry = translationCache.get(item)!;
      cacheEntry[targetLanguage] = translation;
    });

    return resultMap;
  } catch (error) {
    console.error('Batch translation error:', error);
    uncachedItems.forEach(item => resultMap.set(item, item));
    return resultMap;
  }
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
  if (targetLanguage === 'en') {
    return {


















