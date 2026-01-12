# Migration Verification Checklist

Use this checklist to verify that the database schema was applied correctly.

## ✅ Pre-Migration Checklist

Before applying the migration:

- [ ] Supabase project created
- [ ] Project is fully provisioned (not "Setting up project...")
- [ ] Supabase URL and anon key obtained
- [ ] `.env` file created with credentials
- [ ] Migration file copied and ready to run

## ✅ Apply Migration

### Using Supabase Dashboard

- [ ] Navigate to SQL Editor
- [ ] Create new query
- [ ] Copy entire contents of `migrations/20240101000000_initial_schema.sql`
- [ ] Paste into SQL Editor
- [ ] Click "Run" or press Ctrl/Cmd + Enter
- [ ] See "Success. No rows returned" message

### Using Supabase CLI

- [ ] Supabase CLI installed (`npm install -g supabase`)
- [ ] Logged in (`supabase login`)
- [ ] Project linked (`supabase link`)
- [ ] Migration pushed (`supabase db push`)
- [ ] No error messages displayed

## ✅ Post-Migration Verification

### 1. Check Tables

Navigate to **Table Editor** in Supabase dashboard:

- [ ] `profiles` table exists
- [ ] `meal_plans` table exists
- [ ] `meals` table exists
- [ ] `shopping_items` table exists
- [ ] `user_progress` table exists

**Total: 5 tables should be visible**

### 2. Verify Table Structure

Click on each table and verify columns:

#### profiles
- [ ] `id` (uuid, primary key)
- [ ] `user_id` (uuid, foreign key)
- [ ] `name` (text)
- [ ] `preferences` (jsonb)
- [ ] `created_at` (timestamptz)
- [ ] `updated_at` (timestamptz)

#### meal_plans
- [ ] `id` (uuid, primary key)
- [ ] `user_id` (uuid, foreign key)
- [ ] `start_date` (date)
- [ ] `days` (int4)
- [ ] `budget` (numeric)
- [ ] `created_at` (timestamptz)
- [ ] `updated_at` (timestamptz)

#### meals
- [ ] `id` (uuid, primary key)
- [ ] `meal_plan_id` (uuid, foreign key)
- [ ] `day` (int4)
- [ ] `type` (text)
- [ ] `calories` (int4)
- [ ] `protein` (numeric)
- [ ] `carbs` (numeric)
- [ ] `fats` (numeric)
- [ ] `cost` (numeric)
- [ ] `created_at` (timestamptz)

#### shopping_items
- [ ] `id` (uuid, primary key)
- [ ] `meal_plan_id` (uuid, foreign key)
- [ ] `name` (text)
- [ ] `quantity` (numeric)
- [ ] `unit` (text)
- [ ] `price` (numeric)
- [ ] `created_at` (timestamptz)

#### user_progress
- [ ] `id` (uuid, primary key)
- [ ] `user_id` (uuid, foreign key)
- [ ] `date` (date)
- [ ] `completed_meals` (jsonb)
- [ ] `created_at` (timestamptz)
- [ ] `updated_at` (timestamptz)

### 3. Check Row Level Security (RLS)

For each table, verify RLS is enabled:

- [ ] `profiles` - RLS enabled (🔒 icon visible)
- [ ] `meal_plans` - RLS enabled (🔒 icon visible)
- [ ] `meals` - RLS enabled (🔒 icon visible)
- [ ] `shopping_items` - RLS enabled (🔒 icon visible)
- [ ] `user_progress` - RLS enabled (🔒 icon visible)

### 4. Verify RLS Policies

Navigate to **Database** → **Policies** in Supabase dashboard:

#### profiles policies
- [ ] "Users can view own profile" (SELECT)
- [ ] "Users can insert own profile" (INSERT)
- [ ] "Users can update own profile" (UPDATE)
- [ ] "Users can delete own profile" (DELETE)

#### meal_plans policies
- [ ] "Users can view own meal plans" (SELECT)
- [ ] "Users can insert own meal plans" (INSERT)
- [ ] "Users can update own meal plans" (UPDATE)
- [ ] "Users can delete own meal plans" (DELETE)

#### meals policies
- [ ] "Users can view own meals" (SELECT)
- [ ] "Users can insert own meals" (INSERT)
- [ ] "Users can update own meals" (UPDATE)
- [ ] "Users can delete own meals" (DELETE)

#### shopping_items policies
- [ ] "Users can view own shopping items" (SELECT)
- [ ] "Users can insert own shopping items" (INSERT)
- [ ] "Users can update own shopping items" (UPDATE)
- [ ] "Users can delete own shopping items" (DELETE)

#### user_progress policies
- [ ] "Users can view own progress" (SELECT)
- [ ] "Users can insert own progress" (INSERT)
- [ ] "Users can update own progress" (UPDATE)
- [ ] "Users can delete own progress" (DELETE)

**Total: 20 policies should exist (4 per table)**

### 5. Check Indexes

Run this SQL query in SQL Editor:

```sql
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'meal_plans', 'meals', 'shopping_items', 'user_progress')
ORDER BY tablename, indexname;
```

Verify these indexes exist:

