import type { Language } from './i18n/translations';

export async function translateContent(

export async function translateContent(
  content: string,
  contentType: 'meal_name' | 'ingredient' | 'cooking_instruction',
  targetLanguage: Language
): Promise<string> {
  if (targetLanguage === 'en') {
    return content;
  }

  const cacheKey = `${contentType}:${content}`;
  const cached = translationCache.get(cacheKey);
  if (cached && cached[targetLanguage]) {
    const languageNames: Record<La
   

      p
      pl: 'Polish',
      cs: 'Czech',

    if (contentType
2. Keep cultural con
    } else if (conte
2. Keep measurements an
    } else {
2. Keep technical c
    }
    const promptTe
Conten

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
    const cacheKey 
   
 


    return resultM

    const languageNames: R
      de: 'German',
      es: 'Spanish',
  
      pl: 'Polish',
      cs: 'Czech',

    if 
2. Keep cultural cont
   

    } else {
2. Keep technical cooking
    }
    const itemsList = uncachedItems.map((item, idx
    const promptText = `Translate these ${c
Items to translate:

${instructions}
Retur
  {"o

    const prompt = window.spark.llm
    const data = JSON
   

       
          translationCache.set(cacheKey, cacheEntry);
        }
    }
    console.error('
      resultMap.set(
  }
  return resultMap;

  meals: Array<{
    ingredients: Arra
  }>,
): Pro

  meals.forEach(meal => {
    meal.ingredients.forEach(ing => al
  });
  const uniqueTexts = Array.from(new Set(a
  const mealNames = meals.map(m => m.recipe_name);
  const instructions = Array.from(new Set(meal
  const [mealNamesMap, ingredientsMap, instructionsMap] = await Promise.all([
    batchTranslateContent(ingredients, 'i
  ]);
  mealNamesM
  instructionsMap.forEach((translated, original) => resultMap.set(o
  return resultMap;







Items to translate:
${itemsList}

Requirements:
${instructions}

Return ONLY a JSON array with objects in this exact format:
[
  {"original": "item 1", "translated": "translated text 1"},
  {"original": "item 2", "translated": "translated text 2"}
]`;

    const response = await window.spark.llm(prompt, 'gpt-4o-mini', true);
    const data = JSON.parse(response);
    
    if (data.translations && Array.isArray(data.translations)) {
      data.translations.forEach((t: { original: string; translated: string }) => {
        if (t.original && t.translated) {
          const cacheKey = `${contentType}:${t.original}`;
          const cacheEntry = translationCache.get(cacheKey) || {} as Record<Language, string>;
          cacheEntry[targetLanguage] = t.translated;
          translationCache.set(cacheKey, cacheEntry);
          resultMap.set(t.original, t.translated);
        }
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
