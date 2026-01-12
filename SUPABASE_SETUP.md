# Supabase Setup Instructions

This application uses Supabase as its backend for authentication and data persistence.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. A new Supabase project created

## Setup Steps

### 1. Create a Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter a project name (e.g., "gurmaio")
5. Generate a strong database password (save this!)
6. Select a region close to your users
7. Wait for the project to be ready (~2 minutes)

### 2. Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")

### 3. Set Environment Variables

Create a `.env` file in the root of your project (or add to your existing `.env`):

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important:** Never commit your `.env` file to version control. It should be in `.gitignore`.

### 4. Run the Database Schema

1. In your Supabase project dashboard, go to **SQL Editor**
2. Click **New query**
3. Copy the entire contents of `supabase-schema.sql` from this repository
4. Paste it into the SQL editor
5. Click **Run** (or press Ctrl/Cmd + Enter)
6. You should see "Success. No rows returned" - this is correct!

### 5. Configure Authentication (Optional)

If you want to enable email/password authentication:

1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. Enable **Email** provider
3. Configure email templates if desired (or use defaults)

For OAuth providers (Google, GitHub, etc.):

1. Go to **Authentication** → **Providers**
2. Enable the provider you want
3. Follow the provider-specific setup instructions
4. Add the callback URL to your OAuth app: `https://your-project-ref.supabase.co/auth/v1/callback`

### 6. Verify Setup

1. Start your development server: `npm run dev`
2. The app should load without errors
3. Try creating an account
4. Check your Supabase dashboard → **Table Editor** to see if data is being created

## Database Structure

The application uses the following tables:

- **profiles** - User meal planning preferences
- **meal_plans** - Generated meal plans
- **meal_preferences** - User likes/dislikes for specific meals
- **portion_adjustments** - Custom portion sizes per meal
- **scheduled_days** - Calendar scheduling for meal plans
- **day_progress** - Completed meals tracking
- **badges** - Achievement badges earned
- **shopping_lists** - Shopping lists per meal plan
- **meal_prep_plans** - Meal prep schedules

## Row Level Security (RLS)

All tables have RLS enabled, ensuring users can only access their own data. The policies are automatically created by the schema script.

## Troubleshooting

### "Missing Supabase environment variables" Error

- Make sure your `.env` file exists and has both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart your development server after creating/updating `.env`

### Authentication Not Working

- Check that Email provider is enabled in Supabase Authentication settings
- Verify your environment variables are correct
- Check the browser console for detailed error messages

### Data Not Persisting

- Verify the SQL schema was run successfully
- Check RLS policies are in place (they should be created by the schema)
- Verify the user is authenticated before trying to save data
- Check the browser console and Supabase logs for errors

### "Permission denied" Errors

- This usually means RLS policies weren't created properly
- Re-run the entire schema script
- Make sure you're authenticated when accessing data

## Support

For Supabase-specific issues, check:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [Supabase GitHub Discussions](https://github.com/supabase/supabase/discussions)
