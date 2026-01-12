# Supabase Database Documentation

Complete documentation for the meal planning app database schema.

## 📚 Documentation Index

| Document | Description | Audience |
|----------|-------------|----------|
| [SETUP.md](./SETUP.md) | Step-by-step setup guide | **Start here** - All users |
| [README.md](./README.md) | Schema overview and details | Developers |
| [SCHEMA_DIAGRAM.md](./SCHEMA_DIAGRAM.md) | Visual schema diagrams | Developers |
| [QUERY_REFERENCE.md](./QUERY_REFERENCE.md) | Common queries and patterns | Developers |

## 🚀 Quick Start

**New to Supabase?** Follow these steps:

1. ✅ Read [SETUP.md](./SETUP.md) - Complete setup instructions
2. ✅ Apply the migration in `/migrations/20240101000000_initial_schema.sql`
3. ✅ Configure your `.env` file with Supabase credentials
4. ✅ Review [SCHEMA_DIAGRAM.md](./SCHEMA_DIAGRAM.md) to understand the structure
5. ✅ Reference [QUERY_REFERENCE.md](./QUERY_REFERENCE.md) when writing queries

## 📁 Directory Structure

```
supabase/
├── migrations/
│   └── 20240101000000_initial_schema.sql  # Database schema migration
├── README.md                               # Schema documentation
├── SETUP.md                                # Setup instructions
├── SCHEMA_DIAGRAM.md                       # Visual diagrams
├── QUERY_REFERENCE.md                      # Query examples
└── INDEX.md                                # This file
```

## 🗄️ Database Schema

### Tables (5)

1. **profiles** - User profiles and preferences
2. **meal_plans** - Meal plans with budget and duration
3. **meals** - Individual meals with nutritional data
4. **shopping_items** - Shopping list items
5. **user_progress** - Daily progress tracking

### Key Features

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Automatic timestamps with triggers
- ✅ Cascading deletes for data integrity
- ✅ Optimized indexes for common queries
- ✅ JSONB fields for flexible data storage
- ✅ Check constraints for data validation

## 🔒 Security

### Row Level Security (RLS)

All tables use RLS policies to ensure users can only access their own data:

- **Direct ownership**: `profiles`, `meal_plans`, `user_progress`
  - Policies check: `auth.uid() = user_id`
  
- **Indirect ownership**: `meals`, `shopping_items`
  - Policies check ownership through parent `meal_plans` table

### Best Practices

1. ✅ Always authenticate users before database operations
2. ✅ Use `auth.uid()` in queries to filter by current user
3. ✅ Never expose the `service_role` key (not needed for this app)
4. ✅ Test RLS policies by attempting cross-user data access
5. ✅ Keep the `anon` key in environment variables

## 🔄 Data Flow

### Creating a Meal Plan

```
User Authentication
    ↓
Create/Update Profile
    ↓
Generate Meal Plan
    ↓
Add Meals (breakfast, lunch, dinner)
    ↓
Generate Shopping List
    ↓
Track Progress Daily
```

### Querying User Data

```
auth.uid() → profiles (user settings)
           → meal_plans → meals (meal details)
                       → shopping_items (shopping list)
           → user_progress (completed meals)
```

## 📊 Relationships

```
auth.users (1) ────→ (1) profiles
           (1) ────→ (many) meal_plans
           (1) ────→ (many) user_progress

meal_plans (1) ────→ (many) meals
           (1) ────→ (many) shopping_items
```

## 🛠️ Common Operations

### For Developers

```javascript
// Example: Supabase client setup
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

// Create profile
const { data, error } = await supabase
  .from('profiles')
  .insert({
    user_id: user.id,
    name: 'John Doe',
    preferences: { dietary_restrictions: ['vegetarian'] }
  })

// Get user's meal plans
const { data: plans } = await supabase
  .from('meal_plans')
  .select('*, meals(*), shopping_items(*)')
  .eq('user_id', user.id)
  .order('start_date', { ascending: false })
```

See [QUERY_REFERENCE.md](./QUERY_REFERENCE.md) for more examples.

## 🧪 Testing

### Verify Setup

After applying migrations:

1. Check **Table Editor** - Should see 5 tables
2. Check **Database** → **Policies** - Should see RLS policies
3. Test authentication flow
4. Try creating a meal plan
5. Verify data appears in Table Editor

### SQL Tests

```sql
-- Test RLS (should only see your data)
SELECT * FROM profiles;
SELECT * FROM meal_plans;

-- Test cascading delete
BEGIN;
  DELETE FROM meal_plans WHERE id = 'test-id';
  -- Verify meals and shopping_items are also deleted
ROLLBACK;

-- Check indexes exist
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public';
```

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "relation does not exist" | Run migration in SQL Editor |
| "permission denied" | Check RLS policies, ensure user is authenticated |
| "Missing environment variables" | Create `.env` with Supabase credentials |
| "Foreign key violation" | Ensure parent record exists before insert |

See [SETUP.md](./SETUP.md#troubleshooting) for detailed troubleshooting.

## 📖 Additional Resources

### Supabase Documentation

- [Supabase Docs](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [PostgreSQL](https://www.postgresql.org/docs/)

### Community Support

- [Supabase Discord](https://discord.supabase.com)
- [GitHub Discussions](https://github.com/supabase/supabase/discussions)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/supabase)

## 📝 Migration History

| Version | Date | Description | Status |
|---------|------|-------------|--------|
| `20240101000000_initial_schema` | 2024-01-01 | Initial database schema | ✅ Current |

## 🎯 Next Steps

After completing setup:

1. ✅ Integrate Supabase client in your application
2. ✅ Implement authentication flow
3. ✅ Create CRUD operations for meal plans
4. ✅ Add real-time subscriptions (optional)
5. ✅ Set up database backups (Supabase automatic)
6. ✅ Monitor query performance
7. ✅ Deploy to production

## 💡 Pro Tips

1. **Use transactions** for related inserts (meal plan + meals)
2. **Batch operations** when inserting multiple shopping items
3. **Use `.select('*')` carefully** - only fetch needed columns
4. **Leverage JSONB** for flexible, schema-less data
5. **Monitor slow queries** in Supabase dashboard
6. **Use connection pooling** for high-traffic apps
7. **Keep migrations in version control**

## 📞 Support

Need help? Try these resources in order:

1. 📖 Check the documentation files in this directory
2. 🔍 Search [Supabase docs](https://supabase.com/docs)
3. 💬 Ask in [Supabase Discord](https://discord.supabase.com)
4. 🐛 Create issue on [GitHub](https://github.com/supabase/supabase/issues)

---

**Ready to get started?** Head over to [SETUP.md](./SETUP.md)! 🚀
