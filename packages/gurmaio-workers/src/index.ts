import { withCors, corsHeaders } from './cors';
import { verifySupabaseJwt } from './auth';
import { supabaseDelete, supabaseSelectMany, supabaseSelectSingle, supabaseUpsert } from './supabase-rest';
import { generateFallbackMealPlan } from './mealplan-fallback';

type Env = {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  ALLOWED_ORIGINS?: string;
};

type ProfileRow = {
  user_id: string;
  meal_plan_days: number;
  meals_per_day: number;
  budget_eur: string | number;
  budget_period: 'daily' | 'weekly';
  dietary_preferences: string[];
  allergens: string[];
};

type UserProfile = {
  budget_eur: number;
  budget_period: 'daily' | 'weekly';
  meal_plan_days: number;
  meals_per_day: number;
  dietary_preferences: string[];
  allergens: string[];
};

type FrontendIngredientNutrition = {
  calories: number;
  protein_g: number;
  carbohydrates_g: number;
  fats_g: number;
};

type FrontendIngredient = {
  ingredient_id: string;
  name: string;
  quantity_g: number;
  nutrition: FrontendIngredientNutrition;
  cost_eur: number;
};

type FrontendMeal = {
  meal_id: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipe_name: string;
  nutrition: FrontendIngredientNutrition;
  cost: { meal_cost_eur: number };
  ingredients: FrontendIngredient[];
  cooking_instructions?: string[];
};

type FrontendDay = {
  day_number: number;
  date: string;
  totals: FrontendIngredientNutrition & { cost_eur: number };
  meals: FrontendMeal[];
};

type FrontendMealPlan = {
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
  days: FrontendDay[];
  plan_totals: FrontendIngredientNutrition & { total_cost_eur: number };
};

type FrontendShoppingListItem = {
  ingredient_id: string;
  display_name: string;
  total_quantity: number;
  unit: 'g' | 'ml' | 'pieces';
  minimum_purchase_quantity: number;
  estimated_price_eur: number;
  owned?: boolean;
  deleted?: boolean;
};

type FrontendShoppingList = {
  plan_id: string;
  generated_at: string;
  items: FrontendShoppingListItem[];
  summary: {
    total_items: number;
    total_shopping_cost_eur: number;
    plan_cost_eur: number;
    waste_cost_eur: number;
  };
};

type DayProgress = {
  date: string;
  completed_meals: unknown[];
  total_nutrition: FrontendIngredientNutrition;
  total_cost: number;
  meals_count: number;
};

function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function normalizeMealType(mealType: string): FrontendMeal['meal_type'] {
  const t = (mealType || '').toLowerCase();
  if (t === 'breakfast' || t === 'lunch' || t === 'dinner' || t === 'snack') return t;
  return 'lunch';
}

function scaleNutritionPer100g(
  nutritionPer100g: FrontendIngredientNutrition,
  quantityG: number
): FrontendIngredientNutrition {
  const factor = quantityG / 100;
  return {
    calories: round2(nutritionPer100g.calories * factor),
    protein_g: round2(nutritionPer100g.protein_g * factor),
    carbohydrates_g: round2(nutritionPer100g.carbohydrates_g * factor),
    fats_g: round2(nutritionPer100g.fats_g * factor),
  };
}

