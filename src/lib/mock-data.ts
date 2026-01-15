import type { MealPlan, ShoppingList, ShoppingListItem, UserProfile } from '@/types/domain';
import { calculateMacroGrams, getMacroDescription } from '@/lib/macro-calculator';

function getSparkRuntime(): any | null {
  return (globalThis as any)?.spark ?? null;
}

function getMealTypesForDay(mealsPerDay: number): string[] {
  if (mealsPerDay === 1) return ['lunch'];
  if (mealsPerDay === 2) return ['breakfast', 'dinner'];
  if (mealsPerDay === 3) return ['breakfast', 'lunch', 'dinner'];
  if (mealsPerDay === 4) return ['breakfast', 'snack', 'lunch', 'dinner'];
  if (mealsPerDay === 5) return ['breakfast', 'snack', 'lunch', 'snack', 'dinner'];
  if (mealsPerDay === 6) return ['breakfast', 'snack', 'lunch', 'snack', 'dinner', 'snack'];
  return ['breakfast', 'lunch', 'dinner'];
}

export async function generateMealPlan(userProfile: UserProfile): Promise<MealPlan> {
  const spark = getSparkRuntime();
  if (!spark?.llmPrompt || !spark?.llm) {
    console.warn('⚠️ Spark LLM runtime not available; using fallback meal plan generator');
  }

  // For this frontend prototype, use deterministic mock generation.
  // In production, the backend will generate meal plans and costs.
  return generateFallbackMealPlan(userProfile);
}

