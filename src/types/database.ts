export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          meal_plan_days: number
          meals_per_day: number
          budget_eur: number
          budget_period: string
          dietary_preferences: string[]
          allergens: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          meal_plan_days: number
          meals_per_day: number
          budget_eur: number
          budget_period: string
          dietary_preferences: string[]
          allergens: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          meal_plan_days?: number
          meals_per_day?: number
          budget_eur?: number
          budget_period?: string
          dietary_preferences?: string[]
          allergens?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      meal_plans: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          generated_at: string
          days: Json
          plan_totals: Json
          metadata: Json
          is_saved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          generated_at: string
          days: Json
          plan_totals: Json
          metadata: Json
          is_saved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          generated_at?: string
          days?: Json
          plan_totals?: Json
          metadata?: Json
          is_saved?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      meal_preferences: {
        Row: {
          id: string
          user_id: string
          meal_id: string
          recipe_name: string
          meal_type: string
          preference: string
          rated_at: string
          ingredients: string[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          meal_id: string
          recipe_name: string
          meal_type: string
          preference: string
          rated_at: string
          ingredients: string[]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          meal_id?: string
          recipe_name?: string
          meal_type?: string
          preference?: string
          rated_at?: string
          ingredients?: string[]
          created_at?: string
        }
      }
      portion_adjustments: {
        Row: {
          id: string
          user_id: string
          meal_id: string
          portion_multiplier: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          meal_id: string
          portion_multiplier: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          meal_id?: string
          portion_multiplier?: number
          created_at?: string
          updated_at?: string
        }
      }
      scheduled_days: {
        Row: {
          id: string
          user_id: string
          date: string
          day_number: number
          plan_id: string
          scheduled_at: string
          meals: Json
          total_nutrition: Json
          total_cost: number
          meals_count: number
          is_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          day_number: number
          plan_id: string
          scheduled_at: string
          meals: Json
          total_nutrition: Json
          total_cost: number
          meals_count: number
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          day_number?: number
          plan_id?: string
          scheduled_at?: string
          meals?: Json
          total_nutrition?: Json
          total_cost?: number
          meals_count?: number
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      day_progress: {
        Row: {
          id: string
          user_id: string
          date: string
          completed_meals: Json
          total_nutrition: Json
          total_cost: number
          meals_count: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          completed_meals: Json
          total_nutrition: Json
          total_cost: number
          meals_count: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          completed_meals?: Json
          total_nutrition?: Json
          total_cost?: number
          meals_count?: number
          created_at?: string
        }
      }
      badges: {
        Row: {
          id: string
          user_id: string
          badge_id: string
          month: string
          year: number
          earned_at: string
          completion_percentage: number
          total_days_completed: number
          total_meals: number
          image_data_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_id: string
          month: string
          year: number
          earned_at: string
          completion_percentage: number
          total_days_completed: number
          total_meals: number
          image_data_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_id?: string
          month?: string
          year?: number
          earned_at?: string
          completion_percentage?: number
          total_days_completed?: number
          total_meals?: number
          image_data_url?: string | null
          created_at?: string
        }
      }
      shopping_lists: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          items: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          items: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          items?: Json
          created_at?: string
          updated_at?: string
        }
      }
      meal_prep_plans: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          prep_sessions: Json
          tips: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          prep_sessions: Json
          tips: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          prep_sessions?: Json
          tips?: string[]
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
