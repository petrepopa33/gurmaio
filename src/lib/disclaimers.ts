export const DISCLAIMERS = {
  nutrition: {
    short: "Nutrition values are estimates and may vary by brand and preparation method.",
    full: "Nutrition values are estimates based on standardized databases (USDA). Actual values may vary by brand, portion size, and preparation method. Always consult a healthcare professional for personalized nutrition advice."
  },
  cost: {
    short: "Cost estimates are based on average prices and may vary by location and store.",
    full: "Cost estimates are based on average grocery prices and may vary significantly by location, store, product brand, and current market conditions. Actual shopping costs may differ from estimates shown."
  },
  ai: {
    short: "AI-assisted meal suggestions with deterministic nutrition calculations.",
    full: "This app uses AI (OpenAI GPT-4) to suggest meal combinations based on your preferences. All nutrition and cost calculations are deterministic and performed by verified algorithms, not by AI. The AI only suggests ingredient combinations."
  },
  medical: {
    short: "This app provides recommendations, not medical advice.",
    full: "Gurmaio provides meal planning recommendations for informational purposes only. This is not medical, nutritional, or health advice. Always consult qualified healthcare professionals before making significant dietary changes, especially if you have health conditions or dietary restrictions."
  },
  general: {
    short: "All values shown are estimates.",
    full: "All nutrition and cost values displayed in this app are estimates for informational purposes only. Results may vary based on brands, portions, availability, and other factors."
  }
} as const;

export const INFO_LABELS = {
  nutritionInfo: "More information about nutrition estimates",
  costInfo: "More information about cost estimates",
  aiInfo: "How AI is used in this app",
  medicalInfo: "Important health disclaimer",
  viewToggle: "Switch between total plan and daily average view",
  ingredientBreakdown: "View ingredient details",
} as const;

export const TRUST_BADGES = {
  verifiedNutrition: "Calculated using USDA nutrition database",
  verifiedAlgorithm: "Deterministic calculations",
  aiAssisted: "AI-assisted meal suggestions",
} as const;

export const EMPTY_STATES = {
  guestMode: "You're using guest mode. Generate meal plans without logging in, or sign in to save plans across devices.",
  noSavedPlans: "No saved meal plans yet. Generate your first plan and click 'Save Plan' to keep it for later.",
  noMealPlan: "Generate your first meal plan to get started!",
} as const;

export const VIEW_MODES = {
  total: "Total Plan",
  average: "Daily Average",
} as const;

export function getViewModeContext(mode: 'total' | 'average', days: number): string {
  if (mode === 'total') {
    return `Total (${days} ${days === 1 ? 'day' : 'days'})`;
  }
  return 'Average per day';
}
