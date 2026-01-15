type BudgetPeriod = 'daily' | 'weekly';

type UserProfile = {
  budget_eur: number;
  budget_period: BudgetPeriod;
  meal_plan_days: number;
  meals_per_day: number;
  dietary_preferences: string[];
  allergens: string[];
};

type Nutrition = {
  calories: number;
  protein_g: number;
  carbohydrates_g: number;
  fats_g: number;
};

type Ingredient = {
  ingredient_id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  estimated_cost_eur: number;
  nutrition_per_100g: Nutrition;
};

type Meal = {
  meal_id: string;
  meal_type: string;
  recipe_name: string;
  recipe_description: string;
  prep_time_minutes: number;
  cook_time_minutes: number;
  ingredients: Ingredient[];
  instructions: string[];
  nutrition: Nutrition;
  cost: { meal_cost_eur: number; cost_per_serving_eur: number };
  tags: string[];
};

type MealDay = {
  day_number: number;
  date: string;
  meals: Meal[];
  totals: Nutrition & { cost_eur: number };
};

type MealPlan = {
  plan_id: string;
  generated_at: string;
  user_id: string;
  days: MealDay[];
  plan_totals: Nutrition & { total_cost_eur: number };
  metadata: {
    period: BudgetPeriod;
    days_count: number;
    meals_per_day: number;
    period_budget_eur: number;
    period_cost_eur: number;
    budget_remaining_eur: number;
    is_over_budget: boolean;
    generated_by: string;
  };
};

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function isVegan(pref: string[]) {
  return pref.map(p => p.toLowerCase()).includes('vegan');
}
function isVegetarian(pref: string[]) {
  return pref.map(p => p.toLowerCase()).includes('vegetarian');
}
function isGlutenFree(pref: string[]) {
  const p = pref.map(x => x.toLowerCase());
  return p.includes('gluten-free') || p.includes('gluten_free') || p.includes('gluten free');
}

function allowedProteinNames(profile: UserProfile) {
  const vegan = isVegan(profile.dietary_preferences);
  const vegetarian = isVegetarian(profile.dietary_preferences);

  if (vegan) {
    return ['tofu', 'tempeh', 'lentils', 'chickpeas', 'black beans', 'edamame'];
  }
  if (vegetarian) {
    return ['eggs', 'greek yogurt', 'tofu', 'lentils', 'chickpeas', 'black beans'];
  }
  return ['chicken breast', 'salmon', 'eggs', 'greek yogurt', 'tofu', 'lentils'];
}

function baseCarbName(profile: UserProfile) {
  return isGlutenFree(profile.dietary_preferences) ? 'rice' : 'whole wheat pasta';
}

