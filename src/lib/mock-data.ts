import type { MealPlan, ShoppingList, ShoppingListItem, UserProfile } from '@/types/domain';
import { calculateMacroGrams, getMacroDescription } from '@/lib/macro-calculator';

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
  const planId = crypto.randomUUID();
  const userId = 'user_123';
  
  const totalBudget = userProfile.budget_period === 'daily' 
    ? userProfile.budget_eur * userProfile.meal_plan_days 
    : userProfile.budget_eur;
  
  const dailyBudget = totalBudget / userProfile.meal_plan_days;
  const dailyCalorieTarget = userProfile.target_calories || 2000;

  const dietaryPrefsStr = userProfile.dietary_preferences.join(', ');
  const allergensStr = userProfile.allergens.length > 0 ? userProfile.allergens.join(', ') : 'none';
  const excludedIngredientsStr = userProfile.excluded_ingredients && userProfile.excluded_ingredients.length > 0 
    ? userProfile.excluded_ingredients.join(', ') 
    : 'none';
  const cuisinesStr = userProfile.cuisine_preferences.length > 0 
    ? userProfile.cuisine_preferences.join(', ') 
    : 'any';
  const otherCuisinesStr = userProfile.other_cuisines ? ` (including ${userProfile.other_cuisines})` : '';

  const macroTargets = userProfile.macro_targets || {
    protein_percentage: 30,
    carbs_percentage: 40,
    fats_percentage: 30,
  };
  
  const dailyMacroGrams = calculateMacroGrams(dailyCalorieTarget, macroTargets);
  const macroDescription = getMacroDescription(macroTargets);

  const mealsPerDay = userProfile.meals_per_day;
  const mealTypes = getMealTypesForDay(mealsPerDay);
  const mealTypesStr = mealTypes.join(', ');

  const userMetrics = userProfile.weight_kg && userProfile.height_cm && userProfile.age && userProfile.sex
    ? `Weight: ${userProfile.weight_kg}kg, Height: ${userProfile.height_cm}cm, Age: ${userProfile.age}, Sex: ${userProfile.sex}`
    : '';
  
  const activityInfo = userProfile.activity_level 
    ? `Activity Level: ${userProfile.activity_level}`
    : '';
  
  const objectiveInfo = userProfile.objective
    ? `Goal: ${userProfile.objective.replace('_', ' ')}`
    : '';

  const randomSeed = Math.floor(Math.random() * 1000000);
  const timestamp = Date.now();
  const uniqueIdentifier = `${randomSeed}-${timestamp}-${crypto.randomUUID().slice(0, 8)}`;
  
  const variationThemes = [
    'Mediterranean-inspired dishes',
    'Asian fusion recipes',
    'Comfort food classics with a healthy twist',
    'Farm-to-table seasonal ingredients',
    'Quick and easy weeknight meals',
    'Gourmet home cooking',
    'Plant-forward nutrition',
    'High-protein muscle building',
    'Colorful and vibrant dishes',
    'One-pot wonder meals',
    'Street food inspired',
    'Rustic countryside cooking',
    'Modern bistro fare',
    'Fresh and light summer meals',
    'Hearty winter comfort dishes',
    'International tapas style',
    'Chef-inspired restaurant quality',
    'Budget-friendly family meals',
    'Meal prep batch cooking',
    'Express 30-minute recipes'
  ];
  const selectedTheme = variationThemes[randomSeed % variationThemes.length];
  
  const cookingStyles = [
    'grilled', 'roasted', 'steamed', 'sautéed', 'baked', 'stir-fried', 
    'braised', 'pan-seared', 'slow-cooked', 'poached', 'air-fried', 'blanched'
  ];
  const selectedCookingStyle = cookingStyles[randomSeed % cookingStyles.length];
  
  const flavorProfiles = [
    'bold and spicy', 'mild and comforting', 'fresh and zesty', 'rich and savory',
    'sweet and tangy', 'herbaceous and aromatic', 'smoky and robust', 'light and delicate'
  ];
  const selectedFlavorProfile = flavorProfiles[Math.floor(randomSeed / 100) % flavorProfiles.length];
  
  console.log('🔄 ========================================');
  console.log('🔄 GENERATING BRAND NEW MEAL PLAN');
  console.log('🔄 ========================================');
  console.log('🔄 Profile Settings:', {
    days: userProfile.meal_plan_days,
    mealsPerDay: userProfile.meals_per_day,
    budget: userProfile.budget_eur,
    budgetPeriod: userProfile.budget_period,
    calories: userProfile.target_calories,
    dietary: userProfile.dietary_preferences
  });
  console.log('🔄 Variation Parameters:', {
    uniqueId: uniqueIdentifier,
    theme: selectedTheme,
    cookingStyle: selectedCookingStyle,
    flavorProfile: selectedFlavorProfile,
    randomSeed: randomSeed,
    timestamp: timestamp
  });
  console.log('🔄 ========================================');
  
  const prompt = (window.spark.llmPrompt as any)`You are a professional meal planner. Generate a UNIQUE and VARIED ${userProfile.meal_plan_days}-day meal plan with the following constraints:

VARIATION REQUIREMENT (CRITICAL - READ THIS FIRST):
- Generation ID: ${uniqueIdentifier}
- Generation timestamp: ${timestamp}
- Theme for THIS specific plan: ${selectedTheme}
- Preferred cooking method: ${selectedCookingStyle}
- Target flavor profile: ${selectedFlavorProfile}
- Random variation seed: ${randomSeed}

MANDATORY UNIQUENESS RULES:
1. You MUST treat each generation request as completely independent
2. DO NOT generate the same meals you may have generated before
3. Even if the user parameters are identical, create ENTIRELY DIFFERENT recipes
4. Use the theme "${selectedTheme}" to guide your recipe choices for THIS plan
5. Emphasize "${selectedCookingStyle}" cooking techniques where appropriate
6. Target "${selectedFlavorProfile}" flavor combinations
7. Mix up cuisines, ingredients, and cooking methods to maximize variety
8. Think of this as a brand new client with fresh tastes - be creative and original
9. If generating breakfast, don't default to the same breakfast options - be innovative
10. CRITICAL: This generation ID ${uniqueIdentifier} must produce recipes you haven't used in previous generations

USER PROFILE:
${userMetrics ? `- Physical Metrics: ${userMetrics}` : ''}
${activityInfo ? `- ${activityInfo}` : ''}
${objectiveInfo ? `- ${objectiveInfo}` : ''}

BUDGET CONSTRAINT (CRITICAL):
- Total budget: €${totalBudget.toFixed(2)} for ${userProfile.meal_plan_days} days
- Daily budget: approximately €${dailyBudget.toFixed(2)} per day
- Each day should have exactly ${mealsPerDay} meals: ${mealTypesStr}
- STAY WITHIN OR SLIGHTLY UNDER BUDGET

NUTRITION TARGET:
- Target daily calories: ${dailyCalorieTarget} kcal
- Target daily protein: ${dailyMacroGrams.protein_g}g (${macroTargets.protein_percentage}% of calories)
- Target daily carbohydrates: ${dailyMacroGrams.carbs_g}g (${macroTargets.carbs_percentage}% of calories)
- Target daily fats: ${dailyMacroGrams.fats_g}g (${macroTargets.fats_percentage}% of calories)
- Macro split: ${macroDescription}
- Each day should be close to the calorie target (within 10%)
- PRIORITIZE meeting the macro percentages - this is critical for the user's goals
- Adjust ingredient portions to hit macro targets as closely as possible

DIETARY PREFERENCES (MUST FOLLOW): ${dietaryPrefsStr}
ALLERGENS TO AVOID (CRITICAL - NEVER INCLUDE): ${allergensStr}
EXCLUDED INGREDIENTS (CRITICAL - NEVER INCLUDE THESE): ${excludedIngredientsStr}
CUISINE PREFERENCES (PRIORITIZE THESE): ${cuisinesStr}${otherCuisinesStr}

IMPORTANT INSTRUCTIONS:
1. Generate realistic, cookable recipes with simple ingredients
2. Include specific ingredient quantities in grams
3. Provide realistic costs per ingredient based on EU grocery prices
4. Calculate accurate nutrition per ingredient (calories, protein, carbs, fats)
5. Include 3-7 step cooking instructions for each meal
6. Make sure total plan cost does NOT exceed €${totalBudget.toFixed(2)}
7. Generate EXACTLY ${mealsPerDay} meals per day with the following meal types: ${mealTypesStr}
8. NEVER use any ingredient from the excluded ingredients list - this is a strict requirement
9. CREATE VARIETY - use different recipes, ingredients, and cooking techniques for each new generation
10. ENSURE UNIQUENESS - even with the same parameters, generate completely different meals each time (generation ID: ${uniqueIdentifier})
11. CRITICAL: Do not cache or reuse previous responses - each generation must be fresh and unique
12. VARIATION REQUIREMENT: Make every single meal different from what you might have suggested before
13. Use the theme "${selectedTheme}" as inspiration to guide recipe selection

Return the result as a valid JSON object with a single property called "days" that contains an array of day objects. Each day must have:
- day_number: number (1 to ${userProfile.meal_plan_days})
- meals: array of EXACTLY ${mealsPerDay} meal objects

Each meal must have:
- meal_type: one of [${mealTypes.map(t => `"${t}"`).join(', ')}]
- recipe_name: string (appetizing name)
- cooking_instructions: array of strings (3-7 steps)
- ingredients: array of ingredient objects

Each ingredient must have:
- name: string
- quantity_g: number (in grams)
- nutrition: { calories: number, protein_g: number, carbohydrates_g: number, fats_g: number }
- cost_eur: number (realistic EU grocery price for that quantity)

Format:
{
  "days": [
    {
      "day_number": 1,
      "meals": [
        {
          "meal_type": "breakfast",
          "recipe_name": "Recipe Name",
          "cooking_instructions": ["Step 1", "Step 2", "Step 3"],
          "ingredients": [
            {
              "name": "Ingredient Name",
              "quantity_g": 100,
              "nutrition": { "calories": 150, "protein_g": 10, "carbohydrates_g": 20, "fats_g": 5 },
              "cost_eur": 0.50
            }
          ]
        }
      ]
    }
  ]
}`;

  try {
    const response = await window.spark.llm(prompt, 'gpt-4o', true);
    const parsed = JSON.parse(response);
    
    console.log('✅ AI Generated meal plan structure:', {
      daysCount: parsed.days?.length,
      firstDayMealsCount: parsed.days?.[0]?.meals?.length,
      firstMealName: parsed.days?.[0]?.meals?.[0]?.recipe_name
    });
    
    const days = parsed.days.map((day: any) => {
      const meals = day.meals.map((meal: any) => {
        const ingredients = meal.ingredients.map((ing: any) => ({
          ingredient_id: crypto.randomUUID(),
          name: ing.name,
          quantity_g: ing.quantity_g,
          nutrition: ing.nutrition,
          cost_eur: Number(ing.cost_eur.toFixed(2)),
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
          meal_type: meal.meal_type,
          recipe_name: meal.recipe_name,
          nutrition: mealNutrition,
          cost: { meal_cost_eur: Number(mealCost.toFixed(2)) },
          ingredients,
          cooking_instructions: meal.cooking_instructions || [],
        };
      });

      const dayTotals = meals.reduce(
        (acc, meal) => ({
          calories: acc.calories + meal.nutrition.calories,
          protein_g: acc.protein_g + meal.nutrition.protein_g,
          carbohydrates_g: acc.carbohydrates_g + meal.nutrition.carbohydrates_g,
          fats_g: acc.fats_g + meal.nutrition.fats_g,
          cost_eur: acc.cost_eur + meal.cost.meal_cost_eur,
        }),
        { calories: 0, protein_g: 0, carbohydrates_g: 0, fats_g: 0, cost_eur: 0 }
      );

      const date = new Date(Date.now() + (day.day_number - 1) * 86400000)
        .toISOString()
        .split('T')[0];

      return {
        day_number: day.day_number,
        date,
        totals: dayTotals,
        meals,
      };
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

    const isOverBudget = planTotals.total_cost_eur > totalBudget;
    const budgetRemaining = totalBudget - planTotals.total_cost_eur;

    const finalPlan = {
      plan_id: planId,
      generated_at: new Date().toISOString(),
      user_id: userId,
      metadata: {
        period_budget_eur: Number(totalBudget.toFixed(2)),
        period_cost_eur: Number(planTotals.total_cost_eur.toFixed(2)),
        budget_remaining_eur: Number(budgetRemaining.toFixed(2)),
        is_over_budget: isOverBudget,
        generation_attempts: 1,
        days: userProfile.meal_plan_days,
      },
      days,
      plan_totals: {
        ...planTotals,
        total_cost_eur: Number(planTotals.total_cost_eur.toFixed(2)),
      },
    };

    console.log('✅ Final meal plan created:', {
      planId: finalPlan.plan_id,
      daysGenerated: finalPlan.days.length,
      totalCost: finalPlan.plan_totals.total_cost_eur,
      budget: finalPlan.metadata.period_budget_eur,
      mealsInDay1: finalPlan.days[0].meals.length
    });

    return finalPlan;
  } catch (error) {
    console.error('Failed to generate meal plan with AI, using fallback', error);
    return generateFallbackMealPlan(userProfile);
  }
}

function generateFallbackMealPlan(userProfile: UserProfile): MealPlan {
  const planId = crypto.randomUUID();
  const userId = 'user_123';
  const totalBudget = userProfile.budget_period === 'daily' 
    ? userProfile.budget_eur * userProfile.meal_plan_days 
    : userProfile.budget_eur;
  const budgetEur = totalBudget;
  const days = userProfile.meal_plan_days;

  const mealPlan: MealPlan = {
    plan_id: planId,
    generated_at: new Date().toISOString(),
    user_id: userId,
    metadata: {
      period_budget_eur: budgetEur,
      period_cost_eur: 43.25,
      budget_remaining_eur: 6.75,
      is_over_budget: false,
      generation_attempts: 1,
      days: days,
    },
    days: [
      {
        day_number: 1,
        date: new Date(Date.now()).toISOString().split('T')[0],
        totals: {
          calories: 1850,
          protein_g: 98,
          carbohydrates_g: 210,
          fats_g: 62,
          cost_eur: 8.50,
        },
        meals: [
          {
            meal_id: crypto.randomUUID(),
            meal_type: 'breakfast',
            recipe_name: 'Greek Yogurt with Berries & Granola',
            nutrition: {
              calories: 420,
              protein_g: 18,
              carbohydrates_g: 52,
              fats_g: 14,
            },
            cost: {
              meal_cost_eur: 2.40,
            },
            cooking_instructions: [
              'Place Greek yogurt in a serving bowl',
              'Rinse the mixed berries and pat them dry',
              'Top the yogurt with fresh berries',
              'Sprinkle granola evenly over the top',
              'Serve immediately for best texture'
            ],
            ingredients: [
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Greek Yogurt',
                quantity_g: 200,
                nutrition: { calories: 150, protein_g: 15, carbohydrates_g: 8, fats_g: 5 },
                cost_eur: 1.20,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Mixed Berries',
                quantity_g: 100,
                nutrition: { calories: 50, protein_g: 1, carbohydrates_g: 12, fats_g: 0 },
                cost_eur: 0.80,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Granola',
                quantity_g: 50,
                nutrition: { calories: 220, protein_g: 2, carbohydrates_g: 32, fats_g: 9 },
                cost_eur: 0.40,
              },
            ],
          },
          {
            meal_id: crypto.randomUUID(),
            meal_type: 'lunch',
            recipe_name: 'Chicken & Quinoa Bowl with Roasted Vegetables',
            nutrition: {
              calories: 680,
              protein_g: 48,
              carbohydrates_g: 72,
              fats_g: 22,
            },
            cost: {
              meal_cost_eur: 3.80,
            },
            cooking_instructions: [
              'Preheat oven to 200°C (400°F)',
              'Cook quinoa according to package instructions',
              'Dice bell peppers and zucchini into bite-sized pieces',
              'Toss vegetables with olive oil, salt, and pepper, then roast for 20-25 minutes',
              'Season chicken breast with salt, pepper, and herbs',
              'Grill or pan-fry chicken for 6-7 minutes per side until cooked through',
              'Slice chicken and arrange over quinoa with roasted vegetables'
            ],
            ingredients: [
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Chicken Breast',
                quantity_g: 150,
                nutrition: { calories: 250, protein_g: 45, carbohydrates_g: 0, fats_g: 6 },
                cost_eur: 2.10,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Quinoa',
                quantity_g: 80,
                nutrition: { calories: 280, protein_g: 10, carbohydrates_g: 52, fats_g: 4 },
                cost_eur: 0.60,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Bell Peppers',
                quantity_g: 100,
                nutrition: { calories: 30, protein_g: 1, carbohydrates_g: 6, fats_g: 0 },
                cost_eur: 0.50,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Zucchini',
                quantity_g: 120,
                nutrition: { calories: 20, protein_g: 2, carbohydrates_g: 4, fats_g: 0 },
                cost_eur: 0.40,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Olive Oil',
                quantity_g: 10,
                nutrition: { calories: 100, protein_g: 0, carbohydrates_g: 0, fats_g: 12 },
                cost_eur: 0.20,
              },
            ],
          },
          {
            meal_id: crypto.randomUUID(),
            meal_type: 'dinner',
            recipe_name: 'Salmon with Sweet Potato & Broccoli',
            nutrition: {
              calories: 750,
              protein_g: 42,
              carbohydrates_g: 86,
              fats_g: 26,
            },
            cost: {
              meal_cost_eur: 5.30,
            },
            cooking_instructions: [
              'Preheat oven to 200°C (400°F)',
              'Pierce sweet potato with fork and bake for 45 minutes until tender',
              'Season salmon fillet with salt, pepper, and lemon juice',
              'Bake salmon at 180°C (350°F) for 12-15 minutes until flaky',
              'Steam broccoli for 5-7 minutes until bright green and tender-crisp',
              'Drizzle vegetables with olive oil before serving'
            ],
            ingredients: [
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Salmon Fillet',
                quantity_g: 150,
                nutrition: { calories: 300, protein_g: 30, carbohydrates_g: 0, fats_g: 18 },
                cost_eur: 3.80,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Sweet Potato',
                quantity_g: 250,
                nutrition: { calories: 220, protein_g: 4, carbohydrates_g: 52, fats_g: 0 },
                cost_eur: 0.80,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Broccoli',
                quantity_g: 150,
                nutrition: { calories: 50, protein_g: 4, carbohydrates_g: 10, fats_g: 0 },
                cost_eur: 0.60,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Olive Oil',
                quantity_g: 8,
                nutrition: { calories: 80, protein_g: 0, carbohydrates_g: 0, fats_g: 8 },
                cost_eur: 0.10,
              },
            ],
          },
        ],
      },
      {
        day_number: 2,
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        totals: {
          calories: 1920,
          protein_g: 102,
          carbohydrates_g: 198,
          fats_g: 68,
          cost_eur: 8.90,
        },
        meals: [
          {
            meal_id: crypto.randomUUID(),
            meal_type: 'breakfast',
            recipe_name: 'Scrambled Eggs with Whole Grain Toast & Avocado',
            nutrition: {
              calories: 480,
              protein_g: 22,
              carbohydrates_g: 38,
              fats_g: 24,
            },
            cost: {
              meal_cost_eur: 2.80,
            },
            cooking_instructions: [
              'Toast whole grain bread until golden brown',
              'Crack eggs into a bowl and whisk with a pinch of salt and pepper',
              'Heat a non-stick pan over medium heat with a small amount of butter',
              'Pour in eggs and gently stir with a spatula until softly scrambled',
              'Slice avocado and arrange on toast',
              'Serve scrambled eggs alongside avocado toast'
            ],
            ingredients: [
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Eggs',
                quantity_g: 120,
                nutrition: { calories: 180, protein_g: 15, carbohydrates_g: 2, fats_g: 12 },
                cost_eur: 0.80,
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
                name: 'Avocado',
                quantity_g: 80,
                nutrition: { calories: 100, protein_g: 1, carbohydrates_g: 0, fats_g: 10 },
                cost_eur: 1.40,
              },
            ],
          },
          {
            meal_id: crypto.randomUUID(),
            meal_type: 'lunch',
            recipe_name: 'Mediterranean Chickpea Salad',
            nutrition: {
              calories: 620,
              protein_g: 24,
              carbohydrates_g: 78,
              fats_g: 22,
            },
            cost: {
              meal_cost_eur: 2.90,
            },
            cooking_instructions: [
              'Drain and rinse chickpeas thoroughly',
              'Dice cucumber and halve cherry tomatoes',
              'Crumble feta cheese into small pieces',
              'Combine all vegetables and chickpeas in a large bowl',
              'Drizzle with olive oil and toss to combine',
              'Season with salt, pepper, and fresh herbs if desired'
            ],
            ingredients: [
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Chickpeas',
                quantity_g: 200,
                nutrition: { calories: 300, protein_g: 18, carbohydrates_g: 48, fats_g: 6 },
                cost_eur: 0.90,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Cherry Tomatoes',
                quantity_g: 120,
                nutrition: { calories: 25, protein_g: 1, carbohydrates_g: 5, fats_g: 0 },
                cost_eur: 0.70,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Cucumber',
                quantity_g: 100,
                nutrition: { calories: 15, protein_g: 1, carbohydrates_g: 3, fats_g: 0 },
                cost_eur: 0.40,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Feta Cheese',
                quantity_g: 50,
                nutrition: { calories: 130, protein_g: 7, carbohydrates_g: 2, fats_g: 10 },
                cost_eur: 0.90,
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
          {
            meal_id: crypto.randomUUID(),
            meal_type: 'dinner',
            recipe_name: 'Turkey Bolognese with Whole Wheat Pasta',
            nutrition: {
              calories: 820,
              protein_g: 56,
              carbohydrates_g: 92,
              fats_g: 22,
            },
            cost: {
              meal_cost_eur: 3.20,
            },
            cooking_instructions: [
              'Bring a large pot of salted water to boil for pasta',
              'Dice onion finely and sauté in olive oil until translucent',
              'Add ground turkey and cook until browned, breaking it up with a spoon',
              'Stir in tomato sauce and simmer for 15-20 minutes',
              'Cook whole wheat pasta according to package instructions',
              'Drain pasta and toss with the turkey bolognese sauce',
              'Serve hot with optional parmesan cheese'
            ],
            ingredients: [
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Ground Turkey',
                quantity_g: 150,
                nutrition: { calories: 240, protein_g: 42, carbohydrates_g: 0, fats_g: 8 },
                cost_eur: 2.00,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Whole Wheat Pasta',
                quantity_g: 100,
                nutrition: { calories: 340, protein_g: 12, carbohydrates_g: 68, fats_g: 2 },
                cost_eur: 0.50,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Tomato Sauce',
                quantity_g: 150,
                nutrition: { calories: 60, protein_g: 2, carbohydrates_g: 12, fats_g: 0 },
                cost_eur: 0.40,
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
                name: 'Olive Oil',
                quantity_g: 10,
                nutrition: { calories: 100, protein_g: 0, carbohydrates_g: 0, fats_g: 12 },
                cost_eur: 0.10,
              },
            ],
          },
        ],
      },
      {
        day_number: 3,
        date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
        totals: {
          calories: 1780,
          protein_g: 92,
          carbohydrates_g: 205,
          fats_g: 58,
          cost_eur: 8.40,
        },
        meals: [
          {
            meal_id: crypto.randomUUID(),
            meal_type: 'breakfast',
            recipe_name: 'Banana Protein Smoothie with Oats',
            nutrition: {
              calories: 410,
              protein_g: 28,
              carbohydrates_g: 58,
              fats_g: 8,
            },
            cost: {
              meal_cost_eur: 2.20,
            },
            cooking_instructions: [
              'Peel and slice banana into chunks',
              'Add banana, protein powder, oats, and almond milk to a blender',
              'Blend on high speed for 30-60 seconds until smooth',
              'Add ice cubes if desired for a thicker consistency',
              'Pour into a glass and enjoy immediately'
            ],
            ingredients: [
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Banana',
                quantity_g: 120,
                nutrition: { calories: 110, protein_g: 1, carbohydrates_g: 28, fats_g: 0 },
                cost_eur: 0.30,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Protein Powder',
                quantity_g: 30,
                nutrition: { calories: 120, protein_g: 24, carbohydrates_g: 2, fats_g: 1 },
                cost_eur: 1.20,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Oats',
                quantity_g: 50,
                nutrition: { calories: 180, protein_g: 6, carbohydrates_g: 30, fats_g: 3 },
                cost_eur: 0.20,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Almond Milk',
                quantity_g: 250,
                nutrition: { calories: 30, protein_g: 1, carbohydrates_g: 2, fats_g: 2 },
                cost_eur: 0.50,
              },
            ],
          },
          {
            meal_id: crypto.randomUUID(),
            meal_type: 'lunch',
            recipe_name: 'Tuna & White Bean Salad',
            nutrition: {
              calories: 590,
              protein_g: 38,
              carbohydrates_g: 62,
              fats_g: 18,
            },
            cost: {
              meal_cost_eur: 3.10,
            },
            cooking_instructions: [
              'Drain canned tuna and white beans',
              'Wash and dry mixed greens and cherry tomatoes',
              'Halve cherry tomatoes',
              'Combine greens, tuna, white beans, and tomatoes in a large bowl',
              'Drizzle with olive oil and toss gently',
              'Season with salt, pepper, and lemon juice if desired'
            ],
            ingredients: [
              {
                ingredient_id: crypto.randomUUID(),
                name: 'Canned Tuna',
                quantity_g: 120,
                nutrition: { calories: 140, protein_g: 30, carbohydrates_g: 0, fats_g: 2 },
                cost_eur: 1.80,
              },
              {
                ingredient_id: crypto.randomUUID(),
                name: 'White Beans',
                quantity_g: 180,
                nutrition: { calories: 240, protein_g: 14, carbohydrates_g: 42, fats_g: 1 },
                cost_eur: 0.70,
              },
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
}

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
      total_quantity: Math.ceil(data.quantity / 50) * 50,
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
