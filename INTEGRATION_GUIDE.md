# Supabase Integration - Implementation Summary

## ✅ What's Been Created

### 1. Database Schema (`supabase-schema.sql`)
- Complete SQL schema for all application tables
- Row Level Security (RLS) policies for all tables
- Indexes for query optimization
- Automatic triggers for `updated_at` fields

### 2. TypeScript Types (`src/types/database.ts`)
- Full database schema types for Supabase client
- JSON type definitions for complex data structures

### 3. Supabase Client (`src/lib/supabase.ts`)
- Configured Supabase client with authentication
- Environment variable validation

### 4. Data Service Layer (`src/lib/supabase-service.ts`)
- Complete CRUD operations for all data types:
  - User profiles
  - Meal plans (current + saved)
  - Meal preferences (likes/dislikes)
  - Portion adjustments
  - Scheduled days
  - Day progress tracking
  - Badges/achievements
  - Shopping lists
  - Meal prep plans
- User authentication helpers
- Bulk data deletion for account removal

### 5. Setup Documentation
- `SUPABASE_SETUP.md` - Complete setup instructions
- SQL schema with detailed comments
- Environment variable configuration guide

## 🔨 Next Steps - What YOU Need to Do

### Step 1: Set Up Supabase Project

1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Go to Settings → API and copy:
   - Project URL
   - anon/public key

### Step 2: Configure Environment Variables

Create or update `.env`:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Step 3: Run the Database Schema

1. Open Supabase SQL Editor
2. Copy entire contents of `supabase-schema.sql`
3. Paste and run (Ctrl/Cmd + Enter)
4. Verify all tables and policies were created in Table Editor

### Step 4: Integrate Supabase into App.tsx

The current `App.tsx` uses `useKV` hooks for local state. You need to replace this with Supabase calls.

**Current pattern:**
```typescript
const [userProfile, setUserProfile] = useKV<UserProfile | null>('user_profile', null);
```

**New pattern:**
```typescript
const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

// Load on mount
useEffect(() => {
  SupabaseService.getUserProfile().then(setUserProfile);
}, []);

// Save when changed
const handleSaveProfile = async (profile: UserProfile) => {
  await SupabaseService.saveUserProfile(profile);
  setUserProfile(profile);
};
```

### Key Integration Points in App.tsx

Replace these hooks with Supabase service calls:

1. **User Profile** (line 52):
   ```typescript
   // OLD: const [userProfile, setUserProfile] = useKV<UserProfile | null>('user_profile', null);
   // NEW: Load from SupabaseService.getUserProfile()
   ```

2. **Meal Plan** (line 53):
   ```typescript
   // OLD: const [mealPlan, setMealPlan] = useKV<MealPlan | null>('current_meal_plan', null);
   // NEW: Load from SupabaseService.getCurrentMealPlan()
   ```

3. **Saved Plans** (line 56):
   ```typescript
   // OLD: const [savedMealPlans, setSavedMealPlans] = useKV<MealPlan[]>('saved_meal_plans', []);
   // NEW: Load from SupabaseService.getSavedMealPlans()
   ```

4. **Meal Preferences** (line 57):
   ```typescript
   // OLD: const [mealPreferences, setMealPreferences] = useKV<MealPreference[]>('meal_preferences', []);
   // NEW: Load from SupabaseService.getMealPreferences()
   ```

5. **Scheduled Days** (line 59):
   ```typescript
   // OLD: const [scheduledDays, setScheduledDays] = useKV<ScheduledDay[]>('scheduled_days', []);
   // NEW: Load from SupabaseService.getScheduledDays()
   ```

6. **Day Progress** (line 60):
   ```typescript
   // OLD: const [dayProgress, setDayProgress] = useKV<DayProgress[]>('day_progress', []);
   // NEW: Load from SupabaseService.getDayProgress()
   ```

7. **Badges** (line 61):
   ```typescript
   // OLD: const [badges, setBadges] = useKV<Badge[]>('earned_badges', []);
   // NEW: Load from SupabaseService.getBadges()
   ```

### Step 5: Update Authentication

Replace the current GitHub Spark auth with Supabase Auth:

**Current auth checking:**
```typescript
const loadUser = async () => {
  const user = await window.spark.user();
  setCurrentUser(user);
};
```

**New Supabase auth:**
```typescript
const loadUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  setCurrentUser(user);
};
```

### Step 6: Handle Demo Mode

The app currently has a "demo mode" for unauthenticated users. You have two options:

**Option A**: Keep demo mode with local state
- Use `useState` for demo mode (no persistence)
- Use Supabase only when `currentUser` exists

**Option B**: Require authentication
- Remove demo mode entirely
- Force login/signup before using app
- Simpler implementation, better data integrity

### Step 7: Update All Mutation Functions

Every function that modifies state needs to call Supabase:

```typescript
// Example: handleLikeMeal
const handleLikeMeal = async (mealId: string, meal: Meal) => {
  const preference: MealPreference = {
    meal_id: mealId,
    recipe_name: meal.recipe_name,
    meal_type: meal.meal_type,
    preference: 'like',
    rated_at: new Date().toISOString(),
    ingredients: meal.ingredients.map(ing => ing.name),
  };
  
  await SupabaseService.saveMealPreference(preference);
  
  // Update local state
  setMealPreferences(current => {
    const existing = current.find(p => p.meal_id === mealId);
    if (existing && existing.preference === 'like') {
      return current.filter(p => p.meal_id !== mealId);
    }
    return [...current.filter(p => p.meal_id !== mealId), preference];
  });
  
  toast.success('Meal liked! 👍');
};
```

### Step 8: Remove Old Spark KV References

1. Remove all `useKV` imports
2. Remove all `window.spark.kv` calls
3. Update imports to use Supabase service instead

## 🎯 Testing Checklist

After integration, test:

- [ ] User can create profile
- [ ] Profile persists after refresh
- [ ] Meal plan generates and saves
- [ ] Can save multiple meal plans (up to 5)
- [ ] Can delete saved plans
- [ ] Meal likes/dislikes persist
- [ ] Scheduled days save to calendar
- [ ] Marking days complete works
- [ ] Badges are earned and persist
- [ ] Shopping lists save
- [ ] Meal prep plans save
- [ ] Account deletion removes all data
- [ ] Data is scoped per user (test with 2 accounts)

## 🔒 Security Notes

- All tables have RLS enabled
- Users can only access their own data
- No API keys or secrets in client code
- Use Supabase anon key (safe for client-side)
- Service role key should NEVER be in client code

## 🐛 Common Issues & Solutions

### "Missing Supabase environment variables"
- Check `.env` file exists in project root
- Restart dev server after adding `.env`
- Verify no typos in variable names

### "Permission denied" errors
- RLS policies might not be applied
- Re-run the schema SQL completely
- Check user is authenticated before data access

### Data not loading
- Add console.logs to service calls
- Check Supabase dashboard logs
- Verify tables have data in Table Editor
- Check browser network tab for errors

### TypeScript errors in service
- Already handled with `as any` type assertions
- This is a known Supabase type inference limitation
- Runtime behavior is correct

## 📚 Additional Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

## 💡 Pro Tips

1. **Start Small**: Integrate one feature at a time (start with user profile)
2. **Test Each Step**: Verify data in Supabase dashboard after each save
3. **Use Supabase Logs**: Real-time API logs in dashboard are invaluable
4. **Backup Data**: Export any important local data before switching
5. **Keep Demo Mode Simple**: If keeping demo mode, use plain `useState` for it

Good luck with the integration! The foundation is all set up - now it's about connecting the UI to the database.
