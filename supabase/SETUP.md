# Supabase Setup Guide

This guide will walk you through setting up the Supabase database for this meal planning application.

## Prerequisites

- A Supabase account ([sign up here](https://supabase.com))
- A Supabase project (free tier is fine)

## Step 1: Create a Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in the details:
   - **Name**: Choose a name (e.g., "meal-planner")
   - **Database Password**: Generate a strong password and **save it securely**
   - **Region**: Select the region closest to your users
   - **Pricing Plan**: Free tier works great for development
4. Click **"Create new project"**
5. Wait 2-3 minutes for the project to be provisioned

## Step 2: Get Your API Credentials

1. In your project dashboard, click **Settings** (gear icon) in the left sidebar
2. Click **API** under "Project Settings"
3. Copy these two values (you'll need them later):
   - **Project URL** (e.g., `https://abcdefgh.supabase.co`)
   - **anon public** key (the long JWT token under "Project API keys")

## Step 3: Configure Environment Variables

Create a `.env` file in the root of your project:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

**Important**: 
- Replace the placeholder values with your actual Supabase credentials
- Never commit the `.env` file to version control
- Restart your dev server after creating/updating `.env`

## Step 4: Apply the Database Migration

### Method A: Supabase Dashboard (Recommended)

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click **"New query"** button
3. Open the file `/supabase/migrations/20240101000000_initial_schema.sql` from this repository
4. Copy the **entire contents** of the file
5. Paste it into the SQL Editor
6. Click **"Run"** (or press `Ctrl/Cmd + Enter`)
7. You should see: **"Success. No rows returned"** ✅

### Method B: Supabase CLI (Advanced)

If you prefer using the CLI:

```bash
# Install Supabase CLI globally
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project (find project ref in project settings)
supabase link --project-ref your-project-ref

# Push the migration
supabase db push
```

## Step 5: Verify the Setup

1. In your Supabase dashboard, click **Table Editor** in the left sidebar
2. You should see 5 new tables:
   - ✅ `profiles`
   - ✅ `meal_plans`
   - ✅ `meals`
   - ✅ `shopping_items`
   - ✅ `user_progress`

3. Click on any table to see its structure
4. Verify that RLS (Row Level Security) is enabled:
   - Look for the 🔒 icon next to each table name
   - Or check the "RLS enabled" badge in the table view

## Step 6: Enable Authentication Providers (Optional)

By default, Supabase supports email/password authentication. To enable it:

1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. Ensure **Email** is enabled (it should be by default)
3. Configure email templates if desired (Settings → Auth → Email Templates)

### Enabling OAuth Providers (Optional)

To add Google, GitHub, or other OAuth providers:

1. Go to **Authentication** → **Providers**
2. Click on the provider you want to enable (e.g., Google)
3. Follow the provider-specific setup instructions
4. Add the callback URL: `https://your-project-ref.supabase.co/auth/v1/callback`
5. Enter your OAuth credentials and save

## Step 7: Test the Setup

### Option 1: Using the Application

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to the app
3. Try creating an account
4. Check the Supabase dashboard → **Authentication** to see if the user was created
5. Try creating a meal plan in the app
6. Check **Table Editor** to see if data is being saved

### Option 2: Using SQL Editor

Test directly in the Supabase SQL Editor:

```sql
-- Check if your user exists (run after logging into the app)
SELECT * FROM auth.users;

-- Manually insert a test profile
INSERT INTO profiles (user_id, name, preferences)
VALUES (
  auth.uid(), 
  'Test User', 
  '{"dietary_restrictions": ["vegetarian"]}'::jsonb
);

-- Verify the profile was created
SELECT * FROM profiles WHERE user_id = auth.uid();

-- Test RLS by trying to select all profiles (should only see your own)
SELECT * FROM profiles;
```

## Architecture Overview

### Table Relationships

```
auth.users (Supabase managed)
    ↓
    ├─→ profiles (1:1)
    ├─→ meal_plans (1:many)
    │       ↓
    │       ├─→ meals (1:many)
    │       └─→ shopping_items (1:many)
    └─→ user_progress (1:many)
```

### Security Model

- **Row Level Security (RLS)** is enabled on all tables
- Users can only access their own data
- Policies use `auth.uid()` to match the authenticated user
- Child tables (meals, shopping_items) check ownership through parent tables

## Troubleshooting

### "Missing Supabase environment variables"

**Problem**: App shows an error about missing Supabase configuration.

**Solution**:
1. Verify `.env` file exists in project root
2. Ensure variable names are exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Restart your dev server: `npm run dev`

### "relation does not exist"

**Problem**: SQL error about missing tables.

**Solution**:
1. Verify the migration ran successfully
2. Re-run the migration SQL in the SQL Editor
3. Check for error messages in the SQL Editor output

### "permission denied for table"

**Problem**: Can't read/write data even when authenticated.

**Solution**:
1. Verify RLS is enabled (check for 🔒 icon in Table Editor)
2. Ensure RLS policies were created (check the migration output)
3. Verify you're authenticated (`auth.uid()` should not be null)
4. Test with: `SELECT auth.uid()` in SQL Editor (should return your user ID)

### Authentication not working

**Problem**: Can't sign up or log in.

**Solution**:
1. Check that Email provider is enabled in Authentication → Providers
2. Verify your environment variables are correct
3. Check browser console for detailed error messages
4. Ensure Supabase URL doesn't have a trailing slash

### Data not persisting

**Problem**: Data saves but disappears on refresh.

**Solution**:
1. Verify the user is authenticated before saving
2. Check that `user_id` is set correctly in INSERT statements
3. Look for RLS policy violations in browser console
4. Check Supabase logs: Settings → Logs → Postgres Logs

## Next Steps

After completing the setup:

1. ✅ **Test authentication flow**: Sign up, log in, log out
2. ✅ **Test data persistence**: Create a meal plan and verify it saves
3. ✅ **Verify RLS**: Try to access data from multiple accounts
4. 📖 **Read the schema docs**: See `/supabase/README.md` for detailed schema info
5. 🚀 **Deploy**: When ready, deploy your app and use production Supabase credentials

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client Docs](https://supabase.com/docs/reference/javascript/introduction)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## Support

Need help? Check these resources:

- [Supabase Discord](https://discord.supabase.com) - Active community support
- [GitHub Discussions](https://github.com/supabase/supabase/discussions) - Technical Q&A
- [Stack Overflow](https://stackoverflow.com/questions/tagged/supabase) - Tag: `supabase`

---

**Ready to start?** Go to [app.supabase.com](https://app.supabase.com) and create your project! 🚀
