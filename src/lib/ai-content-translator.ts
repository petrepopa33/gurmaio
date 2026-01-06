import type { Language } from './i18n/translations';

const translationCache = new Map<string, Record<Language, string>>();

}
  content: string,
  contentType: 'meal_name' | 'ingredient' | 'cooking_instruction',
  targetLanguage: Language
}
  if (targetLanguage === 'en') {
    return content;


    return cached[targetLanguage];

    const languageNames: Record<Language,
      de: 'German',
   

      p
      cs: 'Czech',

    if (contentType
2. Keep cultural co
    } else if (conte
2. Keep measurements
    } else {
2. Keep technical 
    }
    const prompt = (w
Content to transla
Requir


    
    cacheEntry[targetLanguage] = translation.trim();
    
  } catch (error) {
    return content;
}
export async function batchTranslateConte
  contentType: 'meal_name' | 'ingredient' | 'cooking_ins
): Promise<M
  
    items.forEach(item => {
    });
  }

    const cacheKey = `${contentType}:${item}`;

    } else {


    return resu

    const languageNames: Record<Language, string

      es: 'Spanish',
    
      pl: 'Polish',
      cs: 'Czech',

    
2. Keep cultural context where
    } else if (cont
2. Keep measurements and quantities as-is
    } else {
2. 
 

    const prompt = (window.spark.llmPrompt a
Items to translate

${instructions}
Return ONLY a JSON array with obj
  {"original": "item 1", "translated": "transl
]`
    const response = await windo
    
      data.translations.forEach(
       
          const cache
   

  } catch (error) {
    uncachedItems.forEach
    });

}
export async function translateMealPlanContent(
  targetLang
  const allItems: string[] = []
  mea
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

    const itemsList = uncachedItems.map((item, idx) => `${idx + 1}. "${item}"`).join('\n');

    const prompt = window.spark.llmPrompt`Translate these ${contentType.replace('_', ' ')}s from English to ${languageNames[targetLanguage]}.




































