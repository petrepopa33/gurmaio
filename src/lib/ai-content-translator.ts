import type { Language } from './i18n/translations';

  contentType: 'ingredient' | 'meal_n
): Promise<Map<str

    items.forEach(item => 
  }
  items.forEach(item => {

  if (targetLanguage === 'en') {
    items.forEach(item => resultMap.set(item, item));
    return resultMap;
  }

  items.forEach(item => {
    if (!item || item.trim() === '') {
      return;
    }
    c

      fr: 'French',
  
      nl: 'Dutch',
      ro: 'Romanian',
   

      m
    };
    const prompt = (window.spark.llmPrompt as any)`Yo
Input items (as JSON

- Maintain culinary
- For cooking instru

{
  "original item 2
      pl: 'Polish',
      ro: 'Romanian',
      cs: 'Czech'
    };

    const contentTypeLabels = {
      ingredient: 'ingredient names',
      meal_name: 'meal/recipe names',
      cooking_instruction: 'cooking instructions'
    };

    const prompt = window.spark.llmPrompt`You are a culinary translation expert. Translate the following ${contentTypeLabels[contentType]} from English to ${languageNames[targetLanguage]}.

Input items (as JSON array):
${itemsJson}

Instructions:
- Maintain culinary accuracy and cultural appropriateness
- Keep ingredient names authentic to the target language
- For cooking instructions, preserve technical cooking terms
- Return ONLY a valid JSON object where keys are the original English items and values are the translations

Example format:
{
  "original item 1": "translated item 1",
  "original item 2": "translated item 2"
}

Return ONLY the JSON object, no additional text.`;

    const response = await window.spark.llm(prompt, 'gpt-4o-mini', true);
    const translations = JSON.parse(response);

    for (const [original, translated] of Object.entries(translations)) {
      if (typeof translated === 'string' && translated.trim() !== '') {
        resultMap.set(original, translated);
  ]);
  return {
    mea
  };































