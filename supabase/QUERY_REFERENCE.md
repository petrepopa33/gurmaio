# Database Schema Quick Reference

Quick reference for developers working with the Supabase database schema.

## Table Structure at a Glance

```
┌─────────────────┐
│   auth.users    │ (Managed by Supabase Auth)
└────────┬────────┘
         │
    ┌────┴─────┬──────────────┬──────────────┐
    │          │              │              │
    ▼          ▼              ▼              ▼
┌─────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐
│profiles │ │meal_plans│ │user_prog-│ │  (future   │
│         │ │          │ │  ress    │ │   tables)  │
└─────────┘ └────┬─────┘ └──────────┘ └────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
    ┌───────┐      ┌──────────────┐
    │ meals │      │shopping_items│
    └───────┘      └──────────────┘
```

## Common Query Patterns

### User Profile

```sql
-- Get user profile
SELECT * FROM profiles WHERE user_id = auth.uid();

-- Create profile
INSERT INTO profiles (user_id, name, preferences)
VALUES (
  auth.uid(),
  'John Doe',
  '{"dietary_restrictions": ["vegetarian"], "allergens": ["nuts"]}'::jsonb
);

-- Update profile
UPDATE profiles 
SET name = 'Jane Doe', preferences = '{"dietary_restrictions": ["vegan"]}'::jsonb
WHERE user_id = auth.uid();
```

### Meal Plans

```sql
-- Get all meal plans for user
SELECT * FROM meal_plans 
WHERE user_id = auth.uid()
ORDER BY start_date DESC;

-- Get meal plans with meal count
SELECT 
  mp.*,
  COUNT(m.id) as meal_count
FROM meal_plans mp
LEFT JOIN meals m ON m.meal_plan_id = mp.id
WHERE mp.user_id = auth.uid()
GROUP BY mp.id;

-- Create meal plan
INSERT INTO meal_plans (user_id, start_date, days, budget)
VALUES (auth.uid(), '2024-01-15', 7, 50.00)
RETURNING id;

-- Delete meal plan (cascades to meals and shopping items)
DELETE FROM meal_plans WHERE id = 'uuid-here' AND user_id = auth.uid();
```

### Meals

```sql
-- Get all meals for a meal plan
SELECT * FROM meals
WHERE meal_plan_id = 'uuid-here'
ORDER BY day, type;

-- Get meals grouped by day
SELECT 
  day,
  COUNT(*) as meal_count,
  SUM(calories) as total_calories,
  SUM(cost) as total_cost
FROM meals
WHERE meal_plan_id = 'uuid-here'
GROUP BY day
ORDER BY day;

-- Add meal to plan
INSERT INTO meals (meal_plan_id, day, type, calories, protein, carbs, fats, cost)
VALUES (
  'meal-plan-uuid',
  1,
  'breakfast',
  400,
  15.5,
  45.0,
  12.0,
  3.50
);

-- Get nutritional totals for entire plan
SELECT
  SUM(calories) as total_calories,
  SUM(protein) as total_protein,
  SUM(carbs) as total_carbs,
  SUM(fats) as total_fats,
  SUM(cost) as total_cost
FROM meals
WHERE meal_plan_id = 'uuid-here';
```

### Shopping Items

```sql
-- Get shopping list for meal plan
SELECT * FROM shopping_items
WHERE meal_plan_id = 'uuid-here'
ORDER BY name;

-- Get shopping list with total cost
SELECT 
  name,
  quantity,
  unit,
  price,
  (quantity * price) as subtotal
FROM shopping_items
WHERE meal_plan_id = 'uuid-here';

-- Add shopping item
INSERT INTO shopping_items (meal_plan_id, name, quantity, unit, price)
VALUES (
  'meal-plan-uuid',
  'Chicken breast',
  1.5,
  'kg',
  8.99
);

-- Bulk insert shopping items
INSERT INTO shopping_items (meal_plan_id, name, quantity, unit, price)
VALUES 
  ('meal-plan-uuid', 'Rice', 2, 'kg', 3.50),
  ('meal-plan-uuid', 'Tomatoes', 1, 'kg', 2.99),
  ('meal-plan-uuid', 'Olive oil', 0.5, 'L', 6.99);
```

