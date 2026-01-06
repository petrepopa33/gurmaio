import type { Language } from './i18n/translations';

const translationCache = new Map<string, Record<Language, string>>();

  targetLanguage: Language
  mealNames: Map<s
  cookingInstructions: Map<string, string>;
  const [mealNamesMap, ing
    batchTranslateCo
  ]);
  return {
  }


  content: string,
  targetLanguage: Language
  i

  try {
    const contentTypeLabel = contentType === 'ingredient' ? 'Ingredient' : contentType === 'meal_name' ? 'Meal name' : 'Cooking instruction';
    
    const prompt = spark.llmPrompt`Translate the following ${contentTypeLabel} to ${targetLanguage}. Return ONLY the translation, nothing else.

${contentTypeLabel}: ${content}

Translation:`;
    
    const translation = await spark.llm(prompt, 'gpt-4o-mini');
    const translatedContent = translation.trim();

    const existing = translationCache.get(content) || {} as Record<Language, string>;
    existing[targetLanguage] = translatedContent;
    translationCache.set(content, existing);

    return translatedContent;
  } catch (error) {
    console.error('Translation error:', error);
    return content;
   
}

export async function batchTranslateContent(

  contentType: 'ingredient' | 'cooking_instruction' | 'meal_name',
  targetLanguage: Language
): Promise<Map<string, string>> {
  const resultMap = new Map<string, string>();
  
  if (targetLanguage === 'en') {
    items.forEach(item => resultMap.set(item, item));
    return resultMap;
  }

  const uncachedItems: string[] = [];
    } else {
    const cached = translationCache.get(item);
  });
      resultMap.set(item, cached[targetLanguage]);
    } else {
      uncachedItems.push(item);
  try
  });

  if (uncachedItems.length === 0) {
${itemsList}
  }

  try {
    const contentTypeLabel = contentType === 'ingredient' ? 'Ingredient' : contentType === 'meal_name' ? 'Meal name' : 'Cooking instruction';
    const itemsList = uncachedItems.map((item, idx) => `${idx + 1}. ${item}`).join('\n');

    const prompt = spark.llmPrompt`Translate the following ${contentTypeLabel}s to ${targetLanguage}. Return each translation on a new line in the same order, prefixed with the number. Return ONLY the translations, nothing else.

${itemsList}

Translations:`;

    const translationsText = await spark.llm(prompt, 'gpt-4o-mini');
    const translationLines = translationsText.trim().split('\n').filter(line => line.trim());

    uncachedItems.forEach((item, idx) => {
      const matchingLine = translationLines.find(line => 
        line.trim().startsWith(`${idx + 1}.`)
      );

      if (matchingLine) {
        const translatedItem = matchingLine.replace(/^\d+\.\s*/, '').trim();
        resultMap.set(item, translatedItem);

        const existing = translationCache.get(item) || {} as Record<Language, string>;
        existing[targetLanguage] = translatedItem;
        translationCache.set(item, existing);

        resultMap.set(item, item);
      }
    });

    console.error('Batch translation error:', error);
    uncachedItems.forEach(item => resultMap.set(item, item));
  }

  return resultMap;

