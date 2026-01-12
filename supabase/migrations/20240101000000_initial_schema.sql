-- Initial Database Schema for Meal Planning App
-- Migration: 20240101000000_initial_schema

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Profiles table: User preferences and meal planning settings
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meal plans table: Top-level meal plans
CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL,
  days INTEGER NOT NULL CHECK (days > 0),
  budget DECIMAL(10,2) NOT NULL CHECK (budget >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meals table: Individual meals within meal plans
CREATE TABLE IF NOT EXISTS meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE NOT NULL,
  day INTEGER NOT NULL CHECK (day > 0),
  type TEXT NOT NULL,
  calories INTEGER CHECK (calories >= 0),
  protein DECIMAL(8,2) CHECK (protein >= 0),
  carbs DECIMAL(8,2) CHECK (carbs >= 0),
  fats DECIMAL(8,2) CHECK (fats >= 0),
  cost DECIMAL(10,2) CHECK (cost >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shopping items table: Shopping list items for meal plans
CREATE TABLE IF NOT EXISTS shopping_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL,
  price DECIMAL(10,2) CHECK (price >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User progress table: Track completed meals
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  completed_meals JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_start_date ON meal_plans(user_id, start_date);
CREATE INDEX IF NOT EXISTS idx_meals_meal_plan_id ON meals(meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_meals_day ON meals(meal_plan_id, day);
CREATE INDEX IF NOT EXISTS idx_shopping_items_meal_plan_id ON shopping_items(meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_date ON user_progress(user_id, date);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" 
  ON profiles FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for meal_plans
CREATE POLICY "Users can view own meal plans" 
  ON meal_plans FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal plans" 
  ON meal_plans FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal plans" 
  ON meal_plans FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal plans" 
  ON meal_plans FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for meals
-- Users can only access meals from their own meal plans
CREATE POLICY "Users can view own meals" 
  ON meals FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM meal_plans 
      WHERE meal_plans.id = meals.meal_plan_id 
      AND meal_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own meals" 
  ON meals FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meal_plans 
      WHERE meal_plans.id = meals.meal_plan_id 
      AND meal_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own meals" 
  ON meals FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM meal_plans 
      WHERE meal_plans.id = meals.meal_plan_id 
      AND meal_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own meals" 
  ON meals FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM meal_plans 
      WHERE meal_plans.id = meals.meal_plan_id 
      AND meal_plans.user_id = auth.uid()
    )
  );

-- RLS Policies for shopping_items
-- Users can only access shopping items from their own meal plans
CREATE POLICY "Users can view own shopping items" 
  ON shopping_items FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM meal_plans 
      WHERE meal_plans.id = shopping_items.meal_plan_id 
      AND meal_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own shopping items" 
  ON shopping_items FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meal_plans 
      WHERE meal_plans.id = shopping_items.meal_plan_id 
      AND meal_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own shopping items" 
  ON shopping_items FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM meal_plans 
      WHERE meal_plans.id = shopping_items.meal_plan_id 
      AND meal_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own shopping items" 
  ON shopping_items FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM meal_plans 
      WHERE meal_plans.id = shopping_items.meal_plan_id 
      AND meal_plans.user_id = auth.uid()
    )
  );

-- RLS Policies for user_progress
CREATE POLICY "Users can view own progress" 
  ON user_progress FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" 
  ON user_progress FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" 
  ON user_progress FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress" 
  ON user_progress FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to tables with updated_at column
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at 
  BEFORE UPDATE ON meal_plans
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at 
  BEFORE UPDATE ON user_progress
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE profiles IS 'User profiles with meal planning preferences';
COMMENT ON TABLE meal_plans IS 'Meal plans with budget and duration settings';
COMMENT ON TABLE meals IS 'Individual meals with nutritional information';
COMMENT ON TABLE shopping_items IS 'Shopping list items for meal plans';
COMMENT ON TABLE user_progress IS 'User progress tracking for completed meals';

COMMENT ON COLUMN profiles.user_id IS 'References auth.users.id - enforces one profile per user';
COMMENT ON COLUMN profiles.preferences IS 'JSONB field for flexible preference storage (dietary restrictions, allergens, etc.)';
COMMENT ON COLUMN meal_plans.budget IS 'Budget in EUR for the entire meal plan period';
COMMENT ON COLUMN meal_plans.days IS 'Number of days covered by this meal plan';
COMMENT ON COLUMN meals.type IS 'Meal type: breakfast, lunch, dinner, snack, etc.';
COMMENT ON COLUMN user_progress.completed_meals IS 'JSONB array of completed meal IDs or meal details';
