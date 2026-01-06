import type { Language } from './i18n/translations';

export async function translateContent(

export async function translateContent(
  content: string,
  contentType: 'meal_name' | 'ingredient' | 'cooking_instruction',
  targetLanguage: Language
    return cached[ta

    en: 'English',
   

    nl: 'Dutch',
    ro: 'Romanian',
  };
  const contextPrompts: Record<typ
   

  try {
    const prompt =
Task: Translate t
Original text: "$
Requirements:
2. Keep the transl
4. For ingredients: U
6. Maintain any 


    const cleane
    

  const contextPrompts: Record<typeof contentType, string> = {
    meal_name: 'You are translating a recipe/meal name for a meal planning application.',
    ingredient: 'You are translating a food ingredient name for a meal planning application.',
    cooking_instruction: 'You are translating a cooking instruction step for a meal planning application.',
  };

  try {
    const prompt = window.spark.llmPrompt`${contextPrompts[contentType]}

Task: Translate the following ${contentType === 'meal_name' ? 'recipe/meal name' : contentType === 'ingredient' ? 'ingredient name' : 'cooking instruction'} from English to ${languageNames[targetLanguage]}.

Original text: "${content}"

Requirements:
1. Provide ONLY the translated text, no explanations or additional text
2. Keep the translation natural and culturally appropriate
3. For meal names: Keep them appetizing and descriptive
4. For ingredients: Use standard culinary terms for that language
5. For cooking instructions: Use imperative form (command form) as is standard in recipes
6. Maintain any important details like measurements or cooking methods
7. DO NOT add quotes or formatting - just the plain translated text

Translation:`;

    const translation = await window.spark.llm(prompt, 'gpt-4o-mini', false);
    const cleanedTranslation = translation.trim().replace(/^["']|["']$/g, '');

    if (!translationCache.has(cacheKey)) {
      translationCache.set(cacheKey, { en: content } as Record<Language, string>);
    }
    const cached = translationCache.get(cacheKey)!;
    cached[targetLanguage] = cleanedTranslation;

























































