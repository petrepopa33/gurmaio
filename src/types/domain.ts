export interface MacroTargets {
  protein_percentage?: number;
  carbs_percentage?: number;
  fats_percentage?: number;
}

export interface UserProfile {
  budget_eur: number;
  budget_period: 'daily' | 'weekly';
  meal_plan_days: number;
  meals_per_day: number;
  dietary_preferences: string[];
  allergens: string[];
  cuisine_preferences: string[];
  other_cuisines?: string;
  target_calories?: number;
  weight_kg?: number;
  height_cm?: number;
  age?: number;
  sex?: 'male' | 'female';
  activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  objective?: 'lose_weight' | 'maintain' | 'gain_muscle';
  macro_targets?: MacroTargets;
}

export interface IngredientNutrition {
  calories: number;
  protein_g: number;
  carbohydrates_g: number;
  fats_g: number;
}

export interface Ingredient {
  ingredient_id: string;
  name: string;
  quantity_g: number;
  nutrition: IngredientNutrition;
  cost_eur: number;
}

export interface Meal {
  meal_id: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipe_name: string;
  nutrition: IngredientNutrition;
  cost: {
    meal_cost_eur: number;
  };
  ingredients: Ingredient[];
  cooking_instructions?: string[];
}

export interface Day {
  day_number: number;
  date: string;
  totals: IngredientNutrition & {
    cost_eur: number;
  };
  meals: Meal[];
}

export interface MealPlan {
  plan_id: string;
  generated_at: string;
  user_id: string;
  metadata: {
    period_budget_eur: number;
    period_cost_eur: number;
    budget_remaining_eur: number;
    is_over_budget: boolean;
    generation_attempts: number;
    days: number;
  };
  days: Day[];
  plan_totals: IngredientNutrition & {
    total_cost_eur: number;
  };
}

export interface ShoppingListItem {
  ingredient_id: string;
  display_name: string;
  total_quantity: number;
  unit: 'g' | 'ml' | 'pieces';
  minimum_purchase_quantity: number;
  estimated_price_eur: number;
  owned?: boolean;
  deleted?: boolean;
}

export interface ShoppingList {
  plan_id: string;
  generated_at: string;
  items: ShoppingListItem[];
  summary: {
    total_items: number;
    total_shopping_cost_eur: number;
    plan_cost_eur: number;
    waste_cost_eur: number;
  };
}

export interface MealRating {
  meal_id: string;
  recipe_name: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  rating: 1 | 2 | 3 | 4 | 5;
  rated_at: string;
  ingredients: string[];
}

export interface MealRatingHistory {
  ratings: MealRating[];
}

export interface PrepTask {
  task_id: string;
  task_name: string;
  meal_ids: string[];
  recipe_names: string[];
  prep_time_minutes: number;
  category: 'chopping' | 'marinating' | 'cooking' | 'portioning' | 'storage';
  ingredients: string[];
  instructions: string[];
}

export interface PrepDay {
  prep_day: string;
  total_time_minutes: number;
  tasks: PrepTask[];
  meals_prepared: number;
  tips: string[];
}

export interface BatchCookingGroup {
  group_id: string;
  recipe_type: string;
  meal_ids: string[];
  recipe_names: string[];
  batch_servings: number;
  total_prep_time_minutes: number;
  total_cook_time_minutes: number;
  storage_instructions: string;
  reheating_instructions: string;
  shared_ingredients: Ingredient[];
  efficiency_savings: {
    time_saved_minutes: number;
    cost_saved_eur: number;
  };
}

export interface MealPrepPlan {
  plan_id: string;
  meal_plan_id: string;
  generated_at: string;
  prep_schedule: PrepDay[];
  batch_cooking_groups: BatchCookingGroup[];
  total_prep_time_minutes: number;
  total_efficiency_savings: {
    time_saved_minutes: number;
    cost_saved_eur: number;
  };
  storage_requirements: {
    containers_needed: number;
    fridge_space: 'small' | 'medium' | 'large';
    freezer_space: 'none' | 'small' | 'medium' | 'large';
  };
  tips: string[];
}

export interface CompletedMeal {
  meal_id: string;
  plan_id: string;
  completed_at: string;
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipe_name: string;
  nutrition: IngredientNutrition;
  cost_eur: number;
}

export interface DayProgress {
  date: string;
  completed_meals: CompletedMeal[];
  total_nutrition: IngredientNutrition;
  total_cost: number;
  meals_count: number;
}
