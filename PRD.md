# Gurmaio: Cloud-Native Meal Planning Platform

A production-ready, cloud-native meal planning application that generates budget-aware, nutrition-accurate meal plans with explicit cost calculation at all levels.

**Experience Qualities**:
1. **Transparent** - Every cost and nutritional value is calculated deterministically and displayed clearly to build user trust
2. **Precise** - Budget calculations account for real-world shopping constraints (minimum quantities, unit conversions, rounding)
3. **Efficient** - Edge-first architecture delivers sub-200ms response times globally with stateless, horizontally scalable design

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This is a commercial-grade product requiring multiple sophisticated engines (nutrition aggregation, cost calculation, shopping list generation), external service integrations (AI for meal composition, Supabase for persistence), strict separation of concerns (thin client, deterministic backend), and compliance with app store requirements and GDPR regulations.

## Essential Features

### User Profile & Onboarding
- **Functionality**: Capture budget, meal plan duration, dietary preferences, and restrictions
- **Purpose**: Establish constraints for AI generation and enable personalized meal planning
- **Trigger**: First app launch or profile editing
- **Progression**: Welcome screen → Budget input → Duration selection → Dietary preferences → Allergen selection → Save profile
- **Success criteria**: Profile saved to Supabase, validation prevents invalid budgets, preferences correctly constrain meal generation

### Meal Plan Generation
- **Functionality**: Generate a multi-day meal plan with per-meal nutrition, per-meal cost, daily totals, and full plan totals
- **Purpose**: Provide users with a complete, budget-compliant eating schedule
- **Trigger**: User taps "Generate Plan" or completes onboarding
- **Progression**: Tap generate → Loading state → AI generates composition → Backend calculates nutrition → Backend calculates costs → Check budget → Display plan with full breakdown
- **Success criteria**: Plan stays within budget (or shows explicit overage), all nutrition values sum correctly, costs include shopping reality (minimum quantities)

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

### Account Management
- **Functionality**: Delete all user data (GDPR compliant)
- **Purpose**: Comply with data protection regulations and user privacy rights
- **Trigger**: User taps "Delete Account" in settings
- **Progression**: Settings → Delete Account → Confirmation dialog → API call → Data deleted → Logout
- **Success criteria**: All user data removed from database, user logged out, cannot access app without re-registering

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
