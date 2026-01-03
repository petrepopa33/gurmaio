# Gurmaio: Cloud-Native Meal Planning Platform

A production-ready, cloud-native meal planning application that generates budget-aware, nutrition-accurate meal plans with explicit cost calculation at all levels.

**Experience Qualities**:
1. **Transparent** - Every cost and nutritional value is calculated deterministically and displayed clearly to build user trust, with explicit disclaimers about estimates
2. **Precise** - Budget calculations account for real-world shopping constraints (minimum quantities, unit conversions, rounding)
3. **Efficient** - Edge-first architecture delivers sub-200ms response times globally with stateless, horizontally scalable design
4. **Store-Ready** - Compliant with App Store and Google Play requirements including privacy policies, data deletion, and clear AI usage disclosure

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This is a commercial-grade product requiring multiple sophisticated engines (nutrition aggregation, cost calculation, shopping list generation), external service integrations (AI for meal composition, Supabase for persistence), strict separation of concerns (thin client, deterministic backend), and compliance with app store requirements and GDPR regulations.

## Essential Features

### User Profile & Onboarding
- **Functionality**: Capture budget, meal plan duration, dietary preferences, restrictions, personal metrics for automatic calorie calculation, and macro distribution targets
- **Purpose**: Establish constraints for AI generation, enable personalized meal planning, calculate scientifically-accurate calorie targets, and define specific macronutrient goals (e.g., high protein for muscle gain)
- **Trigger**: First app launch or profile editing
- **Progression**: Welcome screen → Budget input → Duration selection → Nutrition goals (weight, height, age, sex, activity level, objective) → Auto-calculated calorie target display → Macro targets selection (Balanced, High Protein, Low Carb, Keto, Endurance, or Custom) → Dietary preferences → Allergen selection → Cuisine preferences → Save profile
- **Success criteria**: Profile saved with all metrics, calorie target calculated using Mifflin-St Jeor equation, macro percentages validated to sum to 100%, validation prevents invalid inputs, preferences correctly constrain meal generation, users can toggle between automatic and manual calorie entry, users can select preset macro splits or define custom percentages

### Meal Plan Generation
- **Functionality**: Generate a multi-day meal plan with per-meal nutrition, per-meal cost, daily totals, full plan totals, and adherence to specific macro percentage targets
- **Purpose**: Provide users with a complete, budget-compliant eating schedule that meets their specific macronutrient goals (e.g., 40% protein for muscle building, 5% carbs for keto)
- **Trigger**: User taps "Generate Plan" or completes onboarding
- **Progression**: Tap generate → Loading state → AI generates composition with macro constraints → Backend calculates nutrition → Backend calculates costs → Validate macro percentages → Check budget → Display plan with full breakdown including macro distribution visualization
- **Success criteria**: Plan stays within budget (or shows explicit overage), all nutrition values sum correctly, macro percentages closely match user's targets (within 5%), costs include shopping reality (minimum quantities), visual macro distribution chart shows actual percentages achieved

### Nutrition & Cost Breakdown
- **Functionality**: Display hierarchical view of nutrition and cost (ingredient → meal → day → plan)
- **Purpose**: Build trust through transparency and enable informed decision-making
- **Trigger**: View generated meal plan
- **Progression**: Plan overview → Tap day → View meals → Tap meal → See ingredients with individual nutrition/cost
- **Success criteria**: All values are deterministic, sums are accurate, units are clear, currency is localized

### Shopping List Generation
- **Functionality**: Aggregate all ingredients across all days, normalize units, apply minimum-buy logic, calculate realistic grocery basket cost
- **Purpose**: Provide actionable shopping guidance with accurate total cost
- **Trigger**: User taps "Shopping List" from active meal plan
- **Progression**: Tap shopping list → Aggregate ingredients → Normalize units → Apply minimum quantities → Display list with estimated cost
- **Success criteria**: No duplicate ingredients, quantities are realistic (e.g., "2 onions" not "137g onion"), total cost reflects actual grocery store purchases

### Shopping List Export
- **Functionality**: Export shopping list to popular grocery delivery services (Instacart, Amazon Fresh, Walmart) or as downloadable files (CSV, Plain Text)
- **Purpose**: Enable seamless integration with users' preferred grocery shopping platforms and workflows
- **Trigger**: User taps "Export to Grocery Service" button from shopping list view
- **Progression**: Tap export → Choose service → Content copied to clipboard or file downloaded → Paste into grocery service app or open file
- **Success criteria**: Export formats are service-appropriate, clipboard copy works reliably, file downloads succeed, exported data is complete and formatted correctly