function normalizePlanForFrontend(rawPlan: any, profile: UserProfile): FrontendMealPlan {
  const days = (rawPlan.days || []).map((day: any) => {
    const meals = (day.meals || []).map((meal: any) => {
      const ingredients = (meal.ingredients || []).map((ing: any) => {
        const unit = String(ing.unit || 'g').toLowerCase();
        const q = Number(ing.quantity || 0);
        const quantityG = unit === 'g' || unit === 'ml' ? q : q;
        const nutritionPer100g = ing.nutrition_per_100g || { calories: 0, protein_g: 0, carbohydrates_g: 0, fats_g: 0 };
        return {
          ingredient_id: String(ing.ingredient_id || crypto.randomUUID()),
          name: String(ing.name || ''),
          quantity_g: Number.isFinite(quantityG) ? quantityG : 0,
          nutrition: scaleNutritionPer100g(nutritionPer100g, Number.isFinite(quantityG) ? quantityG : 0),
          cost_eur: round2(Number(ing.estimated_cost_eur || 0)),
        } satisfies FrontendIngredient;
      });

      return {
        meal_id: String(meal.meal_id || crypto.randomUUID()),
        meal_type: normalizeMealType(meal.meal_type),
        recipe_name: String(meal.recipe_name || 'Meal'),
        nutrition: meal.nutrition || { calories: 0, protein_g: 0, carbohydrates_g: 0, fats_g: 0 },
        cost: { meal_cost_eur: round2(Number(meal.cost?.meal_cost_eur || 0)) },
        ingredients,
        cooking_instructions: Array.isArray(meal.instructions) ? meal.instructions : undefined,
      } satisfies FrontendMeal;
    });

    return {
      day_number: Number(day.day_number || 1),
      date: String(day.date || new Date().toISOString().slice(0, 10)),
      totals: day.totals || { calories: 0, protein_g: 0, carbohydrates_g: 0, fats_g: 0, cost_eur: 0 },
      meals,
    } satisfies FrontendDay;
  });

  const totalBudget = profile.budget_period === 'daily'
    ? profile.budget_eur * profile.meal_plan_days
    : profile.budget_eur;

  const planTotals = rawPlan.plan_totals || { calories: 0, protein_g: 0, carbohydrates_g: 0, fats_g: 0, total_cost_eur: 0 };

  const periodCost = Number(rawPlan.metadata?.period_cost_eur ?? planTotals.total_cost_eur ?? 0);
  const budgetRemaining = round2(Number(rawPlan.metadata?.budget_remaining_eur ?? (totalBudget - periodCost)));
  const isOverBudget = Boolean(rawPlan.metadata?.is_over_budget ?? (periodCost > totalBudget));

  return {
    plan_id: String(rawPlan.plan_id || crypto.randomUUID()),
    generated_at: String(rawPlan.generated_at || new Date().toISOString()),
    user_id: String(rawPlan.user_id || ''),
    metadata: {
      period_budget_eur: round2(Number(rawPlan.metadata?.period_budget_eur ?? totalBudget)),
      period_cost_eur: round2(periodCost),
      budget_remaining_eur: budgetRemaining,
      is_over_budget: isOverBudget,
      generation_attempts: Number(rawPlan.metadata?.generation_attempts ?? 1),
      days: Number(rawPlan.metadata?.days ?? rawPlan.metadata?.days_count ?? profile.meal_plan_days),
    },
    days,
    plan_totals: {
      calories: Number(planTotals.calories || 0),
      protein_g: Number(planTotals.protein_g || 0),
      carbohydrates_g: Number(planTotals.carbohydrates_g || 0),
      fats_g: Number(planTotals.fats_g || 0),
      total_cost_eur: round2(Number(planTotals.total_cost_eur || 0)),
    },
  };
}

