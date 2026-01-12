# Supabase Backend Integration

This application now supports Supabase as a backend database for persistent data storage across sessions and devices.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

Supabase JS client (`@supabase/supabase-js`) is already included.

### 2. Set Up Supabase

#### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Note your project URL and anon key from Settings → API

#### Configure Environment Variables
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

#### Run the Database Schema
1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Copy the contents of `supabase-schema.sql`
4. Paste and execute the SQL

This will create all necessary tables, indexes, RLS policies, and triggers.

### 3. Verify Setup

Start the dev server:
```bash
npm run dev
```

The app should start without "Missing Supabase environment variables" errors.

## Architecture

### Database Tables

- **profiles** - User meal planning preferences and settings
- **meal_plans** - Generated meal plans (both current and saved)
- **meal_preferences** - User likes/dislikes for specific meals
- **portion_adjustments** - Custom portion sizes per meal
- **scheduled_days** - Calendar scheduling for meal plans
- **day_progress** - Completed meals tracking and streaks
- **badges** - Achievement badges earned by users
- **shopping_lists** - Auto-generated shopping lists per plan
- **meal_prep_plans** - Batch cooking and meal prep schedules

### Security

- **Row Level Security (RLS)** enabled on all tables
- Users can only access their own data
- Policies enforce user_id = auth.uid() on all operations
- Anon key is safe for client-side use

### Service Layer

All database operations go through `SupabaseService` in `src/lib/supabase-service.ts`:

```typescript
import { SupabaseService } from '@/lib/supabase-service';

// Example: Save user profile
await SupabaseService.saveUserProfile(profile);

// Example: Get meal plans
const plans = await SupabaseService.getSavedMealPlans();
```

## Migration from Local State

The app currently uses `useKV` hooks for local persistence. To migrate to Supabase:

1. Replace `useKV` with `useState` + `useEffect`
2. Load data from Supabase on component mount
3. Save data to Supabase on mutations
4. See `INTEGRATION_GUIDE.md` for detailed migration steps

## Development

### TypeScript Types

Database types are defined in `src/types/database.ts` and match the SQL schema.

Domain types are in `src/types/domain.ts` and represent the application's business logic.

### Testing Data Persistence

1. Create a profile and generate a meal plan
2. Refresh the page - data should persist
3. Open Supabase dashboard → Table Editor to see raw data
4. Create a second account to verify data isolation

### Debugging

- Check browser console for Supabase errors
- View real-time API logs in Supabase dashboard
- Use Supabase Table Editor to inspect/modify data directly
- Network tab shows all Supabase REST API calls

## Production Checklist

- [ ] Environment variables set in production environment
- [ ] Database schema deployed to production Supabase project
- [ ] RLS policies tested with multiple user accounts
- [ ] No service role key in client code (use anon key only)
- [ ] Rate limiting configured in Supabase if needed
- [ ] Backup strategy in place

## Troubleshooting

### Environment Variables Not Found
- Ensure `.env` exists in project root
- Restart dev server after creating/modifying `.env`
- Check for typos in variable names (must start with `VITE_`)

### Permission Denied Errors
- Verify RLS policies were created (re-run schema SQL)
- Check user is authenticated before accessing data
- Inspect Supabase logs for specific policy violations

### Data Not Persisting
- Check Supabase dashboard logs for errors
- Verify `await` is used on all async operations
- Check network tab for failed requests
- Ensure table exists and has correct schema

### TypeScript Errors in Service
- Type assertions (`as any`) are used to work around Supabase type inference
- This is a known limitation and doesn't affect runtime behavior
- Types are still enforced at the domain layer

## Resources

- [Complete Setup Guide](./SUPABASE_SETUP.md)
- [Integration Guide](./INTEGRATION_GUIDE.md)
- [Database Schema](./supabase-schema.sql)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client Reference](https://supabase.com/docs/reference/javascript)

## Support

For issues specific to:
- **Supabase**: Check [Supabase Discord](https://discord.supabase.com) or [GitHub Discussions](https://github.com/supabase/supabase/discussions)
- **This App**: Open an issue in the repository with error logs and steps to reproduce

---

## What's Next?

The foundation is complete. Now you need to:

1. Set up your Supabase project
2. Configure environment variables  
3. Run the database schema
4. Integrate Supabase service calls into `App.tsx`
5. Test data persistence

See `INTEGRATION_GUIDE.md` for step-by-step integration instructions.
