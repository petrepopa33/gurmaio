# Meal Prep Planning Feature

## Overview
The Weekly Meal Prep Planning feature helps users efficiently prepare multiple meals at once through batch cooking recommendations, detailed task breakdowns, and optimized scheduling.

## Key Features

### 1. Batch Cooking Identification
- **Automatic Detection**: Scans meal plan to identify recipes that appear 2+ times
- **Efficiency Calculation**: Computes time and cost savings from batch cooking
- **Smart Aggregation**: Combines ingredients across multiple servings

### 2. Prep Schedule Generation
- **Multi-Session Planning**: Splits 7-day plans into Sunday and Wednesday prep sessions
- **Task Breakdown**: Organizes prep work by category:
  - Chopping (all vegetable prep upfront)
  - Marinating
  - Cooking (batch and individual)
  - Portioning
  - Storage
- **Time Estimates**: Realistic prep and cook time calculations

### 3. Storage & Reheating Guidance
- **Container Requirements**: Calculates needed storage containers
- **Space Assessment**: Estimates fridge and freezer space needs
- **Storage Instructions**: Meal-specific storage guidelines and durations
- **Reheating Instructions**: Optimal reheating methods for each recipe type

### 4. Efficiency Insights
- **Time Savings**: Shows minutes/hours saved through batch cooking (typically 30-40%)
- **Cost Savings**: Calculates reduced waste and bulk buying benefits
- **Pro Tips**: Contextual advice for successful meal prep

## Technical Implementation

### Data Models
Located in `src/types/domain.ts`:
- `MealPrepPlan`: Container for entire prep plan
- `PrepDay`: Single prep session with tasks
- `PrepTask`: Individual prep activity
- `BatchCookingGroup`: Identified batch cooking opportunity

### Core Logic
Located in `src/lib/meal-prep-generator.ts`:

#### Key Functions
- `generateMealPrepPlan()`: Main entry point
- `identifyBatchCookingOpportunities()`: Finds recipes to batch
- `generatePrepSchedule()`: Creates day-by-day schedule
- `calculateTotalEfficiency()`: Computes savings
- `calculateStorageRequirements()`: Determines space needs

#### Algorithms
**Batch Detection**:
```typescript
// Groups meals by recipe name
// Only creates batch group if recipe appears 2+ times
// Aggregates all ingredients for batch quantity
```

**Time Calculation**:
```typescript
// Base prep time: 30 minutes
// Base cook time: 45 minutes
// Additional servings: +50% prep time, +30% cook time per serving
// Time saved = (individual time × servings) - batch time
```

**Cost Savings**:
```typescript
// €0.15 per shared ingredient per additional serving
// Accounts for reduced waste and bulk purchasing
```

### UI Components
Located in `src/components/meal-prep-view.tsx`:

#### Layout Structure
1. **Summary Cards**: Total prep time, time saved, containers needed, cost saved
2. **Pro Tips Section**: Contextual advice grid
3. **Batch Cooking Groups**: Expandable cards showing:
   - Recipe details and servings
   - Prep and cook time breakdown
   - Ingredient list
   - Storage and reheating instructions
   - Efficiency savings
4. **Prep Schedule**: Accordion with prep day breakdowns:
   - Session-specific tips
   - Task cards by category
   - Time estimates per task
   - Ingredient lists and instructions

#### Visual Design
- Uses green/accent colors for efficiency indicators
- Progress bars for time visualization
- Badge system for task categories
- Consistent spacing and typography

## User Flow

### Generating a Prep Plan
1. User generates or loads a meal plan
2. Clicks "Generate Prep Plan" button
3. System analyzes meal plan for batch opportunities
4. Prep plan generates in 1-2 seconds
5. User switches to "Meal Prep" tab
6. Views batch cooking groups and schedule

### Using the Prep Plan
1. **Review Summary**: Check total time and requirements
2. **Read Tips**: Understand key best practices
3. **Batch Cooking Groups**: Identify efficiency opportunities
4. **Prep Schedule**: 
   - Expand prep day (e.g., Sunday)
   - Review session tips
   - Work through tasks in order
   - Check off completed tasks
5. **Storage**: Follow container and space guidance

## Integration Points

### State Management
```typescript
// In App.tsx
const [mealPrepPlan, setMealPrepPlan] = useKV<MealPrepPlan | null>('current_meal_prep_plan', null);
```

### Lifecycle
- Created: When user clicks "Generate Prep Plan"
- Reset: When meal plan is regenerated or new plan loaded
- Persisted: Stored in useKV for session continuity

### Related Features
- **Meal Plan**: Source data for prep planning
- **Shopping List**: Complementary feature (buy ingredients → prep meals)
- **Meal Substitution**: Regenerates prep plan when meals change

## Edge Cases Handled

1. **No Batch Opportunities**: Shows single-task prep schedule
2. **Short Plans (< 3 days)**: Single prep session instead of split
3. **Missing Prep Plan**: Tab is disabled until generated
4. **Plan Regeneration**: Clears old prep plan to avoid inconsistency

## Future Enhancements

### Potential Additions
- **Custom Prep Days**: Let users choose their prep days
- **Partial Prep**: Mark tasks as complete and adjust schedule
- **Equipment Requirements**: List needed pots, pans, appliances
- **Grocery Pickup Integration**: Sync shopping list with prep schedule
- **Prep Reminders**: Calendar integration for prep day notifications
- **Photo Instructions**: Visual guides for storage and portioning
- **Nutrition Timing**: Optimize meal freshness based on consumption schedule
- **Cooking Skill Level**: Adjust time estimates based on user experience

### Analytics Opportunities
- Track which batch groups users actually use
- Measure time saved vs. predicted
- Identify most popular prep patterns
- Optimize scheduling algorithms based on usage data

## Performance Considerations

### Generation Time
- Typical: < 500ms for 7-day plan
- Complexity: O(n²) for recipe grouping, where n = number of meals
- Optimization: Early return for plans with no duplicates

### Memory Usage
- Lightweight data structures
- Ingredient aggregation uses Maps for efficiency
- No recursive structures that could cause stack overflow

### UI Rendering
- Accordion pattern prevents rendering all tasks at once
- Lazy loading of task details
- Efficient React re-renders through proper memoization

## Testing Recommendations

### Unit Tests
- Batch detection with various recipe patterns
- Time calculation accuracy
- Storage requirement calculations
- Edge cases (no batches, all batches, etc.)

### Integration Tests
- Full flow: meal plan → prep plan generation
- State persistence across sessions
- Tab switching and disabled states

### User Testing
- Time estimate accuracy (real cooking tests)
- Instruction clarity
- Storage guidance usefulness
- Overall workflow satisfaction

## Accessibility

### Keyboard Navigation
- Tab through all interactive elements
- Accordion controls via Enter/Space
- Focus indicators on all focusable elements

### Screen Readers
- Proper ARIA labels on all components
- Semantic HTML structure
- Descriptive button text

### Visual Considerations
- High contrast ratios for all text
- Icons paired with text labels
- Clear visual hierarchy
- Sufficient touch target sizes (44×44px minimum)

## Documentation Status
✅ Feature implemented
✅ Types defined
✅ Core logic complete
✅ UI component created
✅ Integration with App.tsx
✅ PRD updated
✅ Edge cases handled
✅ Technical documentation (this file)

## Related Files
- `src/types/domain.ts` - Type definitions
- `src/lib/meal-prep-generator.ts` - Core logic
- `src/components/meal-prep-view.tsx` - UI component
- `src/App.tsx` - Integration
- `PRD.md` - Product requirements