function generateShoppingListFromPlan(plan: FrontendMealPlan): FrontendShoppingList {
  const ingredientMap = new Map<string, { quantity: number; price: number; name: string; id: string }>();

  for (const day of plan.days) {
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

  const items: FrontendShoppingListItem[] = Array.from(ingredientMap.values()).map((data) => ({
    ingredient_id: data.id,
    display_name: data.name,
    total_quantity: round2(data.quantity),
    unit: 'g',
    minimum_purchase_quantity: 100,
    estimated_price_eur: round2(data.price),
  }));

  const totalShoppingCost = items.reduce((sum, item) => sum + item.estimated_price_eur, 0);

  return {
    plan_id: plan.plan_id,
    generated_at: new Date().toISOString(),
    items: items.sort((a, b) => a.display_name.localeCompare(b.display_name)),
    summary: {
      total_items: items.length,
      total_shopping_cost_eur: round2(totalShoppingCost),
      plan_cost_eur: round2(plan.plan_totals.total_cost_eur),
      waste_cost_eur: round2(Math.max(0, totalShoppingCost - plan.plan_totals.total_cost_eur)),
    },
  };
}

function calculateStreakFromProgress(dates: string[]) {
  const normalized = Array.from(new Set(dates)).filter(Boolean).sort();
  if (normalized.length === 0) return { current: 0, longest: 0, active: false };

  const dateSet = new Set(normalized);
  const today = new Date();
  const toYmd = (d: Date) => d.toISOString().slice(0, 10);
  const todayStr = toYmd(today);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = toYmd(yesterday);

  const isActive = dateSet.has(todayStr) || dateSet.has(yesterdayStr);

  // Longest streak
  let longest = 1;
  let currentRun = 1;
  for (let i = 1; i < normalized.length; i++) {
    const prev = new Date(normalized[i - 1]);
    const cur = new Date(normalized[i]);
    const diffDays = Math.round((cur.getTime() - prev.getTime()) / 86400000);
    if (diffDays === 1) {
      currentRun += 1;
      longest = Math.max(longest, currentRun);
    } else {
      currentRun = 1;
    }
  }

  // Current streak ending today
  let current = 0;
  let cursor = new Date(todayStr);
  while (dateSet.has(toYmd(cursor))) {
    current += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { current, longest, active: isActive };
}

async function handleGenerateMealPlan(req: Request, env: Env) {
  const { userId } = await verifySupabaseJwt(req, env);

  const profileRow = await supabaseSelectSingle<ProfileRow>(env, 'profiles', { user_id: userId }, '*');
  if (!profileRow) {
    return json(
      { error: 'profile_missing', message: 'No profile found for this user. Please complete onboarding.' },
      { status: 400 }
    );
  }

  const profile: UserProfile = {
    budget_eur: Number(profileRow.budget_eur),
    budget_period: profileRow.budget_period,
    meal_plan_days: profileRow.meal_plan_days,
    meals_per_day: profileRow.meals_per_day,
    dietary_preferences: profileRow.dietary_preferences || [],
    allergens: profileRow.allergens || [],
  };

  // TODO: Replace with AI-structure generation + deterministic engines.
  // For now, we always generate deterministically in the Worker (no frontend AI).
  const rawPlan = generateFallbackMealPlan(userId, profile);
  const plan = normalizePlanForFrontend(rawPlan as any, profile);
  const shoppingList = generateShoppingListFromPlan(plan);

  await supabaseUpsert(
    env,
    'meal_plans',
    {
      user_id: userId,
      plan_id: plan.plan_id,
      generated_at: plan.generated_at,
      days: plan.days,
      plan_totals: plan.plan_totals,
      metadata: plan.metadata,
      is_saved: false,
    },
    'user_id,plan_id'
  );

  // Persist normalized meals for analytics/search (optional table).
  for (const day of plan.days) {
    for (const meal of day.meals) {
      await supabaseUpsert(
        env,
        'meals',
        {
          user_id: userId,
          meal_id: meal.meal_id,
          plan_id: plan.plan_id,
          day_number: day.day_number,
          date: day.date,
          meal_type: meal.meal_type,
          recipe_name: meal.recipe_name,
          nutrition: meal.nutrition,
          cost_eur: meal.cost.meal_cost_eur,
          ingredients: meal.ingredients,
          cooking_instructions: meal.cooking_instructions || [],
        },
        'user_id,meal_id'
      );
    }
  }

  await supabaseUpsert(
    env,
    'shopping_lists',
    {
      user_id: userId,
      plan_id: plan.plan_id,
      items: shoppingList,
    },
    'user_id,plan_id'
  );

  return json(plan, { status: 200 });
}

async function handleGetMealPlans(req: Request, env: Env) {
  const { userId } = await verifySupabaseJwt(req, env);
  const url = new URL(req.url);
  const isSavedParam = url.searchParams.get('is_saved');
  const isSaved = isSavedParam === null ? null : isSavedParam === 'true';

  const query: Record<string, string> = { user_id: userId };
  if (isSaved !== null) query.is_saved = String(isSaved);

  const rows = await supabaseSelectMany<any>(env, 'meal_plans', query, '*', {
    order: { column: 'created_at', ascending: false },
    limit: 20,
  });

  const plans = (rows || []).map((p) => ({
    plan_id: p.plan_id,
    generated_at: p.generated_at,
    user_id: p.user_id,
    metadata: p.metadata,
    days: p.days,
    plan_totals: p.plan_totals,
  }));

  return json(plans, { status: 200 });
}

async function handleUpsertProgress(req: Request, env: Env) {
  const { userId } = await verifySupabaseJwt(req, env);
  const body = (await req.json().catch(() => null)) as Partial<DayProgress> | null;
  if (!body?.date) {
    return json({ error: 'invalid_request', message: 'Missing date' }, { status: 400 });
  }

  const progress: DayProgress = {
    date: String(body.date),
    completed_meals: Array.isArray(body.completed_meals) ? body.completed_meals : [],
    total_nutrition: (body.total_nutrition as any) || { calories: 0, protein_g: 0, carbohydrates_g: 0, fats_g: 0 },
    total_cost: Number(body.total_cost || 0),
    meals_count: Number(body.meals_count || 0),
  };

  await supabaseUpsert(
    env,
    'day_progress',
    {
      user_id: userId,
      date: progress.date,
      completed_meals: progress.completed_meals,
      total_nutrition: progress.total_nutrition,
      total_cost: progress.total_cost,
      meals_count: progress.meals_count,
    },
    'user_id,date'
  );

  // Maintain a simple streak snapshot.
  const progressRows = await supabaseSelectMany<any>(env, 'day_progress', { user_id: userId }, 'date', {
    order: { column: 'date', ascending: true },
    limit: 400,
  });
  const dates = (progressRows || []).map((r) => String(r.date));
  const streak = calculateStreakFromProgress(dates);

  await supabaseUpsert(
    env,
    'streaks',
    {
      user_id: userId,
      current_streak: streak.current,
      longest_streak: streak.longest,
      streak_active: streak.active,
      updated_at: new Date().toISOString(),
    },
    'user_id'
  );

  return json({ ok: true }, { status: 200 });
}

async function handleDeleteProgress(req: Request, env: Env) {
  const { userId } = await verifySupabaseJwt(req, env);
  const url = new URL(req.url);
  const date = url.searchParams.get('date');
  if (!date) {
    return json({ error: 'invalid_request', message: 'Missing date query param' }, { status: 400 });
  }

  await supabaseDelete(env, 'day_progress', { user_id: userId, date });
  return json({ ok: true }, { status: 200 });
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(req, env) });
    }

    const url = new URL(req.url);

    try {
      if (req.method === 'GET' && url.pathname === '/health') {
        return withCors(req, env, json({ ok: true }, { status: 200 }));
      }

      if (req.method === 'POST' && url.pathname === '/meal-plans/generate') {
        const res = await handleGenerateMealPlan(req, env);
        return withCors(req, env, res);
      }

      if (req.method === 'GET' && url.pathname === '/meal-plans') {
        const res = await handleGetMealPlans(req, env);
        return withCors(req, env, res);
      }

      if (req.method === 'POST' && url.pathname === '/progress') {
        const res = await handleUpsertProgress(req, env);
        return withCors(req, env, res);
      }

      if (req.method === 'DELETE' && url.pathname === '/progress') {
        const res = await handleDeleteProgress(req, env);
        return withCors(req, env, res);
      }

      return withCors(req, env, json({ error: 'not_found' }, { status: 404 }));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return withCors(req, env, json({ error: 'internal_error', message }, { status: 500 }));
    }
  },
};
