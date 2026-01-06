import type { Language } from './i18n/translations';

  targetLanguage: Language
  const resultMap 
  targetLanguage: Language
): Promise<Map<string, string>> {
  const resultMap = new Map<string, string>();
  
  if (targetLanguage === 'en' || items.length === 0) {
    items.forEach(item => resultMap.set(item, item));
    return resultMap;
  }

  const uniqueItems = Array.from(new Set(items));

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
      cs: 'Czech'
    };

    const prompt = spark.llmPrompt`You are a professional translator specializing in food and nutrition content.

Translate the following items to ${languageNames[targetLanguage]}.

${uniqueItems.map((item, i) => `${i + 1}. ${item}`).join('\n

  "original text 1": "translated text 1",

    const response 


        resultM
 
    });
    console.error('Translation error:', 
  }


  ingredients: string[],

): Promise<{
  mealNames: Map<string, string>;
}> {
    translateContentBatch(ingredients, t
    translateC

    ing
    coo
}





























