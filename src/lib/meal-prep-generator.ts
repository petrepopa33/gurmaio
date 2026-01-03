import { MealPlan, MealPrepPlan, PrepDay, PrepTask, BatchCookingGroup, Ingredient, Day, Meal } from '@/types/domain';

export async function generateMealPrepPlan(mealPlan: MealPlan): Promise<MealPrepPlan> {
  const batchGroups = identifyBatchCookingOpportunities(mealPlan);
  const prepSchedule = generatePrepSchedule(mealPlan, batchGroups);
  const totalEfficiency = calculateTotalEfficiency(batchGroups);
  const storageReqs = calculateStorageRequirements(mealPlan, batchGroups);

  const totalPrepTime = prepSchedule.reduce((sum, day) => sum + day.total_time_minutes, 0);

  return {
    plan_id: `prep-${mealPlan.plan_id}`,
    meal_plan_id: mealPlan.plan_id,
    generated_at: new Date().toISOString(),
    prep_schedule: prepSchedule,
    batch_cooking_groups: batchGroups,
    total_prep_time_minutes: totalPrepTime,
    total_efficiency_savings: totalEfficiency,
    storage_requirements: storageReqs,
    tips: generatePrepTips(mealPlan, batchGroups),
  };
}

function identifyBatchCookingOpportunities(mealPlan: MealPlan): BatchCookingGroup[] {
  const groups: BatchCookingGroup[] = [];
  const mealsByRecipe = new Map<string, Meal[]>();

  mealPlan.days.forEach(day => {
    day.meals.forEach(meal => {
      const recipeName = meal.recipe_name.toLowerCase();
      if (!mealsByRecipe.has(recipeName)) {
        mealsByRecipe.set(recipeName, []);
      }
      mealsByRecipe.get(recipeName)!.push(meal);
    });
  });

  mealsByRecipe.forEach((meals, recipeName) => {
    if (meals.length >= 2) {
      const sharedIngredients = aggregateIngredients(meals);
      const batchServings = meals.length;
      const basePrepTime = 30;
      const baseCookTime = 45;
      const timePerServing = 10;
      
      const totalPrepTime = basePrepTime + (timePerServing * (batchServings - 1) * 0.5);
      const totalCookTime = baseCookTime + (timePerServing * (batchServings - 1) * 0.3);
      
      const individualTime = (basePrepTime + baseCookTime) * batchServings;
      const batchTime = totalPrepTime + totalCookTime;
      const timeSaved = individualTime - batchTime;
      
      const costSaved = (sharedIngredients.length * 0.15 * (batchServings - 1));

      groups.push({
        group_id: `batch-${meals[0].meal_id}`,
        recipe_type: meals[0].recipe_name,
        meal_ids: meals.map(m => m.meal_id),
        recipe_names: meals.map(m => m.recipe_name),
        batch_servings: batchServings,
        total_prep_time_minutes: Math.round(totalPrepTime),
        total_cook_time_minutes: Math.round(totalCookTime),
        storage_instructions: generateStorageInstructions(meals[0]),
        reheating_instructions: generateReheatingInstructions(meals[0]),
        shared_ingredients: sharedIngredients,
        efficiency_savings: {
          time_saved_minutes: Math.round(timeSaved),
          cost_saved_eur: Math.round(costSaved * 100) / 100,
        },
      });
    }
  });

  return groups.sort((a, b) => b.efficiency_savings.time_saved_minutes - a.efficiency_savings.time_saved_minutes);
}

function aggregateIngredients(meals: any[]): Ingredient[] {
  const ingredientMap = new Map<string, Ingredient>();

  meals.forEach(meal => {
    meal.ingredients.forEach((ing: Ingredient) => {
      if (ingredientMap.has(ing.name)) {
        const existing = ingredientMap.get(ing.name)!;
        existing.quantity_g += ing.quantity_g;
        existing.cost_eur += ing.cost_eur;
        existing.nutrition.calories += ing.nutrition.calories;
        existing.nutrition.protein_g += ing.nutrition.protein_g;
        existing.nutrition.carbohydrates_g += ing.nutrition.carbohydrates_g;
        existing.nutrition.fats_g += ing.nutrition.fats_g;
      } else {
        ingredientMap.set(ing.name, { ...ing });
      }
    });
  });

  return Array.from(ingredientMap.values());
}

