export interface UserProfile {
  budget_eur: number;
  budget_period: 'daily' | 'weekly';
  meal_plan_days: number;
  dietary_preferences: string[];
  allergens: string[];
  cuisine_preferences: string[];
  target_calories?: number;
  weight_kg?: number;
  height_cm?: number;
  age?: number;
  sex?: 'male' | 'female';
  activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  objective?: 'lose_weight' | 'maintain' | 'gain_muscle';
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