### User Authentication & Session Management
- **Functionality**: GitHub OAuth login/logout with persistent user sessions and profile display
- **Purpose**: Enable personalized data persistence across devices and secure meal plan storage
- **Trigger**: User clicks "Log in" button on welcome screen or avatar dropdown in header
- **Progression**: Click login → GitHub OAuth flow → Return to app with session → Avatar displays in header with dropdown menu (username, email, logout option)
- **Success criteria**: User session persists across page reloads, avatar displays correctly, logout clears session and redirects appropriately

### Meal Plan Saving & Persistence
- **Functionality**: Save generated meal plans to user's account for access across sessions and devices
- **Purpose**: Allow users to reference meal plans over time and maintain history of past plans
- **Trigger**: User clicks "Save Plan" button when viewing an active meal plan (only available when logged in)
- **Progression**: Generate meal plan → Click "Save Plan" → Plan saved to useKV storage → Visual confirmation (checkmark + "Saved" state) → Plan accessible in future sessions
- **Success criteria**: Saved plans persist across sessions, duplicate saves update existing plan, visual feedback confirms save action, unauthenticated users see appropriate message

### Saved Meal Plans History
- **Functionality**: View, load, and delete previously saved meal plans with full nutrition and cost details
- **Purpose**: Allow users to revisit past meal plans, compare different plans, and reload successful plans without regenerating
- **Trigger**: User clicks "History" button in header (visible when logged in with saved plans)
- **Progression**: Click "History" → Dialog opens with sorted list of saved plans → View plan summaries with key metrics → Click "Load" to activate a plan OR click delete icon to remove from history
- **Success criteria**: Plans sorted newest first, load replaces current plan, delete removes from storage, empty state shown when no plans exist, visual indicators for over-budget plans

### Multi-Language Support (i18n)
- **Functionality**: Switch between EU languages (English, German, French, Spanish, Italian) with persistent language preference
- **Purpose**: Make the app accessible to users across Europe in their native language
- **Trigger**: User clicks language switcher button (globe icon) in header or welcome screen
- **Progression**: Click language switcher → Dropdown menu shows available languages with flags → Select language → UI updates immediately → Preference saved to user storage
- **Success criteria**: All UI text translates instantly, language preference persists across sessions, flag icons display correctly, translations maintain meaning and context

### Meal Substitution with Rating System
- **Functionality**: Swap individual meals within a generated meal plan while maintaining budget and nutritional constraints, with AI prioritizing user taste preferences learned from meal ratings
- **Purpose**: Provide flexibility and variety without regenerating entire meal plan, accommodate taste preferences and ingredient availability, learn user preferences over time to generate increasingly personalized substitutions
- **Trigger**: User clicks "Swap Meal" button when viewing meal details in expanded accordion
- **Progression**: View meal plan → Expand meal card → Rate meal 1-5 stars (optional) → Click "Swap Meal" → AI generates alternative meal using rating history to prefer liked ingredients/styles and avoid disliked ones → Meal replaced in plan → Plan totals recalculated → Shopping list reset → Success confirmation
- **Success criteria**: New meal respects remaining daily budget, macro targets maintained (±10%), meal type remains consistent, all nutrition and cost totals recalculate accurately, substitution stays within original meal's budget constraints, shopping list regenerates on next view, highly-rated meals influence future substitutions (preferred ingredients appear more often), low-rated meals/ingredients are avoided in future generations, rating feedback confirms user action

### Weekly Meal Prep Planning
- **Functionality**: Generate comprehensive meal prep schedules with batch cooking recommendations, task breakdowns, time estimates, and storage instructions to optimize weekly meal preparation
- **Purpose**: Help users efficiently prepare multiple meals at once, save time and money through batch cooking, provide actionable prep schedules, reduce food waste, and lower cooking overhead
- **Trigger**: User clicks "Generate Prep Plan" button from active meal plan view
- **Progression**: View meal plan → Click "Generate Prep Plan" → System identifies duplicate recipes and batch opportunities → Calculates efficiency savings → Generates 1-2 prep day schedules → Displays prep plan tab with batch cooking groups, task breakdowns, time estimates, storage requirements, and tips
- **Success criteria**: Identifies all recipes that appear 2+ times in the plan, calculates accurate time savings from batch cooking (30-40% reduction), generates realistic prep day schedules (Sunday and Wednesday for 7-day plans), breaks down tasks by category (chopping, cooking, portioning, storage), provides storage and reheating instructions for each batch, displays container requirements and space needs, shows efficiency savings in both time and cost, tasks are ordered logically by dependency, prep times are realistic and achievable