function generatePrepSchedule(mealPlan: MealPlan, batchGroups: BatchCookingGroup[]): PrepDay[] {
  const schedule: PrepDay[] = [];
  const daysInPlan = mealPlan.metadata.days;
  
  if (daysInPlan === 7) {
    const prepDay1Tasks = generatePrepTasks(mealPlan, batchGroups, 1, 4);
    const prepDay2Tasks = generatePrepTasks(mealPlan, batchGroups, 5, 7);
    
    schedule.push({
      prep_day: 'Sunday (Week Start)',
      total_time_minutes: prepDay1Tasks.reduce((sum, task) => sum + task.prep_time_minutes, 0),
      tasks: prepDay1Tasks,
      meals_prepared: prepDay1Tasks.reduce((sum, task) => sum + task.meal_ids.length, 0),
      tips: [
        'Prepare all ingredients before starting to cook',
        'Use multiple burners/ovens to cook in parallel',
        'Label containers with meal name and date',
        'Cool food completely before storing',
      ],
    });

    schedule.push({
      prep_day: 'Wednesday (Mid-Week)',
      total_time_minutes: prepDay2Tasks.reduce((sum, task) => sum + task.prep_time_minutes, 0),
      tasks: prepDay2Tasks,
      meals_prepared: prepDay2Tasks.reduce((sum, task) => sum + task.meal_ids.length, 0),
      tips: [
        'Use ingredients from first batch first',
        'Fresh meals taste better than reheated',
        'Check food quality before consuming',
      ],
    });
  } else {
    const singlePrepTasks = generatePrepTasks(mealPlan, batchGroups, 1, daysInPlan);
    
    schedule.push({
      prep_day: 'Sunday (Week Start)',
      total_time_minutes: singlePrepTasks.reduce((sum, task) => sum + task.prep_time_minutes, 0),
      tasks: singlePrepTasks,
      meals_prepared: singlePrepTasks.reduce((sum, task) => sum + task.meal_ids.length, 0),
      tips: [
        'Prepare all ingredients before starting',
        'Batch cook similar recipes together',
        'Label everything with dates',
      ],
    });
  }

  return schedule;
}

function generatePrepTasks(
  mealPlan: MealPlan,
  batchGroups: BatchCookingGroup[],
  startDay: number,
  endDay: number
): PrepTask[] {
  const tasks: PrepTask[] = [];
  const relevantDays = mealPlan.days.filter(d => d.day_number >= startDay && d.day_number <= endDay);
  
  const batchedMealIds = new Set(batchGroups.flatMap(g => g.meal_ids));
  
  batchGroups.forEach(group => {
    const relevantMeals = group.meal_ids.filter(mealId => {
      return relevantDays.some(day => day.meals.some(m => m.meal_id === mealId));
    });

    if (relevantMeals.length > 0) {
      tasks.push({
        task_id: `task-${group.group_id}`,
        task_name: `Batch Cook: ${group.recipe_type}`,
        meal_ids: relevantMeals,
        recipe_names: group.recipe_names.slice(0, relevantMeals.length),
        prep_time_minutes: group.total_prep_time_minutes + group.total_cook_time_minutes,
        category: 'cooking',
        ingredients: group.shared_ingredients.map(ing => `${ing.quantity_g}g ${ing.name}`),
        instructions: [
          `Prepare all ${group.shared_ingredients.length} ingredients`,
          `Cook ${relevantMeals.length} servings at once`,
          `Divide into individual portions`,
          group.storage_instructions,
        ],
      });
    }
  });

  relevantDays.forEach(day => {
    day.meals.forEach(meal => {
      if (!batchedMealIds.has(meal.meal_id)) {
        tasks.push({
          task_id: `task-${meal.meal_id}`,
          task_name: `Prep: ${meal.recipe_name}`,
          meal_ids: [meal.meal_id],
          recipe_names: [meal.recipe_name],
          prep_time_minutes: 25,
          category: 'cooking',
          ingredients: meal.ingredients.map(ing => `${ing.quantity_g}g ${ing.name}`),
          instructions: meal.cooking_instructions || [
            'Follow recipe instructions',
            'Store in airtight container',
          ],
        });
      }
    });
  });

  const choppingTask = createChoppingTask(relevantDays);
  if (choppingTask) {
    tasks.unshift(choppingTask);
  }

  return tasks;
}

