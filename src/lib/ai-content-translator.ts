import type { Language } from './i18n/translations';

export async function translateContent(

  if (targetLanguage === 'en' || !conte
  }
  const cached = translati
    return cached[ta
  if (targetLanguage === 'en' || !content || content.trim() === '') {
    return content;
  }

  const cached = translationCache.get(content);
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
      cs: 'Czech'
    };

    const prompt = window.spark.llmPrompt`Translate the following text to ${languageNames[targetLanguage]}. Return ONLY the translated text, no explanations:

${content}`;

    console.error('Translation error:', error);


  items: string[],
  con
  const resultMap = new Map<string, string>();
  if (targetLanguage === 'en') {


  items.forEach(ite
    if (cached && cached[targetLanguage]) {
    } else {
   



    const language
      de: 'German',
      es: 'Spanish',
      pt: 'Portuguese',
      pl: 'Polish',


      ingredient: `These are food ingredient names. T
      cooking_instruc



${uncachedItems.map((item
Return format: ["translation1", "translation2"
    const response = await window.spark.llm
    const translations = Array.isArray(parsed) ? p
    uncached
      resultMap.set(item, trans
     
     


  } catch (error) {
   


  mealNames: string[],
  cookingInstruction
): Promise<{
  ingredients: Map<
}> {
    return {
      ingredients: new 
    };

    batchTranslateCon
    batchTranslat


    cookingInstructions: cookingInstructionsMap
}


































