### User Progress

```sql
-- Get today's progress
SELECT * FROM user_progress
WHERE user_id = auth.uid() 
AND date = CURRENT_DATE;

-- Record completed meals
INSERT INTO user_progress (user_id, date, completed_meals)
VALUES (
  auth.uid(),
  CURRENT_DATE,
  '[
    {"meal_id": "uuid", "type": "breakfast", "completed_at": "2024-01-15T08:30:00Z"},
    {"meal_id": "uuid", "type": "lunch", "completed_at": "2024-01-15T13:00:00Z"}
  ]'::jsonb
)
ON CONFLICT (user_id, date) DO UPDATE
SET completed_meals = EXCLUDED.completed_meals;

-- Get progress for date range
SELECT * FROM user_progress
WHERE user_id = auth.uid()
AND date BETWEEN '2024-01-01' AND '2024-01-31'
ORDER BY date;

-- Count completed meals by month
SELECT 
  DATE_TRUNC('month', date) as month,
  COUNT(*) as days_with_progress,
  SUM(jsonb_array_length(completed_meals)) as total_meals_completed
FROM user_progress
WHERE user_id = auth.uid()
GROUP BY DATE_TRUNC('month', date)
ORDER BY month DESC;
```

## Complex Queries

### Complete Meal Plan with All Details

```sql
SELECT 
  mp.id,
  mp.start_date,
  mp.days,
  mp.budget,
  COUNT(DISTINCT m.id) as total_meals,
  COUNT(DISTINCT si.id) as shopping_items_count,
  SUM(m.cost) as estimated_cost,
  SUM(m.calories) as total_calories
FROM meal_plans mp
LEFT JOIN meals m ON m.meal_plan_id = mp.id
LEFT JOIN shopping_items si ON si.meal_plan_id = mp.id
WHERE mp.user_id = auth.uid()
GROUP BY mp.id, mp.start_date, mp.days, mp.budget
ORDER BY mp.start_date DESC;
```

### User Statistics

```sql
SELECT 
  COUNT(DISTINCT mp.id) as total_meal_plans,
  COUNT(DISTINCT m.id) as total_meals_planned,
  COUNT(DISTINCT up.date) as days_tracked,
  AVG(mp.budget) as avg_budget,
  SUM(m.cost) as total_spent
FROM profiles p
LEFT JOIN meal_plans mp ON mp.user_id = p.user_id
LEFT JOIN meals m ON m.meal_plan_id = mp.id
LEFT JOIN user_progress up ON up.user_id = p.user_id
WHERE p.user_id = auth.uid();
```

### Budget Compliance Check

```sql
SELECT 
  mp.id,
  mp.budget,
  SUM(m.cost) as actual_cost,
  mp.budget - SUM(m.cost) as remaining_budget,
  CASE 
    WHEN SUM(m.cost) > mp.budget THEN 'Over Budget'
    WHEN SUM(m.cost) <= mp.budget * 0.9 THEN 'Under Budget'
    ELSE 'On Budget'
  END as status
FROM meal_plans mp
LEFT JOIN meals m ON m.meal_plan_id = mp.id
WHERE mp.user_id = auth.uid()
GROUP BY mp.id, mp.budget;
```

## JSONB Operations

### Working with `preferences` in profiles

```sql
-- Get users with specific dietary restriction
SELECT * FROM profiles
WHERE preferences @> '{"dietary_restrictions": ["vegetarian"]}'::jsonb
AND user_id = auth.uid();

-- Update specific preference key
UPDATE profiles
SET preferences = jsonb_set(
  preferences,
  '{dietary_restrictions}',
  '["vegan", "gluten-free"]'::jsonb
)
WHERE user_id = auth.uid();

-- Add to preferences
UPDATE profiles
SET preferences = preferences || '{"new_key": "new_value"}'::jsonb
WHERE user_id = auth.uid();

-- Remove key from preferences
UPDATE profiles
SET preferences = preferences - 'key_to_remove'
WHERE user_id = auth.uid();
```