### Account Management
- **Functionality**: Delete all user data (GDPR compliant)
- **Purpose**: Comply with data protection regulations and user privacy rights
- **Trigger**: User taps "Delete Account" in settings
- **Progression**: Settings → Delete Account → Confirmation dialog → API call → Data deleted → Logout
- **Success criteria**: All user data removed from database, user logged out, cannot access app without re-registering

### Interactive Demo & Preview
- **Functionality**: Animated walkthrough showing app workflow with actual UI mockups, step-by-step feature showcase with smooth transitions, play/pause controls, and manual navigation
- **Purpose**: Help new users understand app value proposition instantly, reduce onboarding friction, increase conversion by showing real functionality before signup
- **Trigger**: Displayed prominently on welcome screen before authentication/profile setup
- **Progression**: Landing page loads → Animated demo auto-plays showing 4 key steps (budget entry → preference selection → AI generation → meal plan results) → User can pause, navigate steps manually, or switch between animated demo and feature overview
- **Success criteria**: Demo cycles through all 4 scenes with smooth transitions, animations are performant and non-janky, users can control playback, visual polish matches production app quality, demo loads quickly without blocking main content

## Edge Case Handling

- **Budget Impossible** - Show clear message if budget is too low for minimum viable nutrition, suggest minimum budget based on region
- **AI Generation Failure** - Retry with relaxed constraints (max 3 attempts), fallback to template-based plans
- **Ingredient Price Missing** - Fall back to category average, flag as "estimated" in UI
- **Allergen Conflict** - Validate AI output, reject plans containing user allergens, trigger regeneration
- **Network Offline** - Cache last meal plan, show cached data with offline indicator, queue mutations
- **Budget Exceeded After Generation** - Show explicit overage, offer to regenerate with stricter constraints or increase budget
- **Malformed AI Response** - Schema validation, detailed error logging, automatic retry with simplified prompt
- **Clipboard API Unavailable** - Fallback to legacy document.execCommand copy method for export functionality
- **Export Format Errors** - Graceful error handling with user-friendly messages, offer alternative export formats
- **Unauthenticated Save Attempt** - Show informative toast message prompting user to log in, disable save button for guests
- **Session Expiration** - Graceful handling of expired sessions with re-authentication prompt
- **Avatar Load Failure** - Display fallback with user's initials in colored background
- **Empty Saved Plans** - Show encouraging empty state with icon and call-to-action when no plans have been saved yet
- **Deleted Current Plan** - If user deletes the currently active meal plan from history, plan remains in current view but is removed from saved list
- **Incomplete Calorie Data** - When user hasn't filled all required fields for auto-calculation, system gracefully shows no calculated value and allows profile saving without target calories
- **Invalid Biometric Data** - Validate weight (30-300kg), height (100-250cm), age (13-120) to prevent calculation errors and nonsensical results
- **Manual vs Auto Calorie Toggle** - Preserve both manual entry and calculated values when switching modes, prevent data loss on accidental toggles
- **Language Fallback** - If a translation key is missing, fallback to English version to prevent broken UI
- **Browser Language Detection** - On first visit, detect browser language and auto-select if supported, otherwise default to English
- **No Batch Cooking Opportunities** - When no recipes repeat in meal plan, show prep schedule without batch groups, focus on sequential task breakdown
- **Single Day Meal Plans** - Skip multi-session prep scheduling for plans under 3 days, provide single-session prep guide instead
- **Missing Prep Plan on Tab Switch** - Disable prep tab when no prep plan exists, show helpful message prompting user to generate one
- **Meal Substitution Failure** - If AI fails to generate valid alternative, show error toast and keep original meal intact
- **Substitution Budget Violation** - If generated meal exceeds remaining budget, reject and retry with stricter cost constraints
- **Substitution Network Error** - Show user-friendly error, allow retry, preserve original meal plan state

## Calorie Calculation Algorithm

**Method**: Mifflin-St Jeor Equation (internationally recognized, clinically validated)

**Basal Metabolic Rate (BMR) Calculation**:
- Male: BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
- Female: BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161

**Total Daily Energy Expenditure (TDEE)**:
TDEE = BMR × Activity Multiplier

**Activity Multipliers**:
- Sedentary (little or no exercise): 1.2
- Light (exercise 1-3 days/week): 1.375
- Moderate (exercise 3-5 days/week): 1.55
- Active (exercise 6-7 days/week): 1.725
- Very Active (intense exercise daily): 1.9

