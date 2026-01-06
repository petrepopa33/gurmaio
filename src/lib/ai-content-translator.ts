import type { Language } from '@/lib/i18n/translations';

const LANGUAGE_NAMES: Record<Language, string> = {
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

async function translateBatchContent(
  items: string[],
  targetLanguage: Language,
  contentType: string
): Promise<Map<string, string>> {
  const resultMap = new Map<string, string>();
  
  if (targetLanguage === 'en') {
    items.forEach(item => resultMap.set(item, item));
    return resultMap;
  }

  if (items.length === 0) {
    return resultMap;
  }

  const uniqueItems = Array.from(new Set(items));
  
  try {
    const languageName = LANGUAGE_NAMES[targetLanguage] || targetLanguage;
    const itemsList = uniqueItems.map(item => `"${item}"`).join('\n');
    
    const promptText = `You are a professional food and recipe translator. Translate the following ${contentType} from English to ${languageName}.

Important rules:
- Maintain the original meaning and culinary accuracy
- Use natural, native expressions for food terms
- Keep measurements and numbers unchanged
- Return ONLY a JSON object with the format: {"original text": "translated text"}
- Do not include any explanations or additional text

Items to translate:
${itemsList}

Return the result as a valid JSON object with original text as keys and translated text as values.`;

    const translationResult = await window.spark.llm(promptText, 'gpt-4o', true);
    const translations = JSON.parse(translationResult);
    
    uniqueItems.forEach(item => {
      const translated = translations[item];
      if (translated) {
        resultMap.set(item, translated);
      } else {
        resultMap.set(item, item);
      }
    });

    return resultMap;
  } catch (error) {
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