- [ ] `idx_profiles_user_id`
- [ ] `idx_meal_plans_user_id`
- [ ] `idx_meal_plans_start_date`
- [ ] `idx_meals_meal_plan_id`
- [ ] `idx_meals_day`
- [ ] `idx_shopping_items_meal_plan_id`
- [ ] `idx_user_progress_user_id`
- [ ] `idx_user_progress_date`

**Total: 8 indexes should exist**

### 6. Check Triggers

Run this SQL query:

```sql
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

Verify these triggers exist:

- [ ] `update_profiles_updated_at` on `profiles`
- [ ] `update_meal_plans_updated_at` on `meal_plans`
- [ ] `update_user_progress_updated_at` on `user_progress`

**Total: 3 triggers should exist**

### 7. Test Basic Operations

Run these SQL queries to test basic functionality:

#### Test 1: Check auth function
```sql
SELECT auth.uid() as my_user_id;
```
- [ ] Query runs without error
- [ ] Returns NULL (if not authenticated) or UUID (if authenticated)

#### Test 2: Create test profile (requires authentication)
```sql
INSERT INTO profiles (user_id, name, preferences)
VALUES (
  auth.uid(),
  'Test User',
  '{"test": true}'::jsonb
)
RETURNING *;
```
- [ ] Query succeeds if authenticated
- [ ] Query fails with RLS error if not authenticated

#### Test 3: Select profiles
```sql
SELECT * FROM profiles;
```
- [ ] Query runs without error
- [ ] Returns only your profile (if you created one)
- [ ] Returns empty if you haven't created a profile yet

#### Test 4: Check foreign key constraints
```sql
-- This should fail with foreign key constraint error
INSERT INTO meals (meal_plan_id, day, type, calories, protein, carbs, fats, cost)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  1,
  'breakfast',
  400,
  15,
  45,
  12,
  3.50
);
```
- [ ] Query fails with foreign key violation error
- [ ] Error message mentions `meal_plans` table

#### Test 5: Test JSONB field
```sql
SELECT preferences FROM profiles LIMIT 1;
```
- [ ] Query returns valid JSONB
- [ ] JSONB is formatted properly

### 8. Test Cascading Deletes

```sql
-- Create test data
BEGIN;

-- Insert meal plan
INSERT INTO meal_plans (user_id, start_date, days, budget)
VALUES (auth.uid(), CURRENT_DATE, 7, 50.00)
RETURNING id;

-- Copy the returned ID and use it below
-- Insert meal
INSERT INTO meals (meal_plan_id, day, type, calories, protein, carbs, fats, cost)
VALUES ('paste-meal-plan-id-here', 1, 'breakfast', 400, 15, 45, 12, 3.50);

-- Insert shopping item
INSERT INTO shopping_items (meal_plan_id, name, quantity, unit, price)
VALUES ('paste-meal-plan-id-here', 'Test Item', 1, 'kg', 5.00);

-- Now delete the meal plan
DELETE FROM meal_plans WHERE id = 'paste-meal-plan-id-here';

-- Check that meals and shopping_items were also deleted
SELECT COUNT(*) as meals_count FROM meals WHERE meal_plan_id = 'paste-meal-plan-id-here';
SELECT COUNT(*) as items_count FROM shopping_items WHERE meal_plan_id = 'paste-meal-plan-id-here';

ROLLBACK; -- Don't actually commit the test
```

- [ ] Meal plan deleted successfully
- [ ] Meals count = 0 (cascaded delete worked)
- [ ] Shopping items count = 0 (cascaded delete worked)

## ✅ Application Integration

### Environment Setup

- [ ] `.env` file exists in project root
- [ ] `VITE_SUPABASE_URL` set correctly
- [ ] `VITE_SUPABASE_ANON_KEY` set correctly
- [ ] Development server restarted after creating `.env`

### Basic App Test

- [ ] App loads without Supabase errors
- [ ] Can sign up for new account
- [ ] User appears in Authentication → Users
- [ ] Can log in with credentials
- [ ] Can create profile/meal plan
- [ ] Data appears in Table Editor
- [ ] Can log out successfully

### RLS Security Test

- [ ] Create data with User A
- [ ] Log out and log in as User B
- [ ] User B cannot see User A's data
- [ ] User B can create their own data
- [ ] Both users' data is isolated

## 🎉 Migration Complete!

If all checkboxes above are checked, your Supabase database is properly configured!

## 🐛 Issues Found?

If any checks failed, try these steps:

1. **Tables missing**: Re-run the migration SQL
2. **RLS not enabled**: Check migration output for errors
3. **Policies missing**: Re-run the migration SQL
4. **Indexes missing**: Re-run the migration SQL
5. **Triggers not working**: Check PostgreSQL version (should be 14+)
6. **Foreign keys not working**: Verify table creation order in migration

### Re-running the Migration

If you need to start over:

```sql
-- DANGER: This deletes all tables and data!
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS shopping_items CASCADE;
DROP TABLE IF EXISTS meals CASCADE;
DROP TABLE IF EXISTS meal_plans CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Then re-run the migration SQL
```

## 📞 Need Help?

- 📖 Check [SETUP.md](./SETUP.md) for detailed instructions
- 🔍 Review [README.md](./README.md) for schema documentation
- 💬 Ask in [Supabase Discord](https://discord.supabase.com)

---

**All checks passed?** You're ready to build! 🚀