**Objective Adjustments**:
- Lose Weight: TDEE - 500 cal/day (safe 0.5kg/week loss)
- Maintain Weight: TDEE (no adjustment)
- Gain Muscle: TDEE + 300 cal/day (lean bulk)

**Final Target Calories** = TDEE + Objective Adjustment (rounded to nearest whole number)

## Design Direction

The design should evoke precision, trust, and clarity - like a financial dashboard meets nutrition science. Users must feel confident that every number is accurate and every recommendation is within their means. The aesthetic should be modern, data-forward, and approachable (not clinical).

## Color Selection

**Primary Color**: Deep Forest Green (oklch(0.45 0.12 155)) - Communicates fresh ingredients, health, and growth. Used for primary actions, navigation, and key metrics.

**Secondary Colors**: 
- Warm Cream (oklch(0.96 0.01 85)) - Soft background for cards and sections, creates warmth without harshness
- Slate Gray (oklch(0.35 0.01 255)) - Supporting text, borders, and inactive states

**Accent Color**: Vibrant Citrus (oklch(0.72 0.18 85)) - Attention-grabbing highlight for budget alerts, CTAs, and cost breakdowns. Energetic without being alarming.

**Foreground/Background Pairings**:
- Primary (Deep Forest Green oklch(0.45 0.12 155)): White text (oklch(0.98 0 0)) - Ratio 7.2:1 ✓
- Accent (Vibrant Citrus oklch(0.72 0.18 85)): Dark Slate text (oklch(0.25 0.01 255)) - Ratio 8.1:1 ✓
- Background (Warm Cream oklch(0.96 0.01 85)): Dark Slate text (oklch(0.25 0.01 255)) - Ratio 12.4:1 ✓
- Muted (Light Gray oklch(0.92 0.005 255)): Medium Slate text (oklch(0.45 0.01 255)) - Ratio 5.8:1 ✓

## Font Selection

Typography should convey precision and approachability - clear data display with human warmth.

- **Primary**: Space Grotesk (headings, key numbers) - Technical precision with personality, excellent for displaying costs and nutrition values
- **Secondary**: Inter (body text, UI labels) - Highly legible, excellent for data-dense interfaces, works well at small sizes

**Typographic Hierarchy**:
- H1 (App Title): Space Grotesk Bold / 32px / tight letter-spacing (-0.02em)
- H2 (Section Headers): Space Grotesk SemiBold / 24px / normal letter-spacing
- H3 (Card Titles): Space Grotesk Medium / 18px / normal letter-spacing
- Body (Content): Inter Regular / 16px / line-height 1.6
- Small (Meta Info): Inter Regular / 14px / line-height 1.5
- Data (Numbers): Space Grotesk Medium / 16-20px / tabular-nums

## Animations

Animations should reinforce the sense of precision and calculation. Use purposeful, snappy transitions that communicate "computing" and "calculating" rather than arbitrary decoration. Key moments:
- Budget validation: Smooth progress bar with easing that suggests calculation
- Meal plan generation: Staggered reveal of cards (top to bottom) with slide-up + fade
- Cost updates: Number animations (counting up/down) for budget changes
- Navigation: Slide transitions with slight parallax for depth
- Success states: Gentle spring animation on checkmarks and success indicators

## Component Selection

**Components**:
- **Card**: Primary container for meals, days, and summaries - use elevated shadow for hierarchy
- **Progress**: Budget visualization (circular for overview, linear for detailed breakdown)
- **Tabs**: Day navigation in meal plan view
- **Accordion**: Expandable meal details within day view
- **Dialog**: Onboarding flow, account deletion confirmation
- **Sheet**: Bottom drawer for shopping list on mobile
- **Button**: Primary (generate plan), Secondary (view details), Ghost (navigation)
- **Input**: Budget entry, meal preferences with numeric validation
- **Badge**: Dietary tags, allergen warnings, budget status
- **Separator**: Visual breaks between days and sections
- **ScrollArea**: Ingredient lists, shopping lists

**Customizations**:
- Custom "Cost Display" component: Large number with currency symbol, subtle background gradient
- Custom "Nutrition Badge": Compact display of macros (C/P/F) with icons
- Custom "Meal Card": Recipe name + image thumbnail + nutrition summary + cost badge
- Custom "Budget Gauge": Circular progress with center display of remaining budget

