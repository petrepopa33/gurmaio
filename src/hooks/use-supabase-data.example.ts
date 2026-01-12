/**
 * Example: Integrating User Profile with Supabase
 * 
 * This file shows a complete example of how to replace useKV with Supabase
 * for the user profile feature. Use this as a template for other features.
 */

import { useState, useEffect } from 'react';
import { SupabaseService } from '@/lib/supabase-service';
import type { UserProfile } from '@/types/domain';
import { toast } from 'sonner';

export function useUserProfile() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const profile = await SupabaseService.getUserProfile();
      setUserProfile(profile);
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async (profile: UserProfile) => {
    try {
      await SupabaseService.saveUserProfile(profile);
      setUserProfile(profile);
      toast.success('Profile saved successfully');
    } catch (err) {
      console.error('Failed to save profile:', err);
      toast.error('Failed to save profile');
      throw err;
    }
  };

  return {
    userProfile,
    isLoading,
    error,
    saveProfile,
    reloadProfile: loadProfile,
  };
}

/**
 * Usage in App.tsx:
 * 
 * // OLD:
 * const [userProfile, setUserProfile] = useKV<UserProfile | null>('user_profile', null);
 * 
 * // NEW:
 * const { userProfile, isLoading: profileLoading, saveProfile } = useUserProfile();
 * 
 * // When saving:
 * // OLD:
 * setUserProfile(() => newProfile);
 * 
 * // NEW:
 * await saveProfile(newProfile);
 */

/**
 * Example: Integrating Meal Plans with Supabase
 */

export function useMealPlans() {
  const [currentPlan, setCurrentPlan] = useState<any | null>(null);
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setIsLoading(true);
      const [current, saved] = await Promise.all([
        SupabaseService.getCurrentMealPlan(),
        SupabaseService.getSavedMealPlans(),
      ]);
      setCurrentPlan(current);
      setSavedPlans(saved);
    } catch (err) {
      console.error('Failed to load plans:', err);
      toast.error('Failed to load meal plans');
    } finally {
      setIsLoading(false);
    }
  };

  const savePlan = async (plan: any, isSaved: boolean = false) => {
    try {
      await SupabaseService.saveMealPlan(plan, isSaved);
      if (isSaved) {
        setSavedPlans(current => [...current, plan]);
        toast.success('Meal plan saved!');
      } else {
        setCurrentPlan(plan);
      }
    } catch (err) {
      console.error('Failed to save plan:', err);
      toast.error('Failed to save meal plan');
      throw err;
    }
  };

  const deletePlan = async (planId: string) => {
    try {
      await SupabaseService.deleteMealPlan(planId);
      setSavedPlans(current => current.filter(p => p.plan_id !== planId));
      toast.success('Meal plan deleted');
    } catch (err) {
      console.error('Failed to delete plan:', err);
      toast.error('Failed to delete meal plan');
      throw err;
    }
  };

  return {
    currentPlan,
    savedPlans,
    isLoading,
    savePlan,
    deletePlan,
    reloadPlans: loadPlans,
  };
}

/**
 * Example: Integrating Meal Preferences with Supabase
 */

export function useMealPreferences() {
  const [preferences, setPreferences] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      const prefs = await SupabaseService.getMealPreferences();
      setPreferences(prefs);
    } catch (err) {
      console.error('Failed to load preferences:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const savePreference = async (preference: any) => {
    try {
      await SupabaseService.saveMealPreference(preference);
      
      // Update local state
      setPreferences(current => {
        const existing = current.findIndex(p => p.meal_id === preference.meal_id);
        if (existing >= 0) {
          const updated = [...current];
          updated[existing] = preference;
          return updated;
        }
        return [...current, preference];
      });
    } catch (err) {
      console.error('Failed to save preference:', err);
      toast.error('Failed to save preference');
      throw err;
    }
  };

  const removePreference = async (mealId: string) => {
    try {
      await SupabaseService.deleteMealPreference(mealId);
      setPreferences(current => current.filter(p => p.meal_id !== mealId));
      toast.info('Preference removed');
    } catch (err) {
      console.error('Failed to remove preference:', err);
      toast.error('Failed to remove preference');
      throw err;
    }
  };

  return {
    preferences,
    isLoading,
    savePreference,
    removePreference,
    reloadPreferences: loadPreferences,
  };
}

/**
 * General Pattern for Migration:
 * 
 * 1. Create a custom hook for the feature
 * 2. Use useState for local state
 * 3. Use useEffect to load data on mount
 * 4. Create async functions for mutations
 * 5. Update local state after successful Supabase calls
 * 6. Show toast notifications for user feedback
 * 7. Handle errors gracefully
 * 
 * Benefits:
 * - Separation of concerns
 * - Reusable hooks
 * - Centralized error handling
 * - Consistent loading states
 * - Easy to test
 */