function createChoppingTask(days: Day[]): PrepTask | null {
  const allIngredients = new Set<string>();
  const allMealIds: string[] = [];
  
  days.forEach(day => {
    day.meals.forEach(meal => {
      allMealIds.push(meal.meal_id);
      meal.ingredients.forEach(ing => {
        if (needsChopping(ing.name)) {
          allIngredients.add(ing.name);
        }
      });
    });
  });

  if (allIngredients.size === 0) return null;

  return {
    task_id: 'task-chopping',
    task_name: 'Chop All Vegetables',
    meal_ids: allMealIds,
    recipe_names: ['All meals'],
    prep_time_minutes: Math.min(allIngredients.size * 3, 30),
    category: 'chopping',
    ingredients: Array.from(allIngredients),
    instructions: [
      'Wash all vegetables',
      'Chop to required sizes',
      'Store in separate containers',
      'Label each container',
    ],
  };
}

function needsChopping(ingredientName: string): boolean {
  const choppableItems = [
    'onion', 'garlic', 'tomato', 'pepper', 'carrot', 'celery',
    'broccoli', 'cauliflower', 'zucchini', 'mushroom', 'spinach',
    'cabbage', 'lettuce', 'cucumber', 'potato',
  ];
  
  const lower = ingredientName.toLowerCase();
  return choppableItems.some(item => lower.includes(item));
}

function generateStorageInstructions(meal: any): string {
  const mealType = meal.meal_type;
  
  if (mealType === 'breakfast') {
    return 'Store in airtight containers in fridge for up to 4 days or freeze for up to 2 months';
  } else if (mealType === 'lunch' || mealType === 'dinner') {
    return 'Store in portion-sized containers in fridge for up to 5 days or freeze for up to 3 months';
  } else {
    return 'Store in airtight containers in fridge for up to 3 days';
  }
}

function generateReheatingInstructions(meal: any): string {
  const mealType = meal.meal_type;
  
  if (mealType === 'breakfast') {
    return 'Microwave 2-3 minutes on medium power or heat in pan over medium heat';
  } else if (mealType === 'lunch' || mealType === 'dinner') {
    return 'Microwave 3-4 minutes on high, stirring halfway, or reheat in oven at 180°C for 15-20 minutes';
  } else {
    return 'Serve cold or microwave 30-60 seconds';
  }
}

function calculateTotalEfficiency(batchGroups: BatchCookingGroup[]): { time_saved_minutes: number; cost_saved_eur: number } {
  return batchGroups.reduce(
    (acc, group) => ({
      time_saved_minutes: acc.time_saved_minutes + group.efficiency_savings.time_saved_minutes,
      cost_saved_eur: acc.cost_saved_eur + group.efficiency_savings.cost_saved_eur,
    }),
    { time_saved_minutes: 0, cost_saved_eur: 0 }
  );
}

function calculateStorageRequirements(
  mealPlan: MealPlan,
  batchGroups: BatchCookingGroup[]
): MealPrepPlan['storage_requirements'] {
  const totalMeals = mealPlan.days.reduce((sum, day) => sum + day.meals.length, 0);
  const containersNeeded = Math.ceil(totalMeals * 0.8);
  
  const fridgeSpace = totalMeals <= 10 ? 'small' : totalMeals <= 20 ? 'medium' : 'large';
  const freezerSpace = batchGroups.length === 0 ? 'none' : batchGroups.length <= 2 ? 'small' : batchGroups.length <= 4 ? 'medium' : 'large';

  return {
    containers_needed: containersNeeded,
    fridge_space: fridgeSpace as any,
    freezer_space: freezerSpace as any,
  };
}

function generatePrepTips(mealPlan: MealPlan, batchGroups: BatchCookingGroup[]): string[] {
  const tips = [
    '🕐 Set aside 2-3 hours for meal prep sessions',
    '📦 Invest in quality airtight containers',
    '🏷️ Label everything with contents and date',
    '❄️ Cool food completely before refrigerating',
    '🔄 Use older meals first (FIFO method)',
  ];

  if (batchGroups.length > 0) {
    tips.push('🍳 Batch cooking saves 30-40% of total cooking time');
    tips.push('💰 Buying ingredients in bulk reduces waste');
  }

  if (mealPlan.metadata.days >= 7) {
    tips.push('🗓️ Split prep into two sessions (Sunday & Wednesday) for freshness');
  }

  return tips;
}