### Working with `completed_meals` in user_progress

```sql
-- Count completed meals for a day
SELECT 
  date,
  jsonb_array_length(completed_meals) as meals_completed
FROM user_progress
WHERE user_id = auth.uid();

-- Get specific meal from completed_meals array
SELECT 
  date,
  jsonb_array_elements(completed_meals) as meal
FROM user_progress
WHERE user_id = auth.uid();

-- Check if specific meal type was completed
SELECT * FROM user_progress
WHERE user_id = auth.uid()
AND completed_meals @> '[{"type": "breakfast"}]'::jsonb;
```

## Useful PostgreSQL Functions

```sql
-- Current timestamp
SELECT NOW();

-- Current date
SELECT CURRENT_DATE;

-- Get authenticated user ID
SELECT auth.uid();

-- Date arithmetic
SELECT CURRENT_DATE + INTERVAL '7 days';
SELECT CURRENT_DATE - INTERVAL '1 month';

-- Generate UUID
SELECT uuid_generate_v4();

-- JSONB array length
SELECT jsonb_array_length('[1,2,3]'::jsonb); -- Returns 3

-- Extract JSONB field
SELECT preferences->>'dietary_restrictions' FROM profiles;
```

## Performance Tips

1. **Use indexes**: The migration creates indexes on foreign keys and commonly queried columns
2. **Limit results**: Always use `LIMIT` for large result sets
3. **Use joins efficiently**: LEFT JOIN when optional, INNER JOIN when required
4. **Avoid N+1 queries**: Fetch related data in a single query using JOINs
5. **Use `EXPLAIN ANALYZE`**: Check query performance before deploying

```sql
-- Example: Check query performance
EXPLAIN ANALYZE
SELECT m.* FROM meals m
JOIN meal_plans mp ON m.meal_plan_id = mp.id
WHERE mp.user_id = auth.uid();
```

## Common Pitfalls

1. **Forgetting auth.uid() check**: Always filter by user_id in application code
2. **Not handling NULL values**: Use `COALESCE` or check for NULL
3. **JSONB type mismatch**: Cast strings to JSONB: `'{"key": "value"}'::jsonb`
4. **Foreign key violations**: Ensure parent records exist before inserting children
5. **Unique constraint violations**: Check for existing records before INSERT

## Testing Queries

```sql
-- Verify RLS is working (should only see your own data)
SELECT * FROM profiles;
SELECT * FROM meal_plans;
SELECT * FROM user_progress;

-- Check auth status
SELECT 
  auth.uid() as my_user_id,
  auth.role() as my_role;

-- Verify cascading deletes work
BEGIN;
  DELETE FROM meal_plans WHERE id = 'test-uuid';
  -- Check that meals and shopping_items were also deleted
  SELECT COUNT(*) FROM meals WHERE meal_plan_id = 'test-uuid';
ROLLBACK; -- Don't actually delete
```

## Quick Reference: Data Types

| Type | Example | Use For |
|------|---------|---------|
| `UUID` | `550e8400-e29b-41d4-a716-446655440000` | IDs |
| `TEXT` | `'Hello World'` | Strings |
| `INTEGER` | `42` | Whole numbers |
| `DECIMAL(10,2)` | `123.45` | Money, precise decimals |
| `DATE` | `'2024-01-15'` | Dates only |
| `TIMESTAMPTZ` | `'2024-01-15 14:30:00+00'` | Dates with time |
| `JSONB` | `'{"key": "value"}'::jsonb` | Flexible JSON data |
| `BOOLEAN` | `true` / `false` | Yes/No flags |
| `TEXT[]` | `ARRAY['a', 'b', 'c']` | String arrays |

---

**Pro tip**: Keep this reference handy when writing application queries! 📚
