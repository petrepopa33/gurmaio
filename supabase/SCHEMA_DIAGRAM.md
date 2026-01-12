# Database Schema Diagram

Visual representation of the database schema and relationships.

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          auth.users                                  │
│                    (Managed by Supabase)                             │
│  ─────────────────────────────────────────────────────────────────  │
│  id (UUID) | email | encrypted_password | ...                       │
└──────────────────────────┬───────────────────────────────────────────┘
                           │
                           │ user_id (FK)
                           │
        ┌──────────────────┼──────────────────┬───────────────────────┐
        │                  │                  │                       │
        │                  │                  │                       │
        ▼                  ▼                  ▼                       │
┌───────────────┐  ┌──────────────┐  ┌─────────────────┐             │
│   profiles    │  │  meal_plans  │  │  user_progress  │             │
├───────────────┤  ├──────────────┤  ├─────────────────┤             │
│ id (PK)       │  │ id (PK)      │  │ id (PK)         │             │
│ user_id (FK)  │  │ user_id (FK) │  │ user_id (FK)    │             │
│ name          │  │ start_date   │  │ date            │             │
│ preferences   │  │ days         │  │ completed_meals │             │
│ created_at    │  │ budget       │  │ created_at      │             │
│ updated_at    │  │ created_at   │  │ updated_at      │             │
└───────────────┘  │ updated_at   │  └─────────────────┘             │
                   └──────┬───────┘                                   │
                          │                                           │
                          │ meal_plan_id (FK)                         │
                          │                                           │
                  ┌───────┴────────┐                                  │
                  │                │                                  │
                  ▼                ▼                                  │
          ┌──────────┐     ┌──────────────┐                          │
          │  meals   │     │shopping_items│                          │
          ├──────────┤     ├──────────────┤                          │
          │ id (PK)  │     │ id (PK)      │                          │
          │ meal_plan│     │ meal_plan_id │◄─────────────────────────┘
          │   _id(FK)│     │   (FK)       │
          │ day      │     │ name         │
          │ type     │     │ quantity     │
          │ calories │     │ unit         │
          │ protein  │     │ price        │
          │ carbs    │     │ created_at   │
          │ fats     │     └──────────────┘
          │ cost     │
          │created_at│
          └──────────┘
```

## Table Details

### Ownership Hierarchy

```
User (auth.users)
  │
  ├── Profile (1:1) ──────────────────┐
  │                                    │
  ├── Meal Plans (1:many) ─────┐      │
  │     │                       │      │
  │     ├── Meals (1:many)      │      │  All tables reference
  │     │                       │      │  the same user either
  │     └── Shopping Items      │      │  directly or indirectly
  │         (1:many)            │      │  through meal_plans
  │                             │      │
  └── User Progress (1:many) ───┴──────┘
```

### Cascade Behavior

When a record is deleted, related records are automatically deleted:

```
Delete User (auth.users)
  ├─► Deletes all profiles
  ├─► Deletes all meal_plans
  │     ├─► Deletes all meals
  │     └─► Deletes all shopping_items
  └─► Deletes all user_progress

Delete Meal Plan
  ├─► Deletes all meals in that plan
  └─► Deletes all shopping_items for that plan
```

## Data Flow Examples

### Creating a Complete Meal Plan

```
1. User signs up
   ↓
2. auth.users record created (automatic)
   ↓
3. Profile created
   INSERT INTO profiles (user_id, name, preferences)
   ↓
4. Meal plan created
   INSERT INTO meal_plans (user_id, start_date, days, budget)
   ↓
5. Meals added
   INSERT INTO meals (meal_plan_id, day, type, ...)
   ↓
6. Shopping items added
   INSERT INTO shopping_items (meal_plan_id, name, quantity, ...)
   ↓
7. Progress tracked
   INSERT INTO user_progress (user_id, date, completed_meals)
