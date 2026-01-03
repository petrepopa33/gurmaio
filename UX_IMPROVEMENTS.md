# UX & Store Readiness Improvements for Gurmaio

## MUST HAVE (Store-Blocking Issues)

### 1. ✅ Calories & Macros Clarity
**Problem**: Users cannot distinguish between total values (e.g., 10,000 calories for 5 days) and daily averages (2,000 cal/day)

**Solution**:
- Add toggle button "View: Total | Average per Day" above nutrition summary
- Show both contexts clearly:
  - "Total (5 days): 10,500 cal"
  - "Average per day: 2,100 cal"
- Apply toggle to all macro values (protein, carbs, fats, cost)

**UI Copy**:
- Toggle labels: "Total Plan" / "Daily Average"
- Subtitle text: "Total (5 days)" or "Average per day"

---

### 2. ✅ Disclaimers & Transparency
**Problem**: No visible disclaimers about estimates - critical for App Store/Play Store approval

**Solution**:
- Add info icon (ⓘ) next to "Calories & Nutrition" header
- Tooltip on hover/tap with disclaimer text
- Footer section with full disclaimers
- Settings page with "About These Estimates" section

**UI Copy**:
```
Tooltip (next to nutrition values):
"These values are estimates based on standardized nutrition databases. Actual values may vary based on brands, portions, and preparation methods."

Footer Disclaimer:
"⚠️ Important: Nutrition and cost estimates are for informational purposes only. Actual values may vary. Always consult a healthcare professional before making dietary changes. Gurmaio does not provide medical or nutritional advice."

Cost Disclaimer (tooltip):
"💰 Cost estimates are based on average grocery prices and may vary by store, location, and product brands. Actual shopping costs may differ."

AI Usage Notice:
"🤖 This app uses AI (OpenAI GPT-4) to suggest meal combinations. All nutrition and cost calculations are performed deterministically (not by AI) using verified databases."
```

---

### 3. ✅ Meal & Ingredient Transparency
**Problem**: Ingredients are hidden in accordion - users may not trust "black box" meals

**Solution**:
- Already implemented: Accordion shows ingredients with cost
- Enhancement: Add ingredient nutrition breakdown (not just meal totals)
- Show per-ingredient: name, quantity, calories, protein, carbs, fats, cost

**Current State**: ✅ Already shows ingredients with quantity and cost
**Enhancement**: Add individual ingredient nutrition (already in data model, just display it)

**UI Copy**:
- Section header: "Ingredient Details"
- Columns: "Ingredient | Quantity | Nutrition | Cost"

---

### 4. ✅ Reviewer Accessibility (Store Approval)
**Problem**: Reviewers may see login wall and reject the app

**Solution**:
- ✅ Already implemented: "Continue as Guest" button
- Enhancement: Add banner above login explaining guest access
- Show clear value prop before asking for login

**UI Copy**:
```
Banner on welcome screen (above login):
"✨ No login required to try Gurmaio
Generate meal plans as a guest. Log in to save your plans across devices."

Empty state (when not logged in):
"💡 Guest Mode: You can generate and view meal plans without logging in. To save plans and access them across devices, please log in with GitHub."
```

---

### 5. ✅ Privacy & Compliance (Store Requirements)
**Problem**: Missing required legal/privacy information for app stores

**Solution**:
- Add footer with links to Privacy Policy, Terms of Service, Account Deletion
- Add "Legal" section in settings/profile dialog
- Account deletion flow

**UI Copy**:
```
Footer Links:
- Privacy Policy
- Terms of Service
- Delete My Data
- Contact Support

Account Deletion Dialog:
Title: "Delete All Your Data"
Body: "This will permanently delete your profile, meal plans, and all saved data. This action cannot be undone."
Confirm Button: "Delete Everything"
```

---

## NICE TO HAVE (Post-Launch Enhancements)

### 6. Average Daily View Toggle
**Enhancement**: Default view shows daily averages (more intuitive for users)

### 7. Nutrition Education Tooltips
**Enhancement**: Add educational tooltips explaining macros:
- "Protein: 4 calories per gram. Essential for muscle repair and growth."
- "Carbohydrates: 4 calories per gram. Primary energy source."
- "Fats: 9 calories per gram. Essential for hormone production and vitamin absorption."