**States**:
- Buttons: Solid primary (default), slight scale on hover, pressed state with darker shade, disabled with reduced opacity
- Inputs: Subtle border (default), accent border on focus, error state with red border + icon
- Cards: Flat (default), elevated shadow on hover, pressed state with slight scale-down

**Icon Selection**:
- Currency/Cost: CurrencyDollar, Coins
- Nutrition: AppleWhole, ChartBar, FireSimple
- Actions: Plus, ArrowRight, Check, X, Trash, Export
- Shopping: ShoppingCart, List, Basket
- User: User, Gear, SignOut

**Spacing**:
- Container padding: 6 (24px)
- Card padding: 4-6 (16-24px)
- Stack gaps: 4 (16px) for sections, 2 (8px) for related items
- Grid gaps: 4 (16px) for cards, 6 (24px) for major sections

**Mobile**:
- Stack all cards vertically below 768px
- Tabs convert to swipeable carousel
- Shopping list appears in bottom sheet instead of sidebar
- Reduce padding to 4 (16px) on mobile
- Larger touch targets (min 44px) for all interactive elements
- Sticky header with budget summary on scroll

## UX Enhancements & Store Readiness

### Transparency & Trust Features
**Implemented to build user confidence and meet app store requirements**

#### 1. Nutrition & Cost Disclaimers
- **Info tooltips** next to nutrition and cost headers with full disclaimers
- **Visual badges** indicating "All values are estimates"
- **Contextual disclaimers** in shopping list and meal plan views
- **Purpose**: Comply with app store requirements, set accurate expectations, build trust through honesty

#### 2. Total vs Average View Toggle
- **Functionality**: Toggle button to switch between "Total Plan" and "Daily Average" views
- **Context labels**: "Total (5 days)" or "Average per day" shown clearly
- **Applies to**: Calories, protein, carbs, fats, and cost
- **Purpose**: Prevent user confusion between total plan values and daily averages

#### 3. Enhanced Ingredient Transparency
- **Per-ingredient nutrition display**: Shows calories, protein, carbs, fats for each ingredient
- **Per-ingredient cost**: Clear cost breakdown at ingredient level
- **Expandable meal cards**: Accordion-style details with cooking instructions
- **Purpose**: Build trust by showing complete data transparency at all levels

#### 4. Guest Access Clarity
- **Prominent messaging**: "✨ No login required to try Gurmaio"
- **Value explanation**: Clear description of guest vs authenticated features
- **Visual indicators**: Banners explaining what guests can and cannot do
- **Purpose**: Ensure app reviewers can access core functionality without authentication

#### 5. Legal & Compliance Footer
- **Links to**: Privacy Policy, Terms of Service, Contact Support
- **Account deletion**: One-click access to data deletion flow
- **Medical disclaimer**: Clear statement that app is not medical advice
- **AI transparency**: Explanation of how AI is used (suggestions only, not calculations)
- **Purpose**: Meet App Store and Google Play compliance requirements

#### 6. Data Deletion Flow
- **Functionality**: Complete user data deletion with confirmation dialog
- **Scope**: Deletes profile, meal plans, shopping lists, and all saved data
- **Confirmation**: Two-step process with clear warning about irreversibility
- **Purpose**: GDPR compliance and app store requirements

### User Experience Polish

#### 7. Enhanced Empty States
- **No saved plans**: Encouraging message with clear next steps
- **Guest mode**: Informative banners explaining limitations and benefits
- **Purpose**: Guide users through the app experience gracefully

#### 8. Improved Information Architecture
- **Hierarchical data display**: Ingredient → Meal → Day → Plan with visual hierarchy
- **Tabular numbers**: All numeric values use tabular-nums for alignment
- **Consistent iconography**: Phosphor icons used throughout for clarity
- **Purpose**: Make complex nutritional data easy to scan and understand

### Compliance Checklist

✅ **Implemented**:
- Disclaimers for nutrition estimates
- Disclaimers for cost estimates
- AI usage transparency
- Medical advice disclaimer
- Guest access without authentication
- Account deletion flow
- Footer with legal links
- Info tooltips for contextual help
- Total/Average toggle for clarity
- Per-ingredient transparency

⚠️ **Required for Launch** (not implemented in code):
- Privacy Policy document (linked but not created)
- Terms of Service document (linked but not created)
- Actual backend data deletion API (currently frontend-only)

💡 **Nice to Have** (post-launch):
- Data export functionality (GDPR)
- Regional pricing switches (€ / $ / £)
- User feedback mechanism
- Tutorial for first-time users
