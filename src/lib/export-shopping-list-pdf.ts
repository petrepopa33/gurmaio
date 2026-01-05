import jsPDF from 'jspdf';
import type { ShoppingList } from '@/types/domain';
import type { Language } from '@/lib/i18n/translations';
import { translations } from '@/lib/i18n/translations';
import { translateIngredient } from '@/lib/i18n/content-translations';
import { groupItemsByCategory, CATEGORIES } from '@/lib/ingredient-categories';

export function exportShoppingListToPDF(
  shoppingList: ShoppingList,
  language: Language = 'en',
  multiplier: number = 1
) {
  const t = translations[language];
  const doc = new jsPDF();
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPosition = margin;

  const addNewPageIfNeeded = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  const drawLine = (y: number, color: string = '#E5E7EB') => {
    doc.setDrawColor(color);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
  };

  const drawCheckbox = (x: number, y: number) => {
    doc.setDrawColor('#9CA3AF');
    doc.setLineWidth(0.5);
    doc.rect(x, y - 3, 4, 4);
  };

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor('#15803D');
  doc.text(t.shoppingList, margin, yPosition);
  yPosition += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor('#6B7280');
  doc.text(`${t.appName} - ${new Date(shoppingList.generated_at).toLocaleDateString(language)}`, margin, yPosition);
  yPosition += 15;

  if (multiplier > 1) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor('#DC2626');
    doc.text(`Multiplier: x${multiplier} servings`, margin, yPosition);
    yPosition += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor('#6B7280');
    doc.text('All quantities and costs have been multiplied', margin, yPosition);
    yPosition += 10;
  }

  drawLine(yPosition);
  yPosition += 15;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor('#1F2937');
  doc.text(t.summary, margin, yPosition);
  yPosition += 10;

  const visibleItems = shoppingList.items.filter(item => !item.deleted);
  const adjustedTotalCost = shoppingList.summary.total_shopping_cost_eur * multiplier;
  const adjustedPlanCost = shoppingList.summary.plan_cost_eur * multiplier;
  const adjustedWasteCost = shoppingList.summary.waste_cost_eur * multiplier;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor('#374151');
  
  const summaryLines = [
    `${t.items}: ${visibleItems.length}`,
    `${t.planCost}: €${adjustedPlanCost.toFixed(2)}`,
    `${t.total} ${t.cost}: €${adjustedTotalCost.toFixed(2)}`,
  ];

  if (adjustedWasteCost > 0) {
    summaryLines.push(`Estimated Waste: €${adjustedWasteCost.toFixed(2)}`);
  }

  summaryLines.forEach(line => {
    doc.text(line, margin + 5, yPosition);
    yPosition += 7;
  });

  yPosition += 15;
  drawLine(yPosition);
  yPosition += 12;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor('#1F2937');
  doc.text(t.yourShoppingList, margin, yPosition);
  yPosition += 10;

  const groupedItems = groupItemsByCategory(visibleItems);
  const sortedCategories = Array.from(groupedItems.keys()).sort(
    (a, b) => CATEGORIES[a].sortOrder - CATEGORIES[b].sortOrder
  );

  sortedCategories.forEach(category => {
    const items = groupedItems.get(category)!;
    if (items.length === 0) return;

    addNewPageIfNeeded(30);

    const config = CATEGORIES[category];
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor('#15803D');
    doc.text(`${config.icon} ${config.label}`, margin, yPosition);
    yPosition += 8;

    items.forEach(item => {
      addNewPageIfNeeded(15);

      drawCheckbox(margin + 5, yPosition);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor('#1F2937');
      doc.text(translateIngredient(item.display_name, language), margin + 12, yPosition);
      yPosition += 5;

      const adjustedQuantity = item.total_quantity * multiplier;
      const adjustedMinQuantity = item.minimum_purchase_quantity * multiplier;
      const adjustedPrice = item.estimated_price_eur * multiplier;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor('#6B7280');
      
      let quantityText = `${adjustedQuantity.toFixed(0)}${item.unit}`;
      if (adjustedMinQuantity > adjustedQuantity) {
        quantityText += ` (min ${adjustedMinQuantity.toFixed(0)}${item.unit})`;
      }
      
      doc.text(quantityText, margin + 12, yPosition);
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor('#15803D');
      doc.text(`€${adjustedPrice.toFixed(2)}`, pageWidth - margin - 20, yPosition);
      yPosition += 8;
    });

    yPosition += 5;
  });

  yPosition += 10;
  addNewPageIfNeeded(30);
  drawLine(yPosition);
  yPosition += 12;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor('#15803D');
  doc.text(`${t.total}: €${adjustedTotalCost.toFixed(2)}`, margin, yPosition);
  yPosition += 15;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor('#6B7280');
  const disclaimerText = 'Prices are estimates based on regional averages. Actual costs may vary by store and location.';
  const splitDisclaimer = doc.splitTextToSize(disclaimerText, contentWidth);
  doc.text(splitDisclaimer, margin, yPosition);

  yPosition = pageHeight - margin - 10;
  doc.setFontSize(8);
  doc.setTextColor('#9CA3AF');
  doc.setFont('helvetica', 'italic');
  doc.text(`Generated by ${t.appName} on ${new Date().toLocaleDateString(language)}`, margin, yPosition);
  doc.text(`Plan ID: ${shoppingList.plan_id.substring(0, 8)}`, pageWidth - margin - 40, yPosition);

  const fileName = multiplier > 1 
    ? `${t.appName}-ShoppingList-x${multiplier}-${new Date(shoppingList.generated_at).toISOString().split('T')[0]}.pdf`
    : `${t.appName}-ShoppingList-${new Date(shoppingList.generated_at).toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
