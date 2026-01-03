import type { MealPlan } from '@/types/domain';
import { translations, type Language } from '@/lib/i18n/translations';
import { translateMeal, translateIngredient } from '@/lib/i18n/content-translations';

export function generateMealPlanText(
  mealPlan: MealPlan,
  language: Language = 'en'
): string {
  const t = translations[language];
  
  const header = `🍽️ ${t.mealPlan} - ${t.appName}\n`;
  const separator = '━━━━━━━━━━━━━━━━━━━━━\n\n';
  
  const metadata = `📅 ${mealPlan.metadata.days}-${t.day} ${t.plan}\n` +
    `💰 ${t.budget}: €${mealPlan.metadata.period_budget_eur.toFixed(2)}\n` +
    `💵 ${t.totalCost}: €${mealPlan.metadata.period_cost_eur.toFixed(2)}\n` +
    `${mealPlan.metadata.is_over_budget ? `⚠️ ${t.overBudget}\n` : `✅ ${t.withinBudget}\n`}\n`;
  
  const nutrition = `📊 ${t.totalNutrition}\n` +
    `🔥 ${t.calories}: ${mealPlan.plan_totals.calories.toLocaleString()}\n` +
    `💪 ${t.protein}: ${mealPlan.plan_totals.protein_g}g\n` +
    `🌾 ${t.carbs}: ${mealPlan.plan_totals.carbohydrates_g}g\n` +
    `🥑 ${t.fats}: ${mealPlan.plan_totals.fats_g}g\n`;
  
  const days = mealPlan.days.map((day) => {
    const dayHeader = `\n📆 ${t.day} ${day.day_number}\n` +
      `${t.dailyTotals}: ${day.totals.calories} cal | ${day.totals.protein_g}g P | ${day.totals.carbohydrates_g}g C | ${day.totals.fats_g}g F | €${day.totals.cost_eur.toFixed(2)}\n\n`;
    
    const meals = day.meals.map((meal) => {
      const mealType = t[meal.meal_type] || meal.meal_type;
      const mealName = translateMeal(meal.recipe_name, language);
      const mealStats = `${meal.nutrition.calories} cal | ${meal.nutrition.protein_g}g P | ${meal.nutrition.carbohydrates_g}g C | ${meal.nutrition.fats_g}g F | €${meal.cost.meal_cost_eur.toFixed(2)}`;
      
      const ingredients = meal.ingredients
        .map((ing) => {
          const name = translateIngredient(ing.name, language);
          return `   • ${name} - ${ing.quantity_g}g`;
        })
        .join('\n');
      
      return `${mealType.toUpperCase()}: ${mealName}\n${mealStats}\n${ingredients}`;
    }).join('\n\n');
    
    return dayHeader + meals;
  }).join('\n\n' + separator);
  
  return header + separator + metadata + '\n' + nutrition + separator + days;
}

export function generateMealPlanSummary(
  mealPlan: MealPlan,
  language: Language = 'en'
): string {
  const t = translations[language];
  
  const header = `🍽️ ${t.mealPlan} - ${t.appName}\n\n`;
  
  const summary = `📅 ${mealPlan.metadata.days}-${t.day} ${t.plan}\n` +
    `💰 ${t.totalCost}: €${mealPlan.metadata.period_cost_eur.toFixed(2)} / €${mealPlan.metadata.period_budget_eur.toFixed(2)}\n` +
    `🔥 ${t.calories}: ${mealPlan.plan_totals.calories.toLocaleString()}\n` +
    `💪 ${t.protein}: ${mealPlan.plan_totals.protein_g}g | ` +
    `🌾 ${t.carbs}: ${mealPlan.plan_totals.carbohydrates_g}g | ` +
    `🥑 ${t.fats}: ${mealPlan.plan_totals.fats_g}g\n\n`;
  
  const meals = mealPlan.days.map((day) => {
    const dayMeals = day.meals
      .map((meal) => {
        const mealType = t[meal.meal_type] || meal.meal_type;
        const mealName = translateMeal(meal.recipe_name, language);
        return `   ${mealType}: ${mealName}`;
      })
      .join('\n');
    
    return `${t.day} ${day.day_number}:\n${dayMeals}`;
  }).join('\n\n');
  
  return header + summary + meals;
}

export function shareViaWhatsApp(text: string): void {
  const encodedText = encodeURIComponent(text);
  const whatsappUrl = `https://wa.me/?text=${encodedText}`;
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
}

export function shareViaEmail(
  text: string,
  subject: string = 'Meal Plan from Gurmaio'
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