### 8. Cost Transparency Badge
**Enhancement**: Add badge to meals: "Estimated" or "Verified" pricing

### 9. Trust Indicators
**Enhancement**: 
- "✓ Nutrition values calculated from USDA database"
- "✓ Costs based on [Region] average prices"
- "✓ Generated with verified algorithms"

### 10. First-Time User Tutorial
**Enhancement**: Quick 3-step tutorial on first launch:
1. "Set your budget and dietary preferences"
2. "We calculate nutrition accurately"
3. "Get a complete shopping list"

---

## Implementation Priority

### Phase 1: Store-Blocking (MUST COMPLETE)
1. ✅ Add disclaimers (info icons + tooltips + footer)
2. ✅ Add Total/Average toggle for nutrition display
3. ✅ Enhance ingredient transparency (show nutrition per ingredient)
4. ✅ Add footer with legal links (Privacy, Terms, Delete Account)
5. ✅ Improve guest access messaging

### Phase 2: Trust & Clarity (HIGH PRIORITY)
6. ✅ Add "About Estimates" section to settings
7. ✅ Add AI transparency notice
8. ✅ Improve empty states for unauthenticated users

### Phase 3: Polish (NICE TO HAVE)
9. Education tooltips for macros
10. Trust badges
11. First-time tutorial

---

## Remaining Store-Blocking Issues

### Critical (Must Fix Before Launch)
- ❌ **Privacy Policy Page**: Must create actual page/link (not just footer link)
- ❌ **Terms of Service Page**: Must create actual page/link
- ❌ **Account Deletion Flow**: Must implement actual deletion (currently just placeholder)
- ❌ **Data Export**: GDPR requires ability to export user data

### Important (Should Fix)
- ⚠️ **Error Handling**: Add user-friendly error messages for all API failures
- ⚠️ **Loading States**: Ensure all actions have clear loading indicators
- ⚠️ **Accessibility**: Add ARIA labels for screen readers

### Optional (Post-Launch)
- 💡 Age-gating for users under 13 (check local regulations)
- 💡 Regional pricing switches (€ / $ / £)
- 💡 Feedback mechanism for incorrect estimates

---

## UI Copy Master List

### Disclaimers
```
NUTRITION_DISCLAIMER = "Nutrition values are estimates based on standardized databases. Actual values may vary by brand, portion size, and preparation method. Consult a healthcare professional for personalized nutrition advice."

COST_DISCLAIMER = "Cost estimates are based on average grocery prices and may vary by location, store, and product brand."

AI_DISCLAIMER = "This app uses AI (OpenAI GPT-4) to suggest meal combinations. All nutrition and cost calculations are deterministic and performed by verified algorithms (not AI)."

MEDICAL_DISCLAIMER = "Gurmaio provides meal planning recommendations for informational purposes only. This is not medical, nutritional, or health advice. Always consult qualified healthcare professionals before making dietary changes."

ESTIMATE_NOTICE = "All values shown are estimates"
```

### Toggle Labels
```
TOGGLE_TOTAL = "Total Plan"
TOGGLE_AVERAGE = "Daily Average"
TOGGLE_CONTEXT_TOTAL = "Total ({days} days)"
TOGGLE_CONTEXT_AVERAGE = "Average per day"
```

### Trust Indicators
```
VERIFIED_NUTRITION = "Calculated using USDA nutrition database"
VERIFIED_ALGORITHM = "Deterministic calculations"
AI_ASSISTED = "AI-assisted meal suggestions"
```

### Empty States
```
GUEST_EXPLAINER = "You're using guest mode. Generate meal plans without logging in, or sign in to save plans across devices."
NO_SAVED_PLANS = "No saved meal plans yet. Generate your first plan and click 'Save Plan' to keep it for later."
```

### Accessibility
```
INFO_ICON_LABEL = "More information about estimates"
TOGGLE_LABEL = "Switch between total plan and daily average view"
NUTRITION_BREAKDOWN_LABEL = "Nutrition breakdown for this meal"
```
