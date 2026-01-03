import type { Meal, UserProfile, MealPlan } from '@/types/domain';

export async function generateMealSubstitution(
  currentMeal: Meal,
  dayNumber: number,
  userProfile: UserProfile,
  mealPlan: MealPlan
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

  const prompt = (window.spark.llmPrompt as any)`You are a professional meal planner. Generate ONE alternative meal to replace an existing meal.

MEAL TO REPLACE:
- Current meal: ${currentMeal.recipe_name}
- Meal type: ${currentMeal.meal_type}

CONSTRAINTS:
- Maximum cost: €${remainingBudgetForMeal.toFixed(2)} (MUST NOT EXCEED)
- Target calories: ${targetMealCalories} kcal (±50 kcal)
- Target protein: ${targetProteinG}g
- Target carbs: ${targetCarbsG}g
- Target fats: ${targetFatsG}g

DIETARY PREFERENCES: ${dietaryPrefsStr}
ALLERGENS TO AVOID: ${allergensStr}
CUISINE PREFERENCES: ${cuisinesStr}

IMPORTANT:
1. Generate a DIFFERENT recipe than "${currentMeal.recipe_name}"
2. Keep it simple with 3-6 ingredients
3. Provide realistic EU grocery prices
4. Calculate accurate nutrition per ingredient
5. Include 3-7 step cooking instructions
6. STAY WITHIN THE COST LIMIT OF €${remainingBudgetForMeal.toFixed(2)}

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
