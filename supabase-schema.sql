-- Gurmaio Database Schema for Supabase
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  meal_plan_days INTEGER NOT NULL,
  meals_per_day INTEGER NOT NULL,
  budget_eur DECIMAL(10,2) NOT NULL,
  budget_period TEXT NOT NULL,
  dietary_preferences TEXT[] NOT NULL DEFAULT '{}',
  allergens TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Meal plans table
CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL,
  days JSONB NOT NULL,
  plan_totals JSONB NOT NULL,
  metadata JSONB NOT NULL,
  is_saved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, plan_id)
);

-- Meal preferences table
CREATE TABLE IF NOT EXISTS meal_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  meal_id TEXT NOT NULL,
  recipe_name TEXT NOT NULL,
  meal_type TEXT NOT NULL,
  preference TEXT NOT NULL CHECK (preference IN ('like', 'dislike')),
  rated_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ingredients TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, meal_id)
);

-- Portion adjustments table
CREATE TABLE IF NOT EXISTS portion_adjustments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  meal_id TEXT NOT NULL,
  portion_multiplier DECIMAL(3,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, meal_id)
);

-- Scheduled days table
CREATE TABLE IF NOT EXISTS scheduled_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  day_number INTEGER NOT NULL,
  plan_id TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  meals JSONB NOT NULL,
  total_nutrition JSONB NOT NULL,
  total_cost DECIMAL(10,2) NOT NULL,
  meals_count INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Day progress table
CREATE TABLE IF NOT EXISTS day_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  completed_meals JSONB NOT NULL,
  total_nutrition JSONB NOT NULL,
  total_cost DECIMAL(10,2) NOT NULL,
  meals_count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_id TEXT NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completion_percentage DECIMAL(5,2) NOT NULL,
  total_days_completed INTEGER NOT NULL,
  total_meals INTEGER NOT NULL,
  image_data_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Shopping lists table
CREATE TABLE IF NOT EXISTS shopping_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id TEXT NOT NULL,
  items JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, plan_id)
);

-- Meal prep plans table
CREATE TABLE IF NOT EXISTS meal_prep_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id TEXT NOT NULL,
  prep_sessions JSONB NOT NULL,
  tips TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, plan_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_is_saved ON meal_plans(user_id, is_saved);
CREATE INDEX IF NOT EXISTS idx_meal_preferences_user_id ON meal_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_portion_adjustments_user_id ON portion_adjustments(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_days_user_id ON scheduled_days(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_days_date ON scheduled_days(user_id, date);
CREATE INDEX IF NOT EXISTS idx_day_progress_user_id ON day_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_day_progress_date ON day_progress(user_id, date);
CREATE INDEX IF NOT EXISTS idx_badges_user_id ON badges(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_user_id ON shopping_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_prep_plans_user_id ON meal_prep_plans(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE portion_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE day_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_prep_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON profiles
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for meal_plans
CREATE POLICY "Users can view own meal plans" ON meal_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal plans" ON meal_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal plans" ON meal_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal plans" ON meal_plans
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for meal_preferences
CREATE POLICY "Users can view own meal preferences" ON meal_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal preferences" ON meal_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal preferences" ON meal_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal preferences" ON meal_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for portion_adjustments
CREATE POLICY "Users can view own portion adjustments" ON portion_adjustments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own portion adjustments" ON portion_adjustments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portion adjustments" ON portion_adjustments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own portion adjustments" ON portion_adjustments
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for scheduled_days
CREATE POLICY "Users can view own scheduled days" ON scheduled_days
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scheduled days" ON scheduled_days
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scheduled days" ON scheduled_days
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scheduled days" ON scheduled_days
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for day_progress
CREATE POLICY "Users can view own day progress" ON day_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own day progress" ON day_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own day progress" ON day_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own day progress" ON day_progress
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for badges
CREATE POLICY "Users can view own badges" ON badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges" ON badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own badges" ON badges
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own badges" ON badges
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for shopping_lists
CREATE POLICY "Users can view own shopping lists" ON shopping_lists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shopping lists" ON shopping_lists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shopping lists" ON shopping_lists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shopping lists" ON shopping_lists
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for meal_prep_plans
CREATE POLICY "Users can view own meal prep plans" ON meal_prep_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal prep plans" ON meal_prep_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal prep plans" ON meal_prep_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal prep plans" ON meal_prep_plans
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at BEFORE UPDATE ON meal_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portion_adjustments_updated_at BEFORE UPDATE ON portion_adjustments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_days_updated_at BEFORE UPDATE ON scheduled_days
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopping_lists_updated_at BEFORE UPDATE ON shopping_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_prep_plans_updated_at BEFORE UPDATE ON meal_prep_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
