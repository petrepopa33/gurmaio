import { jsPDF } from 'jspdf';
import type { MealPlan } from '@/types/domain';
import type { Language } from '@/lib/i18n/translations';
import { translations } from '@/lib/i18n/translations';

export function exportMealPlanToPDF(mealPlan: MealPlan, language: Language = 'en') {
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

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor('#15803D');
  doc.text(t.appName, margin, yPosition);
  yPosition += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor('#6B7280');
  doc.text(`${t.yourMealPlan} - ${new Date(mealPlan.generated_at).toLocaleDateString(language)}`, margin, yPosition);
  yPosition += 15;

  drawLine(yPosition);
  yPosition += 15;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor('#1F2937');
  doc.text(t.summary, margin, yPosition);
  yPosition += 10;

  const budgetStatusColor = mealPlan.metadata.is_over_budget ? '#DC2626' : '#15803D';
  const budgetStatus = mealPlan.metadata.is_over_budget ? t.overBudget : t.withinBudget;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor('#374151');
  
  const overviewLines = [
    `${t.days}: ${mealPlan.metadata.days}`,
    `${t.budget}: €${mealPlan.metadata.period_budget_eur.toFixed(2)}`,
    `${t.totalCost}: €${mealPlan.metadata.period_cost_eur.toFixed(2)}`,
    `${t.remaining}: €${mealPlan.metadata.budget_remaining_eur.toFixed(2)}`,
  ];

  overviewLines.forEach(line => {
    doc.text(line, margin + 5, yPosition);
    yPosition += 7;
  });

  doc.setTextColor(budgetStatusColor);
  doc.setFont('helvetica', 'bold');
  doc.text(budgetStatus, margin + 5, yPosition);
  yPosition += 15;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor('#1F2937');
  doc.text(t.totalNutrition, margin, yPosition);
  yPosition += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor('#374151');
  
  const nutritionLines = [
    `${t.calories}: ${Math.round(mealPlan.plan_totals.calories)} kcal`,
    `${t.protein}: ${Math.round(mealPlan.plan_totals.protein_g)}g`,
    `${t.carbs}: ${Math.round(mealPlan.plan_totals.carbohydrates_g)}g`,
    `${t.fats}: ${Math.round(mealPlan.plan_totals.fats_g)}g`,
  ];

  nutritionLines.forEach(line => {
    doc.text(line, margin + 5, yPosition);
    yPosition += 7;
  });

  yPosition += 10;

  mealPlan.days.forEach((day, dayIndex) => {
    addNewPageIfNeeded(60);

    drawLine(yPosition);
    yPosition += 12;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor('#15803D');
    doc.text(`${t.day} ${day.day_number}`, margin, yPosition);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor('#6B7280');
    doc.text(new Date(day.date).toLocaleDateString(language, { weekday: 'long', month: 'long', day: 'numeric' }), margin + 35, yPosition);
    yPosition += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor('#374151');
    doc.text(
      `${t.dailyTotals}: ${Math.round(day.totals.calories)} kcal | €${day.totals.cost_eur.toFixed(2)} | P: ${Math.round(day.totals.protein_g)}g | C: ${Math.round(day.totals.carbohydrates_g)}g | F: ${Math.round(day.totals.fats_g)}g`,
      margin + 5,
      yPosition
    );
    yPosition += 12;

    day.meals.forEach((meal, mealIndex) => {
      addNewPageIfNeeded(50);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor('#1F2937');
      
      const mealTypeEmoji: Record<string, string> = {
        breakfast: '🍳',
        lunch: '🍽️',
        dinner: '🌙',
        snack: '🍎'
      };
      
      const emoji = mealTypeEmoji[meal.meal_type] || '🍴';
      doc.text(`${emoji} ${meal.recipe_name}`, margin + 5, yPosition);
      yPosition += 7;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor('#6B7280');
      doc.text(
        `${Math.round(meal.nutrition.calories)} kcal | €${meal.cost.meal_cost_eur.toFixed(2)} | P: ${Math.round(meal.nutrition.protein_g)}g | C: ${Math.round(meal.nutrition.carbohydrates_g)}g | F: ${Math.round(meal.nutrition.fats_g)}g`,
        margin + 10,
        yPosition
      );
      yPosition += 7;

      doc.setFontSize(9);
      doc.setTextColor('#4B5563');
      doc.text(`${t.ingredients}:`, margin + 10, yPosition);
      yPosition += 5;

      meal.ingredients.forEach((ingredient) => {
        addNewPageIfNeeded(7);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor('#6B7280');
        doc.text(`• ${ingredient.name} (${ingredient.quantity_g}g)`, margin + 15, yPosition);
        yPosition += 5;
      });

      yPosition += 5;
    });

    yPosition += 5;
  });

  addNewPageIfNeeded(40);
  drawLine(yPosition);
  yPosition += 12;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor('#1F2937');
  doc.text(`${t.plan} ${t.summary}`, margin, yPosition);
  yPosition += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor('#374151');
  
  const totalMeals = mealPlan.days.reduce((sum, day) => sum + day.meals.length, 0);
  const avgDailyCost = (mealPlan.metadata.period_cost_eur / mealPlan.metadata.days).toFixed(2);
  const avgDailyCalories = Math.round(mealPlan.plan_totals.calories / mealPlan.metadata.days);
  
  const summaryLines = [
    `${t.total} ${t.items}: ${totalMeals}`,
    `${t.cost}/${t.day}: €${avgDailyCost}`,
    `${t.calories}/${t.day}: ${avgDailyCalories} kcal`,
  ];

  summaryLines.forEach(line => {
    doc.text(line, margin + 5, yPosition);
    yPosition += 7;
  });

  yPosition = pageHeight - margin - 10;
  doc.setFontSize(8);
  doc.setTextColor('#9CA3AF');
  doc.setFont('helvetica', 'italic');
  doc.text(`Generated by ${t.appName} on ${new Date().toLocaleDateString(language)}`, margin, yPosition);
  doc.text(`Plan ID: ${mealPlan.plan_id.substring(0, 8)}`, pageWidth - margin - 40, yPosition);

  const fileName = `${t.appName}-MealPlan-${new Date(mealPlan.generated_at).toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
