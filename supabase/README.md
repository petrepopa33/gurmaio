# Supabase Database Schema

This directory contains the database migrations for the meal planning application.

## Quick Start

### Option 1: Using Supabase Dashboard (Recommended for beginners)

1. Go to your Supabase project at [app.supabase.com](https://app.supabase.com)
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New query**
4. Copy the entire contents of `migrations/20240101000000_initial_schema.sql`
5. Paste into the SQL editor
6. Click **Run** or press `Ctrl/Cmd + Enter`
7. Verify success by going to **Table Editor** - you should see 5 new tables

### Option 2: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

## Database Schema Overview

### Tables

#### `profiles`
User profiles with meal planning preferences.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to `auth.users(id)` (unique) |
| `name` | TEXT | User's name |
| `preferences` | JSONB | Flexible preferences storage (dietary restrictions, allergens, etc.) |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Example preferences JSONB:**
```json
{
  "dietary_restrictions": ["vegetarian", "gluten-free"],
  "allergens": ["nuts", "dairy"],
  "meal_plan_days": 7,
  "meals_per_day": 3,
  "budget_period": "weekly"
}
```

#### `meal_plans`
Top-level meal plans with budget and duration.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to `auth.users(id)` |
| `start_date` | DATE | When the meal plan starts |
| `days` | INTEGER | Number of days (must be > 0) |
| `budget` | DECIMAL(10,2) | Budget in EUR (must be >= 0) |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

#### `meals`
Individual meals with nutritional information.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `meal_plan_id` | UUID | Foreign key to `meal_plans(id)` |
| `day` | INTEGER | Day number within the meal plan (must be > 0) |
| `type` | TEXT | Meal type (breakfast, lunch, dinner, snack) |
| `calories` | INTEGER | Calories (must be >= 0) |
| `protein` | DECIMAL(8,2) | Protein in grams (must be >= 0) |
| `carbs` | DECIMAL(8,2) | Carbohydrates in grams (must be >= 0) |
| `fats` | DECIMAL(8,2) | Fats in grams (must be >= 0) |
| `cost` | DECIMAL(10,2) | Cost in EUR (must be >= 0) |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

#### `shopping_items`
Shopping list items for meal plans.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `meal_plan_id` | UUID | Foreign key to `meal_plans(id)` |
| `name` | TEXT | Item name |
| `quantity` | DECIMAL(10,2) | Quantity (must be > 0) |
| `unit` | TEXT | Unit of measurement (kg, g, ml, pieces, etc.) |
| `price` | DECIMAL(10,2) | Price in EUR (must be >= 0) |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

#### `user_progress`
Track completed meals per day.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to `auth.users(id)` |
| `date` | DATE | Date of progress (unique per user) |
| `completed_meals` | JSONB | Array of completed meal data |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Example completed_meals JSONB:**
```json
[
  {
    "meal_id": "uuid-here",
    "type": "breakfast",
    "completed_at": "2024-01-15T08:30:00Z"
  },
  {
    "meal_id": "uuid-here",
    "type": "lunch",
    "completed_at": "2024-01-15T13:00:00Z"
  }
]
```

## Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Users can only access their own data
- For `profiles`, `meal_plans`, and `user_progress`: Direct user_id check
- For `meals` and `shopping_items`: Indirect check through parent `meal_plans` table

### RLS Policy Examples

**Direct user ownership (profiles, meal_plans, user_progress):**
```sql
-- Users can only SELECT their own rows
USING (auth.uid() = user_id)

-- Users can only INSERT rows with their own user_id
WITH CHECK (auth.uid() = user_id)
```

**Indirect ownership (meals, shopping_items):**
```sql
-- Users can only access meals/items from their own meal plans
USING (
  EXISTS (
    SELECT 1 FROM meal_plans 
    WHERE meal_plans.id = meals.meal_plan_id 
    AND meal_plans.user_id = auth.uid()
  )
)
```

## Indexes

Optimized indexes for common query patterns:
- Profile lookups by user_id
- Meal plan queries by user and date
- Meal queries by meal_plan_id and day
- Shopping item lookups by meal_plan_id
- Progress tracking by user and date

## Automatic Timestamps

Tables with `updated_at` columns have triggers that automatically update the timestamp on any UPDATE operation.

## Validation

The schema includes CHECK constraints to ensure data integrity:
- `days > 0` in meal_plans
- `budget >= 0` in meal_plans
- `day > 0` in meals
- All nutritional values >= 0
- All costs/prices >= 0
- `quantity > 0` in shopping_items

## Cascading Deletes

- Deleting a user from `auth.users` cascades to all their data
- Deleting a meal_plan cascades to all its meals and shopping_items

## Testing the Schema

After applying the migration, you can test with these SQL queries:

```sql
-- Insert a test profile
INSERT INTO profiles (user_id, name, preferences)
VALUES (auth.uid(), 'Test User', '{"dietary_restrictions": ["vegetarian"]}'::jsonb);

-- Create a test meal plan
INSERT INTO meal_plans (user_id, start_date, days, budget)
VALUES (auth.uid(), '2024-01-15', 7, 50.00)
RETURNING id;

-- Add a test meal (replace meal_plan_id with the UUID from above)
INSERT INTO meals (meal_plan_id, day, type, calories, protein, carbs, fats, cost)
VALUES ('your-meal-plan-uuid', 1, 'breakfast', 400, 15.5, 45.0, 12.0, 3.50);

-- Query your data
SELECT * FROM profiles WHERE user_id = auth.uid();
SELECT * FROM meal_plans WHERE user_id = auth.uid();
SELECT m.* FROM meals m 
  JOIN meal_plans mp ON m.meal_plan_id = mp.id 
  WHERE mp.user_id = auth.uid();
```

## Migration History

| Version | Date | Description |
|---------|------|-------------|
| `20240101000000_initial_schema` | 2024-01-01 | Initial database schema with 5 core tables and RLS policies |

## Troubleshooting

### "permission denied for table X"
- **Cause**: RLS policies not applied or user not authenticated
- **Solution**: Ensure migrations ran completely and user is logged in

### "duplicate key value violates unique constraint"
- **Cause**: Trying to insert duplicate data
- **Solution**: Check unique constraints on profiles.user_id and user_progress(user_id, date)

### "foreign key constraint violation"
- **Cause**: Referencing non-existent parent records
- **Solution**: Ensure meal_plan exists before creating meals/shopping_items

### "new row violates check constraint"
- **Cause**: Data doesn't meet validation rules
- **Solution**: Ensure days > 0, budget >= 0, quantities > 0, etc.

## Next Steps

After applying the migration:
1. Set up your Supabase environment variables in `.env`
2. Test authentication flow
3. Verify RLS policies by attempting to access other users' data (should fail)
4. Integrate with your application code
5. Monitor query performance and add indexes as needed

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [SQL Reference](https://www.postgresql.org/docs/)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
