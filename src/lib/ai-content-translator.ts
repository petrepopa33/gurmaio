import type { Language } from '@/lib/i18n/translations';

const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  es: 'Spanish'
  pt: 'Portugue
  pl: 'Polish',
  cs: 'Czech',
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
  
  if (targetLanguage === 'en' || items.length === 0) {
    items.forEach(item => resultMap.set(item, item));
    return resultMap;
  }

  try {
    const uniqueItems = Array.from(new Set(items));
    const languageName = LANGUAGE_NAMES[targetLanguage] || targetLanguage;
    
    const prompt = window.spark.llmPrompt`You are a professional food and recipe translator. Translate the following ${contentType} from English to ${languageName}.

Rules:
- Translate naturally and idiomatically
- Maintain the original meaning and culinary context
- Keep measurements and numbers unchanged
- Do not include any explanations, only provide translations
- Return a JSON object where keys are the original English text and values are the translations

Items to translate:
${uniqueItems.join('\n')}

Return the result as a JSON object.`;

    const result = await window.spark.llm(prompt, 'gpt-4o-mini', true);
    
    try {
      const translation = JSON.parse(result);
      
      if (typeof translation === 'object' && translation !== null) {
        Object.entries(translation).forEach(([key, value]) => {
          if (typeof value === 'string') {
            resultMap.set(key, value);
          }
        });
      }
    } catch (parseError) {
      console.warn('Failed to parse translation result:', parseError);
      uniqueItems.forEach(item => resultMap.set(item, item));
    }
  } catch (error) {
    console.error('Translation error:', error);
    items.forEach(item => resultMap.set(item, item));
  }

  cookingInstructio
)

}> {
    translateBatchConten
    translateBatchCont

    ingredients: ingredien
    cookingI
}