```

### Querying User's Complete Data

```
Start with: auth.uid() (current user's ID)
    ↓
1. Get Profile
   SELECT * FROM profiles WHERE user_id = auth.uid()
    ↓
2. Get Meal Plans
   SELECT * FROM meal_plans WHERE user_id = auth.uid()
    ↓
3. For each meal plan, get Meals
   SELECT * FROM meals WHERE meal_plan_id = ?
    ↓
4. For each meal plan, get Shopping Items
   SELECT * FROM shopping_items WHERE meal_plan_id = ?
    ↓
5. Get Progress History
   SELECT * FROM user_progress WHERE user_id = auth.uid()
```

## Row Level Security (RLS) Flow

### Direct Ownership (profiles, meal_plans, user_progress)

```
User makes query
    ↓
1. auth.uid() = '550e8400-e29b-41d4-a716-446655440000'
    ↓
2. RLS checks: WHERE user_id = auth.uid()
    ↓
3. Only returns rows where user_id matches auth.uid()
    ↓
✅ User sees only their own data
```

### Indirect Ownership (meals, shopping_items)

```
User queries meals
    ↓
1. auth.uid() = '550e8400-...'
    ↓
2. RLS checks:
   EXISTS (
     SELECT 1 FROM meal_plans
     WHERE meal_plans.id = meals.meal_plan_id
     AND meal_plans.user_id = auth.uid()
   )
    ↓
3. Subquery verifies the meal plan belongs to the user
    ↓
✅ User sees only meals from their own meal plans
```

## Constraints Summary

| Table | Unique Constraints | Check Constraints |
|-------|-------------------|-------------------|
| profiles | user_id | - |
| meal_plans | - | days > 0, budget >= 0 |
| meals | - | day > 0, all nutritional values >= 0, cost >= 0 |
| shopping_items | - | quantity > 0, price >= 0 |
| user_progress | (user_id, date) | - |

## Indexes Summary

| Table | Index | Purpose |
|-------|-------|---------|
| profiles | idx_profiles_user_id | Fast user lookup |
| meal_plans | idx_meal_plans_user_id | Fast user's plans lookup |
| meal_plans | idx_meal_plans_start_date | Date-based queries |
| meals | idx_meals_meal_plan_id | Fast plan's meals lookup |
| meals | idx_meals_day | Day-based meal queries |
| shopping_items | idx_shopping_items_meal_plan_id | Fast shopping list lookup |
| user_progress | idx_user_progress_user_id | Fast user progress lookup |
| user_progress | idx_user_progress_date | Date-range queries |

## Field Types Reference

### Common Types

| Type | Size | Range/Format | Usage |
|------|------|--------------|-------|
| UUID | 16 bytes | `550e8400-e29b-...` | Primary keys, foreign keys |
| TEXT | Variable | Unlimited | Names, types, descriptions |
| INTEGER | 4 bytes | -2,147,483,648 to 2,147,483,647 | Days, calories |
| DECIMAL(10,2) | Variable | Up to 8 digits before decimal | Money, costs, prices |
| DECIMAL(8,2) | Variable | Up to 6 digits before decimal | Nutritional values |
| DATE | 4 bytes | `2024-01-15` | Dates without time |
| TIMESTAMPTZ | 8 bytes | `2024-01-15 14:30:00+00` | Timestamps with timezone |
| JSONB | Variable | `{"key": "value"}` | Flexible structured data |

### JSONB Fields

#### profiles.preferences
```json
{
  "dietary_restrictions": ["vegetarian", "vegan", "gluten-free"],
  "allergens": ["nuts", "dairy", "shellfish"],
  "meal_plan_days": 7,
  "meals_per_day": 3,
  "budget_period": "weekly",
  "cuisine_preferences": ["italian", "mexican", "asian"],
  "cooking_skill": "intermediate",
  "household_size": 2
}
```

#### user_progress.completed_meals
```json
[
  {
    "meal_id": "550e8400-e29b-41d4-a716-446655440000",
    "type": "breakfast",
    "completed_at": "2024-01-15T08:30:00Z",
    "notes": "Enjoyed it!"
  },
  {
    "meal_id": "650e8400-e29b-41d4-a716-446655440001",
    "type": "lunch",
    "completed_at": "2024-01-15T13:00:00Z",
    "rating": 5
  }
]
```

## Sample Data Structure

### Example: Complete meal plan with all related data

```sql
-- User
auth.users.id = '550e8400-e29b-41d4-a716-446655440000'

-- Profile
profiles = {
  id: 'profile-uuid',
  user_id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'John Doe',
  preferences: {dietary_restrictions: ['vegetarian']}
}

-- Meal Plan
meal_plans = {
  id: 'plan-uuid-123',
  user_id: '550e8400-e29b-41d4-a716-446655440000',
  start_date: '2024-01-15',
  days: 7,
  budget: 50.00
}

-- Meals (multiple)
meals = [
  {
    id: 'meal-uuid-1',
    meal_plan_id: 'plan-uuid-123',
    day: 1,
    type: 'breakfast',
    calories: 400,
    protein: 15.5,
    carbs: 45.0,
    fats: 12.0,
    cost: 3.50
  },
  {
    id: 'meal-uuid-2',
    meal_plan_id: 'plan-uuid-123',
    day: 1,
    type: 'lunch',
    calories: 600,
    protein: 25.0,
    carbs: 60.0,
    fats: 20.0,
    cost: 5.00
  }
]

-- Shopping Items (multiple)
shopping_items = [
  {
    id: 'item-uuid-1',
    meal_plan_id: 'plan-uuid-123',
    name: 'Rice',
    quantity: 2.0,
    unit: 'kg',
    price: 3.50
  },
  {
    id: 'item-uuid-2',
    meal_plan_id: 'plan-uuid-123',
    name: 'Tomatoes',
    quantity: 1.0,
    unit: 'kg',
    price: 2.99
  }
]

-- User Progress
user_progress = {
  id: 'progress-uuid',
  user_id: '550e8400-e29b-41d4-a716-446655440000',
  date: '2024-01-15',
  completed_meals: [
    {meal_id: 'meal-uuid-1', type: 'breakfast', completed_at: '2024-01-15T08:30:00Z'}
  ]
}
```

---

**Visual Tips**: 
- 🔑 PK = Primary Key
- 🔗 FK = Foreign Key
- 📊 JSONB = Flexible JSON data
- 🔒 RLS enabled on all tables