function mkIngredient(name: string, grams: number, category: string, pricePer100g: number, nutritionPer100g: Nutrition): Ingredient {
  const cost = round2((grams / 100) * pricePer100g);
  return {
    ingredient_id: `${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
    name,
    category,
    quantity: grams,
    unit: 'g',
    estimated_cost_eur: cost,
    nutrition_per_100g: nutritionPer100g,
  };
}

function sumNutrition(ings: Ingredient[]): Nutrition {
  return ings.reduce(
    (acc, ing) => {
      const factor = ing.quantity / 100;
      return {
        calories: acc.calories + ing.nutrition_per_100g.calories * factor,
        protein_g: acc.protein_g + ing.nutrition_per_100g.protein_g * factor,
        carbohydrates_g: acc.carbohydrates_g + ing.nutrition_per_100g.carbohydrates_g * factor,
        fats_g: acc.fats_g + ing.nutrition_per_100g.fats_g * factor,
      };
    },
    { calories: 0, protein_g: 0, carbohydrates_g: 0, fats_g: 0 }
  );
}

function sumCost(ings: Ingredient[]) {
  return round2(ings.reduce((s, i) => s + i.estimated_cost_eur, 0));
}

export function generateFallbackMealPlan(userId: string, profile: UserProfile): MealPlan {
  const days = Math.max(1, profile.meal_plan_days || 7);
  const mealsPerDay = Math.max(1, profile.meals_per_day || 3);
  const budgetPeriod: BudgetPeriod = profile.budget_period || 'weekly';

  const periodBudget = Number(profile.budget_eur || 0);
  const planId = `plan_${crypto.randomUUID()}`;
  const generatedAt = new Date().toISOString();

  const proteins = allowedProteinNames(profile);
  const carb = baseCarbName(profile);

  const start = new Date();

  const planDays: MealDay[] = Array.from({ length: days }, (_, dIdx) => {
    const date = new Date(start);
    date.setDate(start.getDate() + dIdx);

    const meals: Meal[] = Array.from({ length: mealsPerDay }, (_, mIdx) => {
      const protein = proteins[(dIdx + mIdx) % proteins.length];
      const veg = ['broccoli', 'spinach', 'bell pepper', 'zucchini', 'tomato'][(dIdx * 3 + mIdx) % 5];
      const useCarb = mIdx !== 0; // lighter breakfast-ish

      const ings: Ingredient[] = [
        mkIngredient(protein, 180, 'protein', 1.6, {
          calories: protein.includes('salmon') ? 208 : protein.includes('chicken') ? 165 : protein.includes('eggs') ? 155 : 120,
          protein_g: protein.includes('salmon') ? 20 : protein.includes('chicken') ? 31 : protein.includes('eggs') ? 13 : 14,
          carbohydrates_g: 1,
          fats_g: protein.includes('salmon') ? 13 : protein.includes('chicken') ? 4 : protein.includes('eggs') ? 11 : 4,
        }),
        mkIngredient(veg, 200, 'vegetable', 0.35, { calories: 30, protein_g: 2, carbohydrates_g: 6, fats_g: 0.5 }),
        mkIngredient('olive oil', 10, 'fat', 0.7, { calories: 884, protein_g: 0, carbohydrates_g: 0, fats_g: 100 }),
      ];

      if (useCarb) {
        ings.push(
          mkIngredient(carb, 160, 'carb', 0.45, {
            calories: carb === 'rice' ? 130 : 150,
            protein_g: 3,
            carbohydrates_g: 28,
            fats_g: 1,
          })
        );
      }

      const nutrition = sumNutrition(ings);
      const cost = sumCost(ings);

      return {
        meal_id: `meal_${crypto.randomUUID()}`,
        meal_type: mIdx === 0 ? 'breakfast' : mIdx === 1 ? 'lunch' : 'dinner',
        recipe_name: `${protein} with ${veg}${useCarb ? ` and ${carb}` : ''}`,
        recipe_description: `A simple ${useCarb ? 'balanced' : 'light'} meal aligned to your preferences.`,
        prep_time_minutes: 10,
        cook_time_minutes: 20,
        ingredients: ings,
        instructions: [
          'Prep all ingredients.',
          'Cook protein thoroughly.',
          'Saute vegetables with olive oil.',
          useCarb ? `Cook ${carb} and serve together.` : 'Serve together.',
        ],
        nutrition: {
          calories: Math.round(nutrition.calories),
          protein_g: Math.round(nutrition.protein_g),
          carbohydrates_g: Math.round(nutrition.carbohydrates_g),
          fats_g: Math.round(nutrition.fats_g),
        },
        cost: {
          meal_cost_eur: cost,
          cost_per_serving_eur: cost,
        },
        tags: [
          ...(isVegan(profile.dietary_preferences) ? ['vegan'] : []),
          ...(isVegetarian(profile.dietary_preferences) ? ['vegetarian'] : []),
          ...(isGlutenFree(profile.dietary_preferences) ? ['gluten-free'] : []),
        ],
      };
    });

    const totals = meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.nutrition.calories,
        protein_g: acc.protein_g + meal.nutrition.protein_g,
        carbohydrates_g: acc.carbohydrates_g + meal.nutrition.carbohydrates_g,
        fats_g: acc.fats_g + meal.nutrition.fats_g,
        cost_eur: acc.cost_eur + meal.cost.meal_cost_eur,
      }),
      { calories: 0, protein_g: 0, carbohydrates_g: 0, fats_g: 0, cost_eur: 0 }
    );

    return {
      day_number: dIdx + 1,
      date: date.toISOString().split('T')[0],
      meals,
      totals: {
        calories: Math.round(totals.calories),
        protein_g: Math.round(totals.protein_g),
        carbohydrates_g: Math.round(totals.carbohydrates_g),
        fats_g: Math.round(totals.fats_g),
        cost_eur: round2(totals.cost_eur),
      },
    };
  });

  const planTotals = planDays.reduce(
    (acc, day) => ({
      calories: acc.calories + day.totals.calories,
      protein_g: acc.protein_g + day.totals.protein_g,
      carbohydrates_g: acc.carbohydrates_g + day.totals.carbohydrates_g,
      fats_g: acc.fats_g + day.totals.fats_g,
      total_cost_eur: acc.total_cost_eur + day.totals.cost_eur,
    }),
    { calories: 0, protein_g: 0, carbohydrates_g: 0, fats_g: 0, total_cost_eur: 0 }
  );

  const totalCost = round2(planTotals.total_cost_eur);
  const remaining = round2(periodBudget - totalCost);

  return {
    plan_id: planId,
    generated_at: generatedAt,
    user_id: userId,
    days: planDays,
    plan_totals: {
      calories: Math.round(planTotals.calories),
      protein_g: Math.round(planTotals.protein_g),
      carbohydrates_g: Math.round(planTotals.carbohydrates_g),
      fats_g: Math.round(planTotals.fats_g),
      total_cost_eur: totalCost,
    },
    metadata: {
      period: budgetPeriod,
      days_count: days,
      meals_per_day: mealsPerDay,
      period_budget_eur: periodBudget,
      period_cost_eur: totalCost,
      budget_remaining_eur: remaining,
      is_over_budget: totalCost > periodBudget,
      generated_by: 'worker:fallback',
    },
  };
}
