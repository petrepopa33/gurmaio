import type { ShoppingList } from '@/types/domain';
import { translations, type Language } from '@/lib/i18n/translations';
import { translateIngredient } from '@/lib/i18n/content-translations';
import { groupItemsByCategory, CATEGORIES } from '@/lib/ingredient-categories';

export function generateShoppingListText(
  shoppingList: ShoppingList,
  language: Language = 'en',
  onlyUnowned: boolean = true
): string {
  const t = translations[language];
  const items = onlyUnowned
    ? shoppingList.items.filter(item => !item.owned && !item.deleted)
    : shoppingList.items.filter(item => !item.deleted);

  const header = `🛒 ${t.shoppingList} - ${t.appName}\n`;
  const separator = '━━━━━━━━━━━━━━━━━━━━━\n\n';
  
  const groupedItems = groupItemsByCategory(items);
  const sortedCategories = Array.from(groupedItems.keys()).sort(
    (a, b) => CATEGORIES[a].sortOrder - CATEGORIES[b].sortOrder
  );

  const categorizedList = sortedCategories
    .map(category => {
      const categoryItems = groupedItems.get(category)!;
      const config = CATEGORIES[category];
      const categoryHeader = `${config.icon} ${config.label.toUpperCase()}\n`;
      
      const itemsList = categoryItems
        .map((item) => {
          const name = translateIngredient(item.display_name, language);
          const quantity = `${item.total_quantity}${item.unit}`;
          const price = `€${item.estimated_price_eur.toFixed(2)}`;
          return `  • ${name}\n    ${quantity} • ${price}`;
        })
        .join('\n');
      
      return categoryHeader + itemsList;
    })
    .join('\n\n');

  const totalCost = items.reduce((sum, item) => sum + item.estimated_price_eur, 0);
  const footer = `\n\n${separator}${t.total}: €${totalCost.toFixed(2)}\n${t.items}: ${items.length}`;

  return header + separator + categorizedList + footer;
}

export function shareViaWhatsApp(text: string): void {
  const encodedText = encodeURIComponent(text);
  const whatsappUrl = `https://wa.me/?text=${encodedText}`;
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
}

export function shareViaEmail(
  text: string,
  subject: string = 'Shopping List from Gurmaio'
): void {
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(text);
  const mailtoUrl = `mailto:?subject=${encodedSubject}&body=${encodedBody}`;
  window.location.href = mailtoUrl;
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  return new Promise((resolve, reject) => {
    try {
      document.execCommand('copy');
      textArea.remove();
      resolve();
    } catch (err) {
      textArea.remove();
      reject(err);
    }
  });
}
