# ⚡ Supabase Quick Start - 5-Minute Guide

## 1. Install (Already Done ✅)
```bash
npm install  # @supabase/supabase-js is already in package.json
```

## 2. Create Supabase Project (5 minutes)

1. Go to https://supabase.com and sign up
2. Click "New Project"
3. Name it "gurmaio" (or whatever you want)
4. Set a strong database password (save it!)
5. Choose a region
6. Wait ~2 minutes for provisioning

## 3. Get Credentials (1 minute)

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy two values:
   - **Project URL** (starts with https://)
   - **anon public** key (long string)

## 4. Configure Environment (1 minute)

Create `.env` in project root:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...your-key-here
```

## 5. Create Database (2 minutes)

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Open `supabase-schema.sql` from this project
4. Copy ALL contents
5. Paste into SQL editor
6. Click **Run** (or Ctrl/Cmd + Enter)
7. You should see "Success. No rows returned"

## 6. Verify Setup (1 minute)

1. In Supabase, go to **Table Editor**
2. You should see 9 tables:
   - profiles
   - meal_plans
   - meal_preferences
   - portion_adjustments
   - scheduled_days
   - day_progress
   - badges
   - shopping_lists
   - meal_prep_plans

## 7. Test in App (1 minute)

```bash
npm run dev
```

App should start without "Missing Supabase environment variables" error.

## ✅ Setup Complete!

Now you're ready to integrate. Open `INTEGRATION_GUIDE.md` for detailed instructions.

---

## Quick Integration Example

Replace this:
```typescript
const [userProfile, setUserProfile] = useKV<UserProfile | null>('user_profile', null);
```

With this:
```typescript
import { SupabaseService } from '@/lib/supabase-service';

const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

useEffect(() => {
  SupabaseService.getUserProfile().then(setUserProfile);
}, []);

const saveProfile = async (profile: UserProfile) => {
  await SupabaseService.saveUserProfile(profile);
  setUserProfile(profile);
};
```

---

## Common Issues

**"Missing environment variables"**
→ Create `.env`, add credentials, restart dev server

**"Permission denied for table"**
→ Re-run the full `supabase-schema.sql`

**Tables not visible**
→ Check you ran the SQL in the correct project

---

## What Next?

1. ✅ You've set up the database
2. 📖 Read `INTEGRATION_GUIDE.md` for step-by-step integration
3. 💻 Look at `use-supabase-data.example.ts` for code examples
4. ✅ Use `INTEGRATION_CHECKLIST.md` to track progress

**Total time to integrate**: 3-5 hours

Good luck! 🚀
