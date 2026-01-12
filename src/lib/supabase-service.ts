import { supabase } from './supabase';
import type { 
  UserProfile, 
  MealPlan, 
  MealPreference, 
  MealPortionAdjustment,
  ScheduledDay,
  DayProgress,
  Badge,
  ShoppingList,
  MealPrepPlan
} from '@/types/domain';

export class SupabaseService {
  private static ensureSupabase() {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }
    return supabase;
  }

  static async getCurrentUser() {
    const client = this.ensureSupabase();
    const { data: { user }, error } = await client.auth.getUser();
    if (error) throw error;
    return user;
  }

  static async getUserProfile(): Promise<UserProfile | null> {
    const user = await this.getCurrentUser();
    if (!user) return null;

    const client = this.ensureSupabase();
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    if (!data) return null;

    const profile = data as any;

    return {
      budget_eur: Number(profile.budget_eur),
      budget_period: profile.budget_period as 'daily' | 'weekly',
      meal_plan_days: profile.meal_plan_days,
      meals_per_day: profile.meals_per_day,
      dietary_preferences: profile.dietary_preferences || [],
      allergens: profile.allergens || [],
      cuisine_preferences: [],
    };
  }

  static async saveUserProfile(profile: UserProfile): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const client = this.ensureSupabase();
    const { error } = await client
      .from('profiles')
      .upsert({
        user_id: user.id,
        meal_plan_days: profile.meal_plan_days,
        meals_per_day: profile.meals_per_day,
        budget_eur: profile.budget_eur,
        budget_period: profile.budget_period,
        dietary_preferences: profile.dietary_preferences,
        allergens: profile.allergens,
      } as any, {
        onConflict: 'user_id'
      });

    if (error) throw error;
  }

  static async getCurrentMealPlan(): Promise<MealPlan | null> {
    const user = await this.getCurrentUser();
    if (!user) return null;

    const client = this.ensureSupabase();
    const { data, error } = await client
      .from('meal_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_saved', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    if (!data) return null;

    const plan = data as any;

    return {
      plan_id: plan.plan_id,
      generated_at: plan.generated_at,
      user_id: plan.user_id,
      metadata: plan.metadata,
      days: plan.days,
      plan_totals: plan.plan_totals,
    };
  }

  static async saveMealPlan(mealPlan: MealPlan, isSaved: boolean = false): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const client = this.ensureSupabase();
    const { error } = await client
      .from('meal_plans')
      .upsert({
        user_id: user.id,
        plan_id: mealPlan.plan_id,
        generated_at: mealPlan.generated_at,
        days: mealPlan.days as any,
        plan_totals: mealPlan.plan_totals as any,
        metadata: mealPlan.metadata as any,
        is_saved: isSaved,
      } as any, {
        onConflict: 'user_id,plan_id'
      });

    if (error) throw error;
  }

  static async getSavedMealPlans(): Promise<MealPlan[]> {
    const user = await this.getCurrentUser();
    if (!user) return [];

    const client = this.ensureSupabase();
    const { data, error } = await client
      .from('meal_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_saved', true)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;

    return (data || []).map((item: any) => ({
      plan_id: item.plan_id,
      generated_at: item.generated_at,
      user_id: item.user_id,
      metadata: item.metadata,
      days: item.days,
      plan_totals: item.plan_totals,
    }));
  }

  static async deleteMealPlan(planId: string): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const client = this.ensureSupabase();
    const { error } = await client
      .from('meal_plans')
      .delete()
      .eq('user_id', user.id)
      .eq('plan_id', planId);

    if (error) throw error;
  }

  static async getMealPreferences(): Promise<MealPreference[]> {
    const user = await this.getCurrentUser();
    if (!user) return [];

    const client = this.ensureSupabase();
    const { data, error } = await client
      .from('meal_preferences')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;

    return (data || []).map((item: any) => ({
      meal_id: item.meal_id,
      recipe_name: item.recipe_name,
      meal_type: item.meal_type,
      preference: item.preference as 'like' | 'dislike',
      rated_at: item.rated_at,
      ingredients: item.ingredients || [],
    }));
  }

  static async saveMealPreference(preference: MealPreference): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const client = this.ensureSupabase();
    const { error } = await client
      .from('meal_preferences')
      .upsert({
        user_id: user.id,
        meal_id: preference.meal_id,
        recipe_name: preference.recipe_name,
        meal_type: preference.meal_type,
        preference: preference.preference,
        rated_at: preference.rated_at,
        ingredients: preference.ingredients,
      } as any, {
        onConflict: 'user_id,meal_id'
      });

    if (error) throw error;
  }

  static async deleteMealPreference(mealId: string): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const client = this.ensureSupabase();
    const { error } = await client
      .from('meal_preferences')
      .delete()
      .eq('user_id', user.id)
      .eq('meal_id', mealId);

    if (error) throw error;
  }

  static async getPortionAdjustments(): Promise<MealPortionAdjustment[]> {
    const user = await this.getCurrentUser();
    if (!user) return [];

    const client = this.ensureSupabase();
    const { data, error } = await client
      .from('portion_adjustments')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;

    return (data || []).map((item: any) => ({
      meal_id: item.meal_id,
      portion_multiplier: Number(item.portion_multiplier),
    }));
  }

  static async savePortionAdjustment(adjustment: MealPortionAdjustment): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const client = this.ensureSupabase();
    const { error } = await client
      .from('portion_adjustments')
      .upsert({
        user_id: user.id,
        meal_id: adjustment.meal_id,
        portion_multiplier: adjustment.portion_multiplier,
      } as any, {
        onConflict: 'user_id,meal_id'
      });

    if (error) throw error;
  }

  static async deletePortionAdjustment(mealId: string): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const client = this.ensureSupabase();
    const { error } = await client
      .from('portion_adjustments')
      .delete()
      .eq('user_id', user.id)
      .eq('meal_id', mealId);

    if (error) throw error;
  }

  static async getScheduledDays(): Promise<ScheduledDay[]> {
    const user = await this.getCurrentUser();
    if (!user) return [];

    const client = this.ensureSupabase();
    const { data, error } = await client
      .from('scheduled_days')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true });

    if (error) throw error;

    return (data || []).map((item: any) => ({
      date: item.date,
      day_number: item.day_number,
      plan_id: item.plan_id,
      scheduled_at: item.scheduled_at,
      meals: item.meals,
      total_nutrition: item.total_nutrition,
      total_cost: Number(item.total_cost),
      meals_count: item.meals_count,
      is_completed: item.is_completed,
    }));
  }

  static async saveScheduledDay(scheduledDay: ScheduledDay): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const client = this.ensureSupabase();
    const { error } = await client
      .from('scheduled_days')
      .upsert({
        user_id: user.id,
        date: scheduledDay.date,
        day_number: scheduledDay.day_number,
        plan_id: scheduledDay.plan_id,
        scheduled_at: scheduledDay.scheduled_at,
        meals: scheduledDay.meals as any,
        total_nutrition: scheduledDay.total_nutrition as any,
        total_cost: scheduledDay.total_cost,
        meals_count: scheduledDay.meals_count,
        is_completed: scheduledDay.is_completed,
      } as any, {
        onConflict: 'user_id,date'
      });

    if (error) throw error;
  }

  static async deleteScheduledDay(date: string): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const client = this.ensureSupabase();
    const { error } = await client
      .from('scheduled_days')
      .delete()
      .eq('user_id', user.id)
      .eq('date', date);

    if (error) throw error;
  }

  static async getDayProgress(): Promise<DayProgress[]> {
    const user = await this.getCurrentUser();
    if (!user) return [];

    const client = this.ensureSupabase();
    const { data, error } = await client
      .from('day_progress')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) throw error;

    return (data || []).map((item: any) => ({
      date: item.date,
      completed_meals: item.completed_meals,
      total_nutrition: item.total_nutrition,
      total_cost: Number(item.total_cost),
      meals_count: item.meals_count,
    }));
  }

  static async saveDayProgress(progress: DayProgress): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const client = this.ensureSupabase();
    const { error } = await client
      .from('day_progress')
      .upsert({
        user_id: user.id,
        date: progress.date,
        completed_meals: progress.completed_meals as any,
        total_nutrition: progress.total_nutrition as any,
        total_cost: progress.total_cost,
        meals_count: progress.meals_count,
      } as any, {
        onConflict: 'user_id,date'
      });

    if (error) throw error;
  }

  static async deleteDayProgress(date: string): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const client = this.ensureSupabase();
    const { error } = await client
      .from('day_progress')
      .delete()
      .eq('user_id', user.id)
      .eq('date', date);

    if (error) throw error;
  }

  static async getBadges(): Promise<Badge[]> {
    const user = await this.getCurrentUser();
    if (!user) return [];

    const client = this.ensureSupabase();
    const { data, error } = await client
      .from('badges')
      .select('*')
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((item: any) => ({
      badge_id: item.badge_id,
      month: item.month,
      year: item.year,
      earned_at: item.earned_at,
      completion_percentage: Number(item.completion_percentage),
      total_days_completed: item.total_days_completed,
      total_meals: item.total_meals,
      image_data_url: item.image_data_url,
    }));
  }

  static async saveBadge(badge: Badge): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const client = this.ensureSupabase();
    const { error } = await client
      .from('badges')
      .upsert({
        user_id: user.id,
        badge_id: badge.badge_id,
        month: badge.month,
        year: badge.year,
        earned_at: badge.earned_at,
        completion_percentage: badge.completion_percentage,
        total_days_completed: badge.total_days_completed,
        total_meals: badge.total_meals,
        image_data_url: badge.image_data_url || null,
      } as any, {
        onConflict: 'user_id,badge_id'
      });

    if (error) throw error;
  }

  static async getShoppingList(planId: string): Promise<ShoppingList | null> {
    const user = await this.getCurrentUser();
    if (!user) return null;

    const client = this.ensureSupabase();
    const { data, error } = await client
      .from('shopping_lists')
      .select('*')
      .eq('user_id', user.id)
      .eq('plan_id', planId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    const list = data as any;
    return list?.items || null;
  }

  static async saveShoppingList(planId: string, shoppingList: ShoppingList): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const client = this.ensureSupabase();
    const { error } = await client
      .from('shopping_lists')
      .upsert({
        user_id: user.id,
        plan_id: planId,
        items: shoppingList as any,
      } as any, {
        onConflict: 'user_id,plan_id'
      });

    if (error) throw error;
  }

  static async getMealPrepPlan(planId: string): Promise<MealPrepPlan | null> {
    const user = await this.getCurrentUser();
    if (!user) return null;

    const client = this.ensureSupabase();
    const { data, error } = await client
      .from('meal_prep_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('plan_id', planId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    if (!data) return null;

    const plan = data as any;

    return {
      plan_id: plan.plan_id,
      meal_plan_id: plan.plan_id,
      generated_at: plan.created_at,
      prep_schedule: plan.prep_sessions?.prep_schedule || [],
      batch_cooking_groups: plan.prep_sessions?.batch_cooking_groups || [],
      total_prep_time_minutes: plan.prep_sessions?.total_prep_time_minutes || 0,
      total_efficiency_savings: plan.prep_sessions?.total_efficiency_savings || { time_saved_minutes: 0, cost_saved_eur: 0 },
      storage_requirements: plan.prep_sessions?.storage_requirements || { containers_needed: 0, fridge_space: 'medium', freezer_space: 'none' },
      tips: plan.tips || [],
    };
  }

  static async saveMealPrepPlan(prepPlan: MealPrepPlan): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const prepSessionsData = {
      prep_schedule: prepPlan.prep_schedule,
      batch_cooking_groups: prepPlan.batch_cooking_groups,
      total_prep_time_minutes: prepPlan.total_prep_time_minutes,
      total_efficiency_savings: prepPlan.total_efficiency_savings,
      storage_requirements: prepPlan.storage_requirements,
    };

    const client = this.ensureSupabase();
    const { error } = await client
      .from('meal_prep_plans')
      .upsert({
        user_id: user.id,
        plan_id: prepPlan.plan_id,
        prep_sessions: prepSessionsData as any,
        tips: prepPlan.tips,
      } as any, {
        onConflict: 'user_id,plan_id'
      });

    if (error) throw error;
  }

  static async deleteAllUserData(): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const client = this.ensureSupabase();
    await Promise.all([
      client.from('profiles').delete().eq('user_id', user.id),
      client.from('meal_plans').delete().eq('user_id', user.id),
      client.from('meal_preferences').delete().eq('user_id', user.id),
      client.from('portion_adjustments').delete().eq('user_id', user.id),
      client.from('scheduled_days').delete().eq('user_id', user.id),
      client.from('day_progress').delete().eq('user_id', user.id),
      client.from('badges').delete().eq('user_id', user.id),
      client.from('shopping_lists').delete().eq('user_id', user.id),
      client.from('meal_prep_plans').delete().eq('user_id', user.id),
    ]);
  }
}
