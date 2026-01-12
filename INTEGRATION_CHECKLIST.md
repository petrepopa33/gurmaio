# Supabase Integration Checklist

Use this checklist to track your progress integrating Supabase into the application.

## Setup Phase

- [ ] Created Supabase account
- [ ] Created new Supabase project
- [ ] Copied project URL and anon key
- [ ] Created `.env` file with credentials
- [ ] Ran `supabase-schema.sql` in Supabase SQL Editor
- [ ] Verified tables created in Supabase Table Editor
- [ ] Verified RLS policies are enabled
- [ ] Dev server starts without environment variable errors

## Core Features Migration

### User Profile
- [ ] Replaced `useKV` with Supabase service
- [ ] Profile loads on app start
- [ ] Profile saves to Supabase
- [ ] Profile persists after page refresh
- [ ] Tested with demo mode handling

### Meal Plans
- [ ] Current meal plan loads from Supabase
- [ ] Generating new plan saves to Supabase
- [ ] Plan persists after refresh
- [ ] Can save up to 5 plans
- [ ] Saved plans load correctly
- [ ] Deleting saved plan works
- [ ] Loading saved plan works

### Meal Preferences (Likes/Dislikes)
- [ ] Preferences load on app start
- [ ] Liking a meal saves to Supabase
- [ ] Disliking a meal saves to Supabase
- [ ] Toggling preference works
- [ ] Removing preference works
- [ ] Preferences persist after refresh

### Portion Adjustments
- [ ] Adjustments load on app start
- [ ] Changing portion saves to Supabase
- [ ] Resetting to 1x removes from Supabase
- [ ] Adjustments persist after refresh

### Calendar & Scheduling
- [ ] Scheduled days load on app start
- [ ] Scheduling a day saves to Supabase
- [ ] Unscheduling a day deletes from Supabase
- [ ] Changing day date updates in Supabase
- [ ] Schedule persists after refresh
- [ ] Copy week function works

### Progress Tracking
- [ ] Day progress loads on app start
- [ ] Marking day complete saves to Supabase
- [ ] Marking day incomplete updates Supabase
- [ ] Progress persists after refresh
- [ ] Streak counter works correctly
- [ ] Today card shows correct data

### Badges
- [ ] Badges load on app start
- [ ] Earning new badge saves to Supabase
- [ ] Badge earned notification shows
- [ ] Badges persist after refresh
- [ ] Badge images save correctly

### Shopping Lists
- [ ] Shopping list generates from meal plan
- [ ] List saves to Supabase
- [ ] Checking items updates Supabase
- [ ] Deleting items updates Supabase
- [ ] List persists after refresh

### Meal Prep Plans
- [ ] Prep plan generates from meal plan
- [ ] Prep plan saves to Supabase
- [ ] Prep plan loads correctly
- [ ] Prep plan persists after refresh

## Authentication

- [ ] User can sign up with email/password
- [ ] User can log in with email/password
- [ ] User session persists after refresh
- [ ] Logout clears session
- [ ] Demo mode handling (if kept)
- [ ] Tested with multiple user accounts
- [ ] Each user only sees their own data

## Data Management

- [ ] Account deletion removes all user data
- [ ] Verified data deletion in Supabase dashboard
- [ ] No orphaned data left after account deletion
- [ ] Data scoping verified with 2+ accounts

## User Experience

- [ ] Loading states show during data fetch
- [ ] Error states handled gracefully
- [ ] Toast notifications for success/error
- [ ] No flickering on page load
- [ ] Optimistic UI updates where appropriate
- [ ] Network errors handled

## Edge Cases

- [ ] First-time user (no profile) handled
- [ ] Offline behavior handled
- [ ] Concurrent edits (multiple tabs) tested
- [ ] Large data sets (5 saved plans, many preferences) tested
- [ ] Empty states display correctly
- [ ] Data migration from old KV storage (if needed)

## Performance

- [ ] Initial data load is fast
- [ ] No unnecessary re-fetches
- [ ] Mutations don't block UI
- [ ] Large meal plans load quickly
- [ ] No memory leaks

## Security

- [ ] No service role key in client code
- [ ] Only anon key is used
- [ ] RLS policies tested with multiple users
- [ ] Users cannot access other users' data
- [ ] All sensitive operations require authentication

## Testing

- [ ] Tested full user flow end-to-end
- [ ] Tested with fresh Supabase project
- [ ] Tested with existing data
- [ ] Tested on different browsers
- [ ] Tested on mobile devices
- [ ] Tested network error scenarios

## Documentation

- [ ] Updated main README with Supabase info
- [ ] Environment variables documented
- [ ] Setup instructions are clear
- [ ] Common errors documented
- [ ] Added troubleshooting guide

## Production Ready

- [ ] Environment variables configured in production
- [ ] Production Supabase project created
- [ ] Database schema deployed to production
- [ ] RLS policies verified in production
- [ ] Backup strategy in place
- [ ] Monitoring/logging configured
- [ ] Rate limiting reviewed

## Clean Up

- [ ] Removed all `useKV` references
- [ ] Removed `window.spark.kv` calls
- [ ] Removed unused imports
- [ ] Removed old localStorage code
- [ ] Code formatted and linted
- [ ] No console errors
- [ ] No TypeScript errors

---

## Progress Tracker

**Setup**: ☐ Not Started | ☑ In Progress | ✓ Complete  
**Core Features**: ☐ Not Started | ☑ In Progress | ✓ Complete  
**Authentication**: ☐ Not Started | ☑ In Progress | ✓ Complete  
**Production**: ☐ Not Started | ☑ In Progress | ✓ Complete  

---

## Notes & Issues

Use this space to track issues encountered during integration:

```
Date: YYYY-MM-DD
Issue: Description of issue
Solution: How it was resolved
```

---

## Next Steps After Completion

1. Monitor Supabase dashboard for errors
2. Set up database backups
3. Configure monitoring/alerting
4. Optimize queries if needed
5. Consider adding indexes for frequently queried fields
6. Review and optimize RLS policies
7. Set up staging environment
8. Plan data migration if moving from existing system