function generateFallbackMealPlan(userProfile: UserProfile): MealPlan {
  const planId = crypto.randomUUID();
  const userId = 'user_123';

  const totalBudget = userProfile.budget_period === 'daily'
    ? userProfile.budget_eur * userProfile.meal_plan_days
    : userProfile.budget_eur;

  const dietary = new Set((userProfile.dietary_preferences ?? []).map(p => p.toLowerCase()));
  const isVegan = dietary.has('vegan');
  const isVegetarian = isVegan || dietary.has('vegetarian');
  const isGlutenFree = dietary.has('gluten-free') || dietary.has('gluten free');

  const excluded = new Set((userProfile.excluded_ingredients ?? []).map(i => i.toLowerCase()));
  const allergens = new Set((userProfile.allergens ?? []).map(a => a.toLowerCase()));

  type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

  const templates: Array<{
    meal_type: MealType;
    recipe_name: string;
    tags: { vegan: boolean; vegetarian: boolean; glutenFree: boolean };
    cooking_instructions: string[];
    ingredients: Array<{
      name: string;
      quantity_g: number;
      nutrition: { calories: number; protein_g: number; carbohydrates_g: number; fats_g: number };
      cost_eur: number;
    }>;
  }> = [
    {
      meal_type: 'breakfast',
      recipe_name: 'Overnight Oats with Chia & Berries',
      tags: { vegan: true, vegetarian: true, glutenFree: false },
      cooking_instructions: [
        'Mix oats, chia seeds, and plant milk in a jar',
        'Refrigerate overnight',
        'Top with berries and a spoon of nut butter before serving'
      ],
      ingredients: [
        { name: 'Rolled Oats', quantity_g: 60, nutrition: { calories: 230, protein_g: 8, carbohydrates_g: 40, fats_g: 4 }, cost_eur: 0.30 },
        { name: 'Chia Seeds', quantity_g: 15, nutrition: { calories: 70, protein_g: 3, carbohydrates_g: 2, fats_g: 5 }, cost_eur: 0.25 },
        { name: 'Soy Milk', quantity_g: 200, nutrition: { calories: 90, protein_g: 8, carbohydrates_g: 6, fats_g: 4 }, cost_eur: 0.35 },
        { name: 'Mixed Berries', quantity_g: 120, nutrition: { calories: 60, protein_g: 1, carbohydrates_g: 14, fats_g: 0 }, cost_eur: 0.90 },
        { name: 'Peanut Butter', quantity_g: 15, nutrition: { calories: 90, protein_g: 4, carbohydrates_g: 3, fats_g: 8 }, cost_eur: 0.25 },
      ],
    },
    {
      meal_type: 'breakfast',
      recipe_name: 'Tofu Scramble with Spinach & Tomatoes',
      tags: { vegan: true, vegetarian: true, glutenFree: true },
      cooking_instructions: [
        'Crumble tofu into a pan with a little oil',
        'Add spices and cook for 5-7 minutes',
        'Stir in spinach and tomatoes until wilted'
      ],
      ingredients: [
        { name: 'Tofu', quantity_g: 200, nutrition: { calories: 240, protein_g: 26, carbohydrates_g: 6, fats_g: 14 }, cost_eur: 1.50 },
        { name: 'Spinach', quantity_g: 80, nutrition: { calories: 20, protein_g: 2, carbohydrates_g: 3, fats_g: 0 }, cost_eur: 0.60 },
        { name: 'Tomatoes', quantity_g: 120, nutrition: { calories: 25, protein_g: 1, carbohydrates_g: 5, fats_g: 0 }, cost_eur: 0.50 },
        { name: 'Olive Oil', quantity_g: 10, nutrition: { calories: 90, protein_g: 0, carbohydrates_g: 0, fats_g: 10 }, cost_eur: 0.15 },
      ],
    },
    {
      meal_type: 'lunch',
      recipe_name: 'Chickpea Quinoa Bowl with Lemon-Tahini',
      tags: { vegan: true, vegetarian: true, glutenFree: true },
      cooking_instructions: [
        'Cook quinoa and let it cool slightly',
        'Mix chickpeas with chopped veggies',
        'Whisk tahini with lemon and a splash of water',
        'Assemble bowl and drizzle sauce'
      ],
      ingredients: [
        { name: 'Quinoa', quantity_g: 80, nutrition: { calories: 280, protein_g: 10, carbohydrates_g: 52, fats_g: 4 }, cost_eur: 0.90 },
        { name: 'Chickpeas', quantity_g: 180, nutrition: { calories: 290, protein_g: 16, carbohydrates_g: 48, fats_g: 5 }, cost_eur: 0.70 },
        { name: 'Cucumber', quantity_g: 120, nutrition: { calories: 18, protein_g: 1, carbohydrates_g: 4, fats_g: 0 }, cost_eur: 0.40 },
        { name: 'Tomatoes', quantity_g: 120, nutrition: { calories: 25, protein_g: 1, carbohydrates_g: 5, fats_g: 0 }, cost_eur: 0.50 },
        { name: 'Tahini', quantity_g: 20, nutrition: { calories: 120, protein_g: 4, carbohydrates_g: 3, fats_g: 10 }, cost_eur: 0.35 },
      ],
    },
    {
      meal_type: 'lunch',
      recipe_name: 'Lentil Tomato Soup with Herb Oil',
      tags: { vegan: true, vegetarian: true, glutenFree: true },
      cooking_instructions: [
        'Simmer lentils with onions, carrots, and tomatoes until tender',
        'Season with salt, pepper, and herbs',
        'Finish with a drizzle of olive oil'
      ],
      ingredients: [
        { name: 'Red Lentils', quantity_g: 90, nutrition: { calories: 310, protein_g: 22, carbohydrates_g: 52, fats_g: 2 }, cost_eur: 0.60 },
        { name: 'Canned Tomatoes', quantity_g: 200, nutrition: { calories: 60, protein_g: 3, carbohydrates_g: 12, fats_g: 0 }, cost_eur: 0.60 },
        { name: 'Carrots', quantity_g: 120, nutrition: { calories: 50, protein_g: 1, carbohydrates_g: 12, fats_g: 0 }, cost_eur: 0.25 },
        { name: 'Olive Oil', quantity_g: 10, nutrition: { calories: 90, protein_g: 0, carbohydrates_g: 0, fats_g: 10 }, cost_eur: 0.15 },
      ],
    },
    {
      meal_type: 'dinner',
      recipe_name: 'Tofu & Vegetable Stir-Fry with Rice',
      tags: { vegan: true, vegetarian: true, glutenFree: true },
      cooking_instructions: [
        'Cook rice according to package instructions',
        'Sear tofu cubes until golden',
        'Stir-fry vegetables, then toss everything together'
      ],
      ingredients: [
        { name: 'Tofu', quantity_g: 220, nutrition: { calories: 260, protein_g: 28, carbohydrates_g: 7, fats_g: 15 }, cost_eur: 1.70 },
        { name: 'Mixed Stir-Fry Vegetables', quantity_g: 250, nutrition: { calories: 140, protein_g: 5, carbohydrates_g: 20, fats_g: 5 }, cost_eur: 1.60 },
        { name: 'Rice', quantity_g: 80, nutrition: { calories: 280, protein_g: 5, carbohydrates_g: 62, fats_g: 1 }, cost_eur: 0.35 },
        { name: 'Sesame Oil', quantity_g: 6, nutrition: { calories: 54, protein_g: 0, carbohydrates_g: 0, fats_g: 6 }, cost_eur: 0.12 },
      ],
    },
    {
      meal_type: 'dinner',
      recipe_name: 'Chickpea Curry with Spinach & Rice',
      tags: { vegan: true, vegetarian: true, glutenFree: true },
      cooking_instructions: [
        'Simmer chickpeas with tomatoes and spices',
        'Stir in spinach until wilted',
        'Serve over rice'
      ],
      ingredients: [
        { name: 'Chickpeas', quantity_g: 200, nutrition: { calories: 320, protein_g: 18, carbohydrates_g: 52, fats_g: 6 }, cost_eur: 0.75 },
        { name: 'Canned Tomatoes', quantity_g: 200, nutrition: { calories: 60, protein_g: 3, carbohydrates_g: 12, fats_g: 0 }, cost_eur: 0.60 },
        { name: 'Spinach', quantity_g: 80, nutrition: { calories: 20, protein_g: 2, carbohydrates_g: 3, fats_g: 0 }, cost_eur: 0.60 },
        { name: 'Coconut Milk', quantity_g: 120, nutrition: { calories: 220, protein_g: 2, carbohydrates_g: 4, fats_g: 22 }, cost_eur: 0.80 },
        { name: 'Rice', quantity_g: 70, nutrition: { calories: 245, protein_g: 4, carbohydrates_g: 54, fats_g: 1 }, cost_eur: 0.30 },
      ],
    },
    {
      meal_type: 'snack',
      recipe_name: 'Hummus with Carrot Sticks',
      tags: { vegan: true, vegetarian: true, glutenFree: true },
      cooking_instructions: ['Serve hummus with sliced carrots.'],
      ingredients: [
        { name: 'Hummus', quantity_g: 80, nutrition: { calories: 200, protein_g: 6, carbohydrates_g: 14, fats_g: 13 }, cost_eur: 0.70 },
        { name: 'Carrots', quantity_g: 150, nutrition: { calories: 60, protein_g: 1, carbohydrates_g: 14, fats_g: 0 }, cost_eur: 0.30 },
      ],
    },
    {
      meal_type: 'snack',
      recipe_name: 'Banana with Mixed Nuts',
      tags: { vegan: true, vegetarian: true, glutenFree: true },
      cooking_instructions: ['Eat banana and nuts together as a quick snack.'],
      ingredients: [
        { name: 'Banana', quantity_g: 120, nutrition: { calories: 105, protein_g: 1, carbohydrates_g: 27, fats_g: 0 }, cost_eur: 0.20 },
        { name: 'Mixed Nuts', quantity_g: 30, nutrition: { calories: 180, protein_g: 6, carbohydrates_g: 6, fats_g: 15 }, cost_eur: 0.55 },
      ],
    },
  ];

  const isBlockedIngredient = (name: string) => {
    const normalized = name.toLowerCase();
    if (excluded.has(normalized)) return true;
    for (const allergen of allergens) {
      if (allergen && normalized.includes(allergen)) return true;
    }
    if (isVegetarian) {
      const meatTerms = ['chicken', 'beef', 'pork', 'fish', 'turkey', 'tuna', 'salmon', 'shrimp'];
      if (meatTerms.some(t => normalized.includes(t))) return true;
    }
    if (isVegan) {
      const animalTerms = ['egg', 'milk', 'cheese', 'yogurt', 'butter', 'honey'];
      if (animalTerms.some(t => normalized.includes(t))) return true;
    }
    if (isGlutenFree) {
      const glutenTerms = ['bread', 'pasta', 'wheat', 'flour', 'barley', 'rye', 'couscous'];
      if (glutenTerms.some(t => normalized.includes(t))) return true;
    }
    return false;
  };

  const eligibleTemplate = (t: (typeof templates)[number]) => {
    if (isVegan && !t.tags.vegan) return false;
    if (isVegetarian && !t.tags.vegetarian) return false;
    if (isGlutenFree && !t.tags.glutenFree) return false;
    return !t.ingredients.some(i => isBlockedIngredient(i.name));
  };

  const pickTemplate = (mealType: MealType, seed: number) => {
    const pool = templates.filter(t => t.meal_type === mealType).filter(eligibleTemplate);
    const safePool = pool.length > 0 ? pool : templates.filter(t => t.meal_type === mealType);
    return safePool[seed % safePool.length];
  };

  const mealTypes = getMealTypesForDay(userProfile.meals_per_day) as MealType[];
  const now = Date.now();
  const baseSeed = now % 100000;

  const days = Array.from({ length: userProfile.meal_plan_days }, (_, idx) => {
    const dayNumber = idx + 1;
    const date = new Date(now + idx * 86400000).toISOString().split('T')[0];
    const meals = mealTypes.map((mealType, mealIndex) => {
      const template = pickTemplate(mealType, baseSeed + dayNumber * 31 + mealIndex * 17);
      const ingredients = template.ingredients
        .filter(i => !isBlockedIngredient(i.name))
        .map(i => ({
          ingredient_id: crypto.randomUUID(),
          name: i.name,
          quantity_g: i.quantity_g,
          nutrition: i.nutrition,
          cost_eur: Number(i.cost_eur.toFixed(2)),
        }));

      const mealNutrition = ingredients.reduce(
        (acc, ing) => ({
          calories: acc.calories + ing.nutrition.calories,
          protein_g: acc.protein_g + ing.nutrition.protein_g,
          carbohydrates_g: acc.carbohydrates_g + ing.nutrition.carbohydrates_g,
          fats_g: acc.fats_g + ing.nutrition.fats_g,
        }),
        { calories: 0, protein_g: 0, carbohydrates_g: 0, fats_g: 0 }
      );

      const mealCost = ingredients.reduce((sum, ing) => sum + ing.cost_eur, 0);

      return {
        meal_id: crypto.randomUUID(),
        meal_type: mealType,
        recipe_name: template.recipe_name,
        nutrition: mealNutrition,
        cost: { meal_cost_eur: Number(mealCost.toFixed(2)) },
        ingredients,
        cooking_instructions: template.cooking_instructions,
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

    return { day_number: dayNumber, date, totals: { ...totals, cost_eur: Number(totals.cost_eur.toFixed(2)) }, meals };
  });

  const applyCostScale = (scale: number) => {
    for (const day of days) {
      for (const meal of day.meals) {
        for (const ing of meal.ingredients) {
          ing.cost_eur = Number((ing.cost_eur * scale).toFixed(2));
        }
        const mealCost = meal.ingredients.reduce((sum, ing) => sum + ing.cost_eur, 0);
        meal.cost.meal_cost_eur = Number(mealCost.toFixed(2));
      }
      const dayCost = day.meals.reduce((sum, meal) => sum + meal.cost.meal_cost_eur, 0);
      day.totals.cost_eur = Number(dayCost.toFixed(2));
    }
  };

  let totalCost = days.reduce((sum, day) => sum + day.totals.cost_eur, 0);
  if (totalCost > totalBudget) {
    const scale = (totalBudget / totalCost) * 0.98;
    applyCostScale(scale);
    totalCost = days.reduce((sum, day) => sum + day.totals.cost_eur, 0);
  }

  const planTotals = days.reduce(
    (acc, day) => ({
      calories: acc.calories + day.totals.calories,
      protein_g: acc.protein_g + day.totals.protein_g,
      carbohydrates_g: acc.carbohydrates_g + day.totals.carbohydrates_g,
      fats_g: acc.fats_g + day.totals.fats_g,
    }),
    { calories: 0, protein_g: 0, carbohydrates_g: 0, fats_g: 0 }
  );

  const finalPlanTotals = {
    ...planTotals,
    total_cost_eur: Number(totalCost.toFixed(2)),
  };

  const budgetRemaining = totalBudget - finalPlanTotals.total_cost_eur;
  const isOverBudget = finalPlanTotals.total_cost_eur > totalBudget;

  return {
    plan_id: planId,
    generated_at: new Date().toISOString(),
    user_id: userId,
    metadata: {
      period_budget_eur: Number(totalBudget.toFixed(2)),
      period_cost_eur: finalPlanTotals.total_cost_eur,
      budget_remaining_eur: Number(budgetRemaining.toFixed(2)),
      is_over_budget: isOverBudget,
      generation_attempts: 1,
      days: userProfile.meal_plan_days,
    },
    days,
    plan_totals: finalPlanTotals,
  };
}

/*
    }> = [
      {
        meal_type: 'breakfast',
        recipe_name: 'Overnight Oats with Chia & Berries',
        tags: { vegan: true, vegetarian: true, glutenFree: false },
        cooking_instructions: [
          'Mix oats, chia seeds, and plant milk in a jar',
          'Refrigerate overnight',
          'Top with berries and a spoon of nut butter before serving'
        ],
        ingredients: [
          { name: 'Rolled Oats', quantity_g: 60, nutrition: { calories: 230, protein_g: 8, carbohydrates_g: 40, fats_g: 4 }, cost_eur: 0.30 },
          { name: 'Chia Seeds', quantity_g: 15, nutrition: { calories: 70, protein_g: 3, carbohydrates_g: 2, fats_g: 5 }, cost_eur: 0.25 },
          { name: 'Soy Milk', quantity_g: 200, nutrition: { calories: 90, protein_g: 8, carbohydrates_g: 6, fats_g: 4 }, cost_eur: 0.35 },
          { name: 'Mixed Berries', quantity_g: 120, nutrition: { calories: 60, protein_g: 1, carbohydrates_g: 14, fats_g: 0 }, cost_eur: 0.90 },
          { name: 'Peanut Butter', quantity_g: 15, nutrition: { calories: 90, protein_g: 4, carbohydrates_g: 3, fats_g: 8 }, cost_eur: 0.25 },
        ],
      },
      {
        meal_type: 'breakfast',
        recipe_name: 'Tofu Scramble with Spinach & Tomatoes',
        tags: { vegan: true, vegetarian: true, glutenFree: true },
        cooking_instructions: [
          'Crumble tofu into a pan with a little oil',
          'Add spices and cook for 5-7 minutes',
          'Stir in spinach and tomatoes until wilted'
        ],
        ingredients: [
          { name: 'Tofu', quantity_g: 200, nutrition: { calories: 240, protein_g: 26, carbohydrates_g: 6, fats_g: 14 }, cost_eur: 1.50 },
          { name: 'Spinach', quantity_g: 80, nutrition: { calories: 20, protein_g: 2, carbohydrates_g: 3, fats_g: 0 }, cost_eur: 0.60 },
          { name: 'Tomatoes', quantity_g: 120, nutrition: { calories: 25, protein_g: 1, carbohydrates_g: 5, fats_g: 0 }, cost_eur: 0.50 },
          { name: 'Olive Oil', quantity_g: 10, nutrition: { calories: 90, protein_g: 0, carbohydrates_g: 0, fats_g: 10 }, cost_eur: 0.15 },
        ],
      },
      {
        meal_type: 'lunch',
        recipe_name: 'Chickpea Quinoa Bowl with Lemon-Tahini',
        tags: { vegan: true, vegetarian: true, glutenFree: true },
        cooking_instructions: [
          'Cook quinoa and let it cool slightly',
          'Mix chickpeas with chopped veggies',
          'Whisk tahini with lemon and a splash of water',
          'Assemble bowl and drizzle sauce'
        ],
        ingredients: [
          { name: 'Quinoa', quantity_g: 80, nutrition: { calories: 280, protein_g: 10, carbohydrates_g: 52, fats_g: 4 }, cost_eur: 0.90 },
          { name: 'Chickpeas', quantity_g: 180, nutrition: { calories: 290, protein_g: 16, carbohydrates_g: 48, fats_g: 5 }, cost_eur: 0.70 },
          { name: 'Cucumber', quantity_g: 120, nutrition: { calories: 18, protein_g: 1, carbohydrates_g: 4, fats_g: 0 }, cost_eur: 0.40 },
          { name: 'Tomatoes', quantity_g: 120, nutrition: { calories: 25, protein_g: 1, carbohydrates_g: 5, fats_g: 0 }, cost_eur: 0.50 },
          { name: 'Tahini', quantity_g: 20, nutrition: { calories: 120, protein_g: 4, carbohydrates_g: 3, fats_g: 10 }, cost_eur: 0.35 },
        ],
      },
      {
        meal_type: 'lunch',
        recipe_name: 'Lentil Tomato Soup with Herb Oil',
        tags: { vegan: true, vegetarian: true, glutenFree: true },
        cooking_instructions: [
          'Simmer lentils with onions, carrots, and tomatoes until tender',
          'Season with salt, pepper, and herbs',
          'Finish with a drizzle of olive oil'
        ],
        ingredients: [
          { name: 'Red Lentils', quantity_g: 90, nutrition: { calories: 310, protein_g: 22, carbohydrates_g: 52, fats_g: 2 }, cost_eur: 0.60 },
          { name: 'Canned Tomatoes', quantity_g: 200, nutrition: { calories: 60, protein_g: 3, carbohydrates_g: 12, fats_g: 0 }, cost_eur: 0.60 },
          { name: 'Carrots', quantity_g: 120, nutrition: { calories: 50, protein_g: 1, carbohydrates_g: 12, fats_g: 0 }, cost_eur: 0.25 },
          { name: 'Olive Oil', quantity_g: 10, nutrition: { calories: 90, protein_g: 0, carbohydrates_g: 0, fats_g: 10 }, cost_eur: 0.15 },
        ],
      },
      {
        meal_type: 'dinner',
        recipe_name: 'Tofu & Vegetable Stir-Fry with Rice',
        tags: { vegan: true, vegetarian: true, glutenFree: true },
        cooking_instructions: [
          'Cook rice according to package instructions',
          'Sear tofu cubes until golden',
          'Stir-fry vegetables, then toss everything together'
        ],
        ingredients: [
          { name: 'Tofu', quantity_g: 220, nutrition: { calories: 260, protein_g: 28, carbohydrates_g: 7, fats_g: 15 }, cost_eur: 1.70 },
          { name: 'Mixed Stir-Fry Vegetables', quantity_g: 250, nutrition: { calories: 140, protein_g: 5, carbohydrates_g: 20, fats_g: 5 }, cost_eur: 1.60 },
          { name: 'Rice', quantity_g: 80, nutrition: { calories: 280, protein_g: 5, carbohydrates_g: 62, fats_g: 1 }, cost_eur: 0.35 },
          { name: 'Sesame Oil', quantity_g: 6, nutrition: { calories: 54, protein_g: 0, carbohydrates_g: 0, fats_g: 6 }, cost_eur: 0.12 },
        ],
      },
      {
        meal_type: 'dinner',
        recipe_name: 'Chickpea Curry with Spinach & Rice',
        tags: { vegan: true, vegetarian: true, glutenFree: true },
        cooking_instructions: [
          'Simmer chickpeas with tomatoes and spices',
          'Stir in spinach until wilted',
          'Serve over rice'
        ],
        ingredients: [
          { name: 'Chickpeas', quantity_g: 200, nutrition: { calories: 320, protein_g: 18, carbohydrates_g: 52, fats_g: 6 }, cost_eur: 0.75 },
          { name: 'Canned Tomatoes', quantity_g: 200, nutrition: { calories: 60, protein_g: 3, carbohydrates_g: 12, fats_g: 0 }, cost_eur: 0.60 },
          { name: 'Spinach', quantity_g: 80, nutrition: { calories: 20, protein_g: 2, carbohydrates_g: 3, fats_g: 0 }, cost_eur: 0.60 },
          { name: 'Coconut Milk', quantity_g: 120, nutrition: { calories: 220, protein_g: 2, carbohydrates_g: 4, fats_g: 22 }, cost_eur: 0.80 },
          { name: 'Rice', quantity_g: 70, nutrition: { calories: 245, protein_g: 4, carbohydrates_g: 54, fats_g: 1 }, cost_eur: 0.30 },
        ],
      },
      {
        meal_type: 'snack',
        recipe_name: 'Hummus with Carrot Sticks',
        tags: { vegan: true, vegetarian: true, glutenFree: true },
        cooking_instructions: ['Serve hummus with sliced carrots.'],
        ingredients: [
          { name: 'Hummus', quantity_g: 80, nutrition: { calories: 200, protein_g: 6, carbohydrates_g: 14, fats_g: 13 }, cost_eur: 0.70 },
          { name: 'Carrots', quantity_g: 150, nutrition: { calories: 60, protein_g: 1, carbohydrates_g: 14, fats_g: 0 }, cost_eur: 0.30 },
        ],
      },
      {
        meal_type: 'snack',
        recipe_name: 'Banana with Mixed Nuts',
        tags: { vegan: true, vegetarian: true, glutenFree: true },
        cooking_instructions: ['Eat banana and nuts together as a quick snack.'],
        ingredients: [
          { name: 'Banana', quantity_g: 120, nutrition: { calories: 105, protein_g: 1, carbohydrates_g: 27, fats_g: 0 }, cost_eur: 0.20 },
          { name: 'Mixed Nuts', quantity_g: 30, nutrition: { calories: 180, protein_g: 6, carbohydrates_g: 6, fats_g: 15 }, cost_eur: 0.55 },
        ],
      },
    ];

    const isBlockedIngredient = (name: string) => {
      const normalized = name.toLowerCase();
      if (excluded.has(normalized)) return true;
      for (const allergen of allergens) {
        if (allergen && normalized.includes(allergen)) return true;
      }
      if (isVegetarian) {
        const meatTerms = ['chicken', 'beef', 'pork', 'fish', 'turkey', 'tuna', 'salmon', 'shrimp'];
        if (meatTerms.some(t => normalized.includes(t))) return true;
      }
      if (isVegan) {
        const animalTerms = ['egg', 'milk', 'cheese', 'yogurt', 'butter', 'honey'];
        if (animalTerms.some(t => normalized.includes(t))) return true;
      }
      if (isGlutenFree) {
        const glutenTerms = ['bread', 'pasta', 'wheat', 'flour', 'barley', 'rye', 'couscous'];
        if (glutenTerms.some(t => normalized.includes(t))) return true;
      }
      return false;
    };

    const eligibleTemplate = (t: (typeof templates)[number]) => {
      if (isVegan && !t.tags.vegan) return false;
      if (isVegetarian && !t.tags.vegetarian) return false;
      if (isGlutenFree && !t.tags.glutenFree) return false;
      return !t.ingredients.some(i => isBlockedIngredient(i.name));
    };

    const pickTemplate = (mealType: MealType, seed: number) => {
      const pool = templates.filter(t => t.meal_type === mealType).filter(eligibleTemplate);
      const safePool = pool.length > 0 ? pool : templates.filter(t => t.meal_type === mealType);
      return safePool[seed % safePool.length];
    };

    const mealTypes = getMealTypesForDay(userProfile.meals_per_day) as MealType[];
    const now = Date.now();
    const baseSeed = now % 100000;

    const days = Array.from({ length: userProfile.meal_plan_days }, (_, idx) => {
      const dayNumber = idx + 1;
      const date = new Date(now + idx * 86400000).toISOString().split('T')[0];
      const meals = mealTypes.map((mealType, mealIndex) => {
        const template = pickTemplate(mealType, baseSeed + dayNumber * 31 + mealIndex * 17);
        const ingredients = template.ingredients
          .filter(i => !isBlockedIngredient(i.name))
          .map(i => ({
            ingredient_id: crypto.randomUUID(),
            name: i.name,
            quantity_g: i.quantity_g,
            nutrition: i.nutrition,
            cost_eur: Number(i.cost_eur.toFixed(2)),
          }));

        const mealNutrition = ingredients.reduce(
          (acc, ing) => ({
            calories: acc.calories + ing.nutrition.calories,
            protein_g: acc.protein_g + ing.nutrition.protein_g,
            carbohydrates_g: acc.carbohydrates_g + ing.nutrition.carbohydrates_g,
            fats_g: acc.fats_g + ing.nutrition.fats_g,
          }),
          { calories: 0, protein_g: 0, carbohydrates_g: 0, fats_g: 0 }
        );

        const mealCost = ingredients.reduce((sum, ing) => sum + ing.cost_eur, 0);

        return {
          meal_id: crypto.randomUUID(),
          meal_type: mealType,
          recipe_name: template.recipe_name,
          nutrition: mealNutrition,
          cost: { meal_cost_eur: Number(mealCost.toFixed(2)) },
          ingredients,
          cooking_instructions: template.cooking_instructions,
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

      return { day_number: dayNumber, date, totals: { ...totals, cost_eur: Number(totals.cost_eur.toFixed(2)) }, meals };
    });

    const planTotals = days.reduce(
      (acc, day) => ({
        calories: acc.calories + day.totals.calories,
        protein_g: acc.protein_g + day.totals.protein_g,
        carbohydrates_g: acc.carbohydrates_g + day.totals.carbohydrates_g,
        fats_g: acc.fats_g + day.totals.fats_g,
        total_cost_eur: acc.total_cost_eur + day.totals.cost_eur,
      }),
      { calories: 0, protein_g: 0, carbohydrates_g: 0, fats_g: 0, total_cost_eur: 0 }
    );

    const applyCostScale = (scale: number) => {
      for (const day of days) {
        for (const meal of day.meals) {
          for (const ing of meal.ingredients) {
            ing.cost_eur = Number((ing.cost_eur * scale).toFixed(2));
          }
          const mealCost = meal.ingredients.reduce((sum, ing) => sum + ing.cost_eur, 0);
          meal.cost.meal_cost_eur = Number(mealCost.toFixed(2));
        }
        const dayCost = day.meals.reduce((sum, meal) => sum + meal.cost.meal_cost_eur, 0);
        day.totals.cost_eur = Number(dayCost.toFixed(2));
      }
    };

    let totalCost = days.reduce((sum, day) => sum + day.totals.cost_eur, 0);
    if (totalCost > totalBudget) {
      const scale = (totalBudget / totalCost) * 0.98;
      applyCostScale(scale);
      totalCost = days.reduce((sum, day) => sum + day.totals.cost_eur, 0);
    }

    const finalPlanTotals = {
      calories: planTotals.calories,
      protein_g: planTotals.protein_g,
      carbohydrates_g: planTotals.carbohydrates_g,
      fats_g: planTotals.fats_g,
      total_cost_eur: Number(totalCost.toFixed(2)),
    };

    const budgetRemaining = totalBudget - finalPlanTotals.total_cost_eur;
    const isOverBudget = finalPlanTotals.total_cost_eur > totalBudget;

    return {
      plan_id: planId,
      generated_at: new Date().toISOString(),
      user_id: userId,
      metadata: {
        period_budget_eur: Number(totalBudget.toFixed(2)),
        period_cost_eur: finalPlanTotals.total_cost_eur,
        budget_remaining_eur: Number(budgetRemaining.toFixed(2)),
        is_over_budget: isOverBudget,
        generation_attempts: 1,
        days: userProfile.meal_plan_days,
      },
      days,
      plan_totals: finalPlanTotals,
    };
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Mixed Greens',
                quantity_g: 80,
                nutrition: { calories: 20, protein_g: 2, carbohydrates_g: 3, fats_g: 0 },
                cost_eur: 0.40,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Cherry Tomatoes',
                quantity_g: 80,
                nutrition: { calories: 20, protein_g: 1, carbohydrates_g: 4, fats_g: 0 },
                cost_eur: 0.50,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Olive Oil',
                quantity_g: 12,
                nutrition: { calories: 120, protein_g: 0, carbohydrates_g: 0, fats_g: 12 },
                cost_eur: 0.20,
              },
            ],
          },
          {
            meal_id: crypto.randomUUID(),
            meal_type: 'dinner',
            recipe_name: 'Beef Stir-Fry with Brown Rice',
            nutrition: {
              calories: 780,
              protein_g: 46,
              carbohydrates_g: 85,
              fats_g: 22,
            },
            cost: {
              meal_cost_eur: 4.10,
            },
            cooking_instructions: [
              'Cook brown rice according to package instructions',
              'Slice beef sirloin into thin strips against the grain',
              'Heat sesame oil in a wok or large pan over high heat',
              'Stir-fry beef for 2-3 minutes until browned, then remove from pan',
              'Add mixed vegetables to the pan and stir-fry for 4-5 minutes',
              'Return beef to pan, add soy sauce, and toss everything together',
              'Serve stir-fry over brown rice'
            ],
            ingredients: [
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Beef Sirloin',
                quantity_g: 120,
                nutrition: { calories: 250, protein_g: 36, carbohydrates_g: 0, fats_g: 12 },
                cost_eur: 2.80,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Brown Rice',
                quantity_g: 80,
                nutrition: { calories: 280, protein_g: 6, carbohydrates_g: 58, fats_g: 2 },
                cost_eur: 0.40,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Mixed Stir-Fry Vegetables',
                quantity_g: 200,
                nutrition: { calories: 80, protein_g: 4, carbohydrates_g: 16, fats_g: 0 },
                cost_eur: 0.80,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Soy Sauce',
                quantity_g: 20,
                nutrition: { calories: 10, protein_g: 1, carbohydrates_g: 1, fats_g: 0 },
                cost_eur: 0.10,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Sesame Oil',
                quantity_g: 8,
                nutrition: { calories: 80, protein_g: 0, carbohydrates_g: 0, fats_g: 8 },
                cost_eur: 0.20,
              },
            ],
          },
        ],
      },
      {
        day_number: 4,
        date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
        totals: {
          calories: 1880,
          protein_g: 96,
          carbohydrates_g: 215,
          fats_g: 64,
          cost_eur: 8.60,
        },
        meals: [
          {
            meal_id: crypto.randomUUID(),
            meal_type: 'breakfast',
            recipe_name: 'Cottage Cheese Pancakes with Fresh Fruit',
            nutrition: {
              calories: 450,
              protein_g: 26,
              carbohydrates_g: 54,
              fats_g: 14,
            },
            cost: {
              meal_cost_eur: 2.60,
            },
            cooking_instructions: [
              'Mix cottage cheese, flour, and eggs in a bowl until smooth batter forms',
              'Heat a non-stick pan over medium heat',
              'Pour batter to form small pancakes (about 8cm diameter)',
              'Cook for 2-3 minutes per side until golden brown',
              'Wash and slice strawberries',
              'Serve pancakes warm topped with fresh strawberries'
            ],
            ingredients: [
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Cottage Cheese',
                quantity_g: 150,
                nutrition: { calories: 180, protein_g: 22, carbohydrates_g: 6, fats_g: 6 },
                cost_eur: 1.20,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Flour',
                quantity_g: 60,
                nutrition: { calories: 220, protein_g: 6, carbohydrates_g: 44, fats_g: 1 },
                cost_eur: 0.20,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Eggs',
                quantity_g: 60,
                nutrition: { calories: 90, protein_g: 8, carbohydrates_g: 1, fats_g: 6 },
                cost_eur: 0.40,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Strawberries',
                quantity_g: 100,
                nutrition: { calories: 40, protein_g: 1, carbohydrates_g: 9, fats_g: 0 },
                cost_eur: 0.80,
              },
            ],
          },
          {
            meal_id: crypto.randomUUID(),
            meal_type: 'lunch',
            recipe_name: 'Lentil & Vegetable Soup with Crusty Bread',
            nutrition: {
              calories: 620,
              protein_g: 28,
              carbohydrates_g: 98,
              fats_g: 12,
            },
            cost: {
              meal_cost_eur: 2.80,
            },
            cooking_instructions: [
              'Dice carrots, celery, and onion',
              'Heat olive oil in a large pot and sauté vegetables until softened',
              'Add red lentils and cover with water or vegetable broth',
              'Bring to a boil, then reduce heat and simmer for 25-30 minutes',
              'Season with salt, pepper, and herbs',
              'Serve hot with crusty whole grain bread on the side'
            ],
            ingredients: [
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Red Lentils',
                quantity_g: 100,
                nutrition: { calories: 340, protein_g: 24, carbohydrates_g: 58, fats_g: 2 },
                cost_eur: 0.60,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Carrots',
                quantity_g: 100,
                nutrition: { calories: 40, protein_g: 1, carbohydrates_g: 9, fats_g: 0 },
                cost_eur: 0.30,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Celery',
                quantity_g: 80,
                nutrition: { calories: 15, protein_g: 1, carbohydrates_g: 3, fats_g: 0 },
                cost_eur: 0.30,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Onion',
                quantity_g: 80,
                nutrition: { calories: 30, protein_g: 1, carbohydrates_g: 7, fats_g: 0 },
                cost_eur: 0.20,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Whole Grain Bread',
                quantity_g: 80,
                nutrition: { calories: 200, protein_g: 6, carbohydrates_g: 36, fats_g: 2 },
                cost_eur: 0.60,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Olive Oil',
                quantity_g: 10,
                nutrition: { calories: 100, protein_g: 0, carbohydrates_g: 0, fats_g: 10 },
                cost_eur: 0.20,
              },
            ],
          },
          {
            meal_id: crypto.randomUUID(),
            meal_type: 'dinner',
            recipe_name: 'Baked Cod with Roasted Potatoes & Green Beans',
            nutrition: {
              calories: 810,
              protein_g: 52,
              carbohydrates_g: 88,
              fats_g: 22,
            },
            cost: {
              meal_cost_eur: 4.20,
            },
            cooking_instructions: [
              'Preheat oven to 200°C (400°F)',
              'Cut potatoes into wedges and toss with olive oil, salt, and pepper',
              'Roast potatoes for 30-35 minutes until golden and crispy',
              'Season cod fillet with salt, pepper, and lemon',
              'Bake cod at 180°C (350°F) for 12-15 minutes until flaky',
              'Steam green beans for 5-7 minutes',
              'Serve cod with roasted potatoes and green beans'
            ],
            ingredients: [
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Cod Fillet',
                quantity_g: 180,
                nutrition: { calories: 180, protein_g: 40, carbohydrates_g: 0, fats_g: 2 },
                cost_eur: 3.20,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Potatoes',
                quantity_g: 300,
                nutrition: { calories: 240, protein_g: 6, carbohydrates_g: 54, fats_g: 0 },
                cost_eur: 0.60,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Green Beans',
                quantity_g: 150,
                nutrition: { calories: 45, protein_g: 2, carbohydrates_g: 10, fats_g: 0 },
                cost_eur: 0.70,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Olive Oil',
                quantity_g: 15,
                nutrition: { calories: 150, protein_g: 0, carbohydrates_g: 0, fats_g: 15 },
                cost_eur: 0.30,
              },
            ],
          },
        ],
      },
      {
        day_number: 5,
        date: new Date(Date.now() + 345600000).toISOString().split('T')[0],
        totals: {
          calories: 1900,
          protein_g: 100,
          carbohydrates_g: 208,
          fats_g: 66,
          cost_eur: 8.85,
        },
        meals: [
          {
            meal_id: crypto.randomUUID(),
            meal_type: 'breakfast',
            recipe_name: 'Veggie Omelet with Whole Grain Toast',
            nutrition: {
              calories: 440,
              protein_g: 26,
              carbohydrates_g: 42,
              fats_g: 18,
            },
            cost: {
              meal_cost_eur: 2.50,
            },
            cooking_instructions: [
              'Toast whole grain bread until golden',
              'Dice spinach, mushrooms, and cherry tomatoes',
              'Beat eggs with salt and pepper',
              'Heat a non-stick pan and sauté vegetables for 2-3 minutes',
              'Pour beaten eggs over vegetables and cook until edges set',
              'Fold omelet in half and cook until fully set',
              'Serve with whole grain toast'
            ],
            ingredients: [
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Eggs',
                quantity_g: 150,
                nutrition: { calories: 225, protein_g: 19, carbohydrates_g: 2, fats_g: 15 },
                cost_eur: 1.00,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Spinach',
                quantity_g: 50,
                nutrition: { calories: 12, protein_g: 2, carbohydrates_g: 2, fats_g: 0 },
                cost_eur: 0.30,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Mushrooms',
                quantity_g: 60,
                nutrition: { calories: 20, protein_g: 3, carbohydrates_g: 3, fats_g: 0 },
                cost_eur: 0.50,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Cherry Tomatoes',
                quantity_g: 60,
                nutrition: { calories: 15, protein_g: 1, carbohydrates_g: 3, fats_g: 0 },
                cost_eur: 0.40,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Whole Grain Bread',
                quantity_g: 60,
                nutrition: { calories: 150, protein_g: 5, carbohydrates_g: 27, fats_g: 2 },
                cost_eur: 0.45,
              },
            ],
          },
          {
            meal_id: crypto.randomUUID(),
            meal_type: 'lunch',
            recipe_name: 'Chicken Caesar Wrap with Side Salad',
            nutrition: {
              calories: 660,
              protein_g: 44,
              carbohydrates_g: 68,
              fats_g: 24,
            },
            cost: {
              meal_cost_eur: 3.40,
            },
            cooking_instructions: [
              'Season and grill chicken breast until cooked through (165°F internal temp)',
              'Let chicken rest for 5 minutes, then slice into strips',
              'Wash and chop romaine lettuce',
              'Warm tortilla slightly for easier rolling',
              'Layer lettuce, chicken strips, parmesan, and Caesar dressing on tortilla',
              'Roll tortilla tightly, tucking in the sides',
              'Cut in half and serve with extra salad on the side'
            ],
            ingredients: [
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Chicken Breast',
                quantity_g: 120,
                nutrition: { calories: 200, protein_g: 36, carbohydrates_g: 0, fats_g: 5 },
                cost_eur: 1.70,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Whole Wheat Tortilla',
                quantity_g: 80,
                nutrition: { calories: 240, protein_g: 8, carbohydrates_g: 42, fats_g: 5 },
                cost_eur: 0.60,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Romaine Lettuce',
                quantity_g: 80,
                nutrition: { calories: 15, protein_g: 1, carbohydrates_g: 3, fats_g: 0 },
                cost_eur: 0.40,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Parmesan Cheese',
                quantity_g: 20,
                nutrition: { calories: 80, protein_g: 7, carbohydrates_g: 1, fats_g: 5 },
                cost_eur: 0.50,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Caesar Dressing',
                quantity_g: 30,
                nutrition: { calories: 125, protein_g: 1, carbohydrates_g: 2, fats_g: 12 },
                cost_eur: 0.40,
              },
            ],
          },
          {
            meal_id: crypto.randomUUID(),
            meal_type: 'dinner',
            recipe_name: 'Vegetarian Chili with Cornbread',
            nutrition: {
              calories: 800,
              protein_g: 30,
              carbohydrates_g: 98,
              fats_g: 24,
            },
            cost: {
              meal_cost_eur: 2.95,
            },
            cooking_instructions: [
              'Dice bell peppers and onion',
              'Sauté onion and peppers in a large pot until softened',
              'Drain and rinse kidney beans and black beans',
              'Add beans and tomato sauce to pot',
              'Season with chili powder, cumin, salt, and pepper',
              'Simmer for 20-25 minutes, stirring occasionally',
              'Warm cornbread in oven and serve alongside chili'
            ],
            ingredients: [
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Kidney Beans',
                quantity_g: 200,
                nutrition: { calories: 260, protein_g: 18, carbohydrates_g: 46, fats_g: 2 },
                cost_eur: 0.80,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Black Beans',
                quantity_g: 150,
                nutrition: { calories: 195, protein_g: 13, carbohydrates_g: 35, fats_g: 1 },
                cost_eur: 0.70,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Tomato Sauce',
                quantity_g: 200,
                nutrition: { calories: 80, protein_g: 3, carbohydrates_g: 16, fats_g: 0 },
                cost_eur: 0.50,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Bell Peppers',
                quantity_g: 80,
                nutrition: { calories: 25, protein_g: 1, carbohydrates_g: 6, fats_g: 0 },
                cost_eur: 0.40,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Onion',
                quantity_g: 60,
                nutrition: { calories: 25, protein_g: 1, carbohydrates_g: 5, fats_g: 0 },
                cost_eur: 0.15,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Cornbread',
                quantity_g: 100,
                nutrition: { calories: 300, protein_g: 6, carbohydrates_g: 48, fats_g: 10 },
                cost_eur: 0.60,
              },
            ],
          },
        ],
      },
    ],
    plan_totals: {
      calories: 9330,
      protein_g: 488,
      carbohydrates_g: 1036,
      fats_g: 318,
      total_cost_eur: 43.25,
    },
  };

  return mealPlan;
export function generateShoppingList(mealPlan: MealPlan): ShoppingList {

*/

export function generateShoppingList(mealPlan: MealPlan): ShoppingList {
  const ingredientMap = new Map<string, { quantity: number; price: number; name: string; id: string }>();

  for (const day of mealPlan.days) {
    for (const meal of day.meals) {
      for (const ingredient of meal.ingredients) {
        const normalizedName = ingredient.name.toLowerCase().trim();
        const existing = ingredientMap.get(normalizedName);
        if (existing) {
          existing.quantity += ingredient.quantity_g;
          existing.price += ingredient.cost_eur;
        } else {
          ingredientMap.set(normalizedName, {
            quantity: ingredient.quantity_g,
            name: ingredient.name,
            id: ingredient.ingredient_id,
            price: ingredient.cost_eur,
          });
        }
      }
    }
  }

  const items: ShoppingListItem[] = Array.from(ingredientMap.entries()).map(
    ([_, data]) => ({
      ingredient_id: data.id,
      display_name: data.name,
      total_quantity: data.quantity,
      unit: 'g' as const,
      minimum_purchase_quantity: 100,
      estimated_price_eur: Number(data.price.toFixed(2)),
    })
  );

  const totalShoppingCost = items.reduce((sum, item) => sum + item.estimated_price_eur, 0);

  return {
    plan_id: mealPlan.plan_id,
    generated_at: new Date().toISOString(),
    items: items.sort((a, b) => a.display_name.localeCompare(b.display_name)),
    summary: {
      total_items: items.length,
      total_shopping_cost_eur: Number(totalShoppingCost.toFixed(2)),
      plan_cost_eur: mealPlan.plan_totals.total_cost_eur,
      waste_cost_eur: Number(Math.max(0, totalShoppingCost - mealPlan.plan_totals.total_cost_eur).toFixed(2)),
    },
  };
}
