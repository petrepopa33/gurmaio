import type { Language } from './i18n/translations';

export async function translateContentBatch(
  items: string[],

    items.forEach(item => resultMap.set(item, item));
  }
  const uniqueItems = Array.from(new Set(items

  if (targetLanguage === 'en') {
    items.forEach(item => resultMap.set(item, item));
    return resultMap;
   

  const uniqueItems = Array.from(new Set(items)).filter(item => item && item.trim() !== '');
  
  if (uniqueItems.length === 0) {
    return resultMap;
  }

      n
    const itemsJson = JSON.stringify(uniqueItems);
    
    const languageNames: Record<Language, string> = {
      en: 'English',
      de: 'German',
      fr: 'French',
      es: 'Spanish',
    const prompt = w
      pt: 'Portuguese',
      nl: 'Dutch',
      pl: 'Polish',
- Maintain culinary a
      cs: 'Czech'
- Retu

  }
  return resultMap;


































  }

  return resultMap;
}
