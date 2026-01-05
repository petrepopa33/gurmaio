import type { Meal, UserProfile, MealPlan, MealRating } from '@/types/domain';

export async function generateMealSubstitution(
  currentMeal: Meal,
  dayNumber: number,
  userProfile: UserProfile,
  mealPlan: MealPlan,
  mealRatings?: MealRating[]
): Promise<Meal> {
  const dailyBudget = mealPlan.metadata.period_budget_eur / mealPlan.metadata.days;
  const currentDayTotalCost = mealPlan.days.find(d => d.day_number === dayNumber)?.totals.cost_eur || 0;
  const otherMealsCost = currentDayTotalCost - currentMeal.cost.meal_cost_eur;
  const remainingBudgetForMeal = dailyBudget - otherMealsCost;
  
  const dailyCalorieTarget = userProfile.target_calories || 2000;
  const targetMealCalories = Math.round(dailyCalorieTarget / userProfile.meals_per_day);
  
  const macroTargets = userProfile.macro_targets || {
    protein_percentage: 30,
    carbs_percentage: 40,
    fats_percentage: 30,
  };
  
  const targetProteinG = Math.round((targetMealCalories * (macroTargets.protein_percentage! / 100)) / 4);
  const targetCarbsG = Math.round((targetMealCalories * (macroTargets.carbs_percentage! / 100)) / 4);
  const targetFatsG = Math.round((targetMealCalories * (macroTargets.fats_percentage! / 100)) / 9);

  const dietaryPrefsStr = userProfile.dietary_preferences.join(', ');
  const allergensStr = userProfile.allergens.length > 0 ? userProfile.allergens.join(', ') : 'none';
  const cuisinesStr = userProfile.cuisine_preferences.length > 0 
    ? userProfile.cuisine_preferences.join(', ') 
    : 'any';
  const otherCuisinesStr = userProfile.other_cuisines ? ` (including ${userProfile.other_cuisines})` : '';

  const userMetrics = userProfile.weight_kg && userProfile.height_cm && userProfile.age && userProfile.sex
    ? `Weight: ${userProfile.weight_kg}kg, Height: ${userProfile.height_cm}cm, Age: ${userProfile.age}, Sex: ${userProfile.sex}`
    : '';
  
  const activityInfo = userProfile.activity_level 
    ? `Activity Level: ${userProfile.activity_level}`
    : '';
  
  const objectiveInfo = userProfile.objective
    ? `Goal: ${userProfile.objective.replace('_', ' ')}`
    : '';

  const highRatedMeals = mealRatings
    ?.filter(r => r.rating >= 4 && r.meal_type === currentMeal.meal_type)
    .slice(0, 5) || [];
  
  const lowRatedMeals = mealRatings
    ?.filter(r => r.rating <= 2 && r.meal_type === currentMeal.meal_type)
    .slice(0, 5) || [];

  const highRatedIngredientsMap = new Map<string, number>();
  highRatedMeals.forEach(meal => {
    meal.ingredients.forEach(ing => {
      highRatedIngredientsMap.set(ing, (highRatedIngredientsMap.get(ing) || 0) + 1);
    });
  });

  const preferredIngredients = Array.from(highRatedIngredientsMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([ing]) => ing);

  const dislikedIngredients = lowRatedMeals
    .flatMap(m => m.ingredients)
    .filter((ing, idx, arr) => arr.indexOf(ing) === idx)
    .slice(0, 10);

  const preferredRecipes = highRatedMeals.map(m => m.recipe_name);
  const dislikedRecipes = lowRatedMeals.map(m => m.recipe_name);

  let ratingGuidance = '';
  if (preferredIngredients.length > 0 || preferredRecipes.length > 0) {
    ratingGuidance = `\n\nUSER PREFERENCES (prioritize these):`;
    if (preferredRecipes.length > 0) {
      ratingGuidance += `\n- User liked these ${currentMeal.meal_type} recipes: ${preferredRecipes.join(', ')}`;
      ratingGuidance += `\n- Generate something SIMILAR in style/flavor profile to these highly-rated meals`;
    }
    if (preferredIngredients.length > 0) {
      ratingGuidance += `\n- User frequently enjoys: ${preferredIngredients.join(', ')}`;
      ratingGuidance += `\n- TRY TO INCLUDE some of these preferred ingredients when appropriate`;
    }
  }

  if (dislikedIngredients.length > 0 || dislikedRecipes.length > 0) {
    ratingGuidance += `\n\nUSER DISLIKES (avoid these):`;
    if (dislikedRecipes.length > 0) {
      ratingGuidance += `\n- User disliked: ${dislikedRecipes.join(', ')}`;
      ratingGuidance += `\n- AVOID recipes similar to these low-rated meals`;
    }
    if (dislikedIngredients.length > 0) {
      ratingGuidance += `\n- User dislikes: ${dislikedIngredients.join(', ')}`;
      ratingGuidance += `\n- DO NOT use these ingredients`;
    }
  }

  const prompt = (window.spark.llmPrompt as any)`You are a professional meal planner. Generate ONE alternative meal to replace an existing meal.

USER PROFILE:
${userMetrics ? `- Physical Metrics: ${userMetrics}` : ''}
${activityInfo ? `- ${activityInfo}` : ''}
${objectiveInfo ? `- ${objectiveInfo}` : ''}

MEAL TO REPLACE:
- Current meal: ${currentMeal.recipe_name}
- Meal type: ${currentMeal.meal_type}

CONSTRAINTS:
- Maximum cost: €${remainingBudgetForMeal.toFixed(2)} (MUST NOT EXCEED)
- Target calories: ${targetMealCalories} kcal (±50 kcal)
- Target protein: ${targetProteinG}g
- Target carbs: ${targetCarbsG}g
- Target fats: ${targetFatsG}g

DIETARY PREFERENCES (MUST FOLLOW): ${dietaryPrefsStr}
ALLERGENS TO AVOID (CRITICAL - NEVER INCLUDE): ${allergensStr}
CUISINE PREFERENCES (PRIORITIZE THESE): ${cuisinesStr}${otherCuisinesStr}${ratingGuidance}

IMPORTANT:
1. Generate a DIFFERENT recipe than "${currentMeal.recipe_name}"
2. Keep it simple with 3-6 ingredients
3. Provide realistic EU grocery prices
4. Calculate accurate nutrition per ingredient
5. Include 3-7 step cooking instructions
6. STAY WITHIN THE COST LIMIT OF €${remainingBudgetForMeal.toFixed(2)}
${preferredIngredients.length > 0 ? `7. STRONGLY PREFER using ingredients from the user's preferred list above` : ''}
${dislikedIngredients.length > 0 ? `8. ABSOLUTELY AVOID ingredients from the user's disliked list above` : ''}

Return ONLY a valid JSON object (NOT an array) with the following structure:
{
  "meal_type": "${currentMeal.meal_type}",
  "recipe_name": "Recipe Name",
  "cooking_instructions": ["step 1", "step 2", ...],
  "ingredients": [
    {
      "name": "ingredient name",
      "quantity_g": number,
      "nutrition": {
        "calories": number,
        "protein_g": number,
        "carbohydrates_g": number,
        "fats_g": number
      },
      "cost_eur": number
    }
  ]
}`;

  try {
    const result = await window.spark.llm(prompt, 'gpt-4o', true);
    const mealData = JSON.parse(result);
    
    const mealNutrition = {
      calories: 0,
      protein_g: 0,
      carbohydrates_g: 0,
      fats_g: 0,
    };
    
    let mealCost = 0;
    
    const ingredients = mealData.ingredients.map((ing: any) => {
      mealNutrition.calories += ing.nutrition.calories;
      mealNutrition.protein_g += ing.nutrition.protein_g;
      mealNutrition.carbohydrates_g += ing.nutrition.carbohydrates_g;
      mealNutrition.fats_g += ing.nutrition.fats_g;
      mealCost += ing.cost_eur;
      
      return {
        ingredient_id: crypto.randomUUID(),
        name: ing.name,
        quantity_g: ing.quantity_g,
        nutrition: ing.nutrition,
        cost_eur: ing.cost_eur,
      };
    });
    
    const newMeal: Meal = {
      meal_id: crypto.randomUUID(),
      meal_type: currentMeal.meal_type,
      recipe_name: mealData.recipe_name,
      nutrition: mealNutrition,
      cost: {
        meal_cost_eur: mealCost,
      },
      ingredients,
      cooking_instructions: mealData.cooking_instructions || [],
    };
    
    return newMeal;
  } catch (error) {
    console.error('Error generating meal substitution:', error);
    throw new Error('Failed to generate alternative meal. Please try again.');
  }
}
