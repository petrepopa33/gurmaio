import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { MealPlan, Meal, MealPortionAdjustment } from '@/types/domain';
import { Barbell, FireSimple, ChartBar, CurrencyDollar, Repeat, ThumbsUp, ThumbsDown, Minus, Plus } from '@phosphor-icons/react';
import { useLanguage } from '@/hooks/use-language';
import { translateMeal, translateIngredient } from '@/lib/i18n/content-translations';
import type { Language } from '@/lib/i18n/translations';
import { InfoTooltip } from '@/components/info-tooltip';
import { DISCLAIMERS, INFO_LABELS, VIEW_MODES, getViewModeContext } from '@/lib/disclaimers';

interface MealPlanViewProps {
  mealPlan: MealPlan;
  onSwapMeal?: (mealId: string, dayNumber: number) => Promise<void>;
  onLikeMeal?: (mealId: string, meal: Meal) => void;
  onDislikeMeal?: (mealId: string, meal: Meal) => void;
  mealPreferences?: Map<string, 'like' | 'dislike'>;
  portionAdjustments?: Map<string, number>;
  onPortionAdjustment?: (mealId: string, multiplier: number) => void;
}

type ViewMode = 'total' | 'average';

export function MealPlanView({ 
  mealPlan, 
  onSwapMeal, 
  onLikeMeal, 
  onDislikeMeal, 
  mealPreferences,
  portionAdjustments,
  onPortionAdjustment 
}: MealPlanViewProps) {
  const { language, t } = useLanguage();
  const [selectedDay, setSelectedDay] = useState(mealPlan.days[0]?.day_number.toString() || '1');
  const [viewMode, setViewMode] = useState<ViewMode>('average');

  const days = mealPlan.metadata.days;

  const totalCaloriesFromMacros = (mealPlan.plan_totals.protein_g * 4) + 
                                  (mealPlan.plan_totals.carbohydrates_g * 4) + 
                                  (mealPlan.plan_totals.fats_g * 9);
  
  const proteinPercentage = Math.round((mealPlan.plan_totals.protein_g * 4 / totalCaloriesFromMacros) * 100);
  const carbsPercentage = Math.round((mealPlan.plan_totals.carbohydrates_g * 4 / totalCaloriesFromMacros) * 100);
  const fatsPercentage = Math.round((mealPlan.plan_totals.fats_g * 9 / totalCaloriesFromMacros) * 100);

  const displayValues = viewMode === 'total' 
    ? {
        calories: mealPlan.plan_totals.calories,
        protein: mealPlan.plan_totals.protein_g,
        carbs: mealPlan.plan_totals.carbohydrates_g,
        fats: mealPlan.plan_totals.fats_g,
        cost: mealPlan.plan_totals.total_cost_eur,
      }
    : {
        calories: Math.round(mealPlan.plan_totals.calories / days),
        protein: Math.round(mealPlan.plan_totals.protein_g / days),
        carbs: Math.round(mealPlan.plan_totals.carbohydrates_g / days),
        fats: Math.round(mealPlan.plan_totals.fats_g / days),
        cost: mealPlan.plan_totals.total_cost_eur / days,
      };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-heading text-lg font-semibold">Nutrition Summary</h3>
            <InfoTooltip 
              content={DISCLAIMERS.nutrition.full} 
              ariaLabel={INFO_LABELS.nutritionInfo}
            />
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs whitespace-nowrap">
                {getViewModeContext(viewMode, days)}
              </Badge>
              <Badge variant="outline" className="text-xs whitespace-nowrap">
                {DISCLAIMERS.general.short}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">View:</span>
            <div className="flex border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === 'total' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('total')}
                className="rounded-none"
                aria-label={INFO_LABELS.viewToggle}
              >
                {VIEW_MODES.total}
              </Button>
              <Button
                variant={viewMode === 'average' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('average')}
                className="rounded-none"
                aria-label={INFO_LABELS.viewToggle}
              >
                {VIEW_MODES.average}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <FireSimple size={16} />
              <span>{t.calories}</span>
            </div>
            <div className="font-heading text-2xl font-bold tabular-nums">
              {displayValues.calories.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {viewMode === 'total' ? `${days} ${t.days}` : 'per day'}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Barbell size={16} />
              <span>{t.protein}</span>
            </div>
            <div className="font-heading text-2xl font-bold tabular-nums">
              {displayValues.protein}g
            </div>
            <div className="text-xs text-muted-foreground">{proteinPercentage}% of calories</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <ChartBar size={16} />
              <span>{t.carbs}</span>
            </div>
            <div className="font-heading text-2xl font-bold tabular-nums">
              {displayValues.carbs}g
            </div>
            <div className="text-xs text-muted-foreground">{carbsPercentage}% of calories</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <ChartBar size={16} />
              <span>{t.fats}</span>
            </div>
            <div className="font-heading text-2xl font-bold tabular-nums">
              {displayValues.fats}g
            </div>
            <div className="text-xs text-muted-foreground">{fatsPercentage}% of calories</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <CurrencyDollar size={16} />
              <span>{t.totalCost}</span>
              <InfoTooltip 
                content={DISCLAIMERS.cost.full} 
                ariaLabel={INFO_LABELS.costInfo}
              />
            </div>
            <div className="font-heading text-2xl font-bold tabular-nums text-accent">
              €{displayValues.cost.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              {viewMode === 'total' ? `${days} ${t.days}` : 'per day'}
            </div>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Macro Distribution</div>
          <div className="flex gap-1 h-4 rounded-full overflow-hidden">
            <div 
              className="bg-blue-500" 
              style={{ width: `${proteinPercentage}%` }}
              title={`Protein: ${proteinPercentage}%`}
            />
            <div 
              className="bg-green-500" 
              style={{ width: `${carbsPercentage}%` }}
              title={`Carbs: ${carbsPercentage}%`}
            />
            <div 
              className="bg-amber-500" 
              style={{ width: `${fatsPercentage}%` }}
              title={`Fats: ${fatsPercentage}%`}
            />
          </div>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Protein {proteinPercentage}%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Carbs {carbsPercentage}%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span>Fats {fatsPercentage}%</span>
            </div>
          </div>
        </div>
      </Card>

      <Tabs value={selectedDay} onValueChange={setSelectedDay}>
        <TabsList className="w-full grid" style={{ gridTemplateColumns: `repeat(${mealPlan.days.length}, 1fr)` }}>
          {mealPlan.days.map((day) => (
            <TabsTrigger key={day.day_number} value={day.day_number.toString()}>
              {t.day} {day.day_number}
            </TabsTrigger>
          ))}
        </TabsList>

        {mealPlan.days.map((day) => (
          <TabsContent key={day.day_number} value={day.day_number.toString()} className="space-y-4">
            <Card className="p-4 bg-muted/30">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div>
                  <div className="text-sm text-muted-foreground">{t.calories}</div>
                  <div className="font-heading font-semibold tabular-nums">{day.totals.calories}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{t.protein}</div>
                  <div className="font-heading font-semibold tabular-nums">{day.totals.protein_g}g</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{t.carbs}</div>
                  <div className="font-heading font-semibold tabular-nums">{day.totals.carbohydrates_g}g</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{t.fats}</div>
                  <div className="font-heading font-semibold tabular-nums">{day.totals.fats_g}g</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{t.cost}</div>
                  <div className="font-heading font-semibold tabular-nums text-accent">€{day.totals.cost_eur.toFixed(2)}</div>
                </div>
              </div>
            </Card>

            <div className="space-y-3">
              {day.meals.map((meal) => (
                <MealCard 
                  key={meal.meal_id} 
                  meal={meal} 
                  dayNumber={day.day_number}
                  language={language} 
                  t={t}
                  onSwap={onSwapMeal}
                  onLike={onLikeMeal}
                  onDislike={onDislikeMeal}
                  currentPreference={mealPreferences?.get(meal.meal_id)}
                  portionMultiplier={portionAdjustments?.get(meal.meal_id) || 1}
                  onPortionAdjustment={onPortionAdjustment}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function MealCard({ 
  meal, 
  dayNumber,
  language, 
  t,
  onSwap,
  onLike,
  onDislike,
  currentPreference,
  portionMultiplier,
  onPortionAdjustment
}: { 
  meal: Meal; 
  dayNumber: number;
  language: Language; 
  t: any;
  onSwap?: (mealId: string, dayNumber: number) => Promise<void>;
  onLike?: (mealId: string, meal: Meal) => void;
  onDislike?: (mealId: string, meal: Meal) => void;
  currentPreference?: 'like' | 'dislike';
  portionMultiplier: number;
  onPortionAdjustment?: (mealId: string, multiplier: number) => void;
}) {
  const [isSwapping, setIsSwapping] = useState(false);
  const [localMultiplier, setLocalMultiplier] = useState(portionMultiplier);

  const handleSwap = async () => {
    if (!onSwap) return;
    
    setIsSwapping(true);
    try {
      await onSwap(meal.meal_id, dayNumber);
    } finally {
      setIsSwapping(false);
    }
  };

  const handleLike = () => {
    if (onLike) {
      onLike(meal.meal_id, meal);
    }
  };

  const handleDislike = () => {
    if (onDislike) {
      onDislike(meal.meal_id, meal);
    }
  };

  const handlePortionChange = (newMultiplier: number) => {
    const validMultiplier = Math.max(0.25, Math.min(5, newMultiplier));
    setLocalMultiplier(validMultiplier);
    if (onPortionAdjustment) {
      onPortionAdjustment(meal.meal_id, validMultiplier);
    }
  };

  const adjustedMeal = {
    ...meal,
    nutrition: {
      calories: Math.round(meal.nutrition.calories * localMultiplier),
      protein_g: Math.round(meal.nutrition.protein_g * localMultiplier),
      carbohydrates_g: Math.round(meal.nutrition.carbohydrates_g * localMultiplier),
      fats_g: Math.round(meal.nutrition.fats_g * localMultiplier),
    },
    cost: {
      meal_cost_eur: meal.cost.meal_cost_eur * localMultiplier,
    },
    ingredients: meal.ingredients.map(ing => ({
      ...ing,
      quantity_g: Math.round(ing.quantity_g * localMultiplier),
      nutrition: {
        calories: Math.round(ing.nutrition.calories * localMultiplier),
        protein_g: Math.round(ing.nutrition.protein_g * localMultiplier),
        carbohydrates_g: Math.round(ing.nutrition.carbohydrates_g * localMultiplier),
        fats_g: Math.round(ing.nutrition.fats_g * localMultiplier),
      },
      cost_eur: ing.cost_eur * localMultiplier,
    })),
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <Accordion type="single" collapsible>
        <AccordionItem value="meal" className="border-none">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex flex-col w-full gap-3">
              <div className="flex items-center justify-between w-full pr-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="capitalize">
                      {t[meal.meal_type]}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant={currentPreference === 'like' ? 'default' : 'ghost'}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike();
                        }}
                        className="h-7 w-7 p-0"
                        title="Like this meal"
                      >
                        <ThumbsUp size={14} weight={currentPreference === 'like' ? 'fill' : 'regular'} />
                      </Button>
                      <Button
                        size="sm"
                        variant={currentPreference === 'dislike' ? 'destructive' : 'ghost'}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDislike();
                        }}
                        className="h-7 w-7 p-0"
                        title="Dislike this meal"
                      >
                        <ThumbsDown size={14} weight={currentPreference === 'dislike' ? 'fill' : 'regular'} />
                      </Button>
                      {onSwap && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSwap();
                          }}
                          disabled={isSwapping}
                          className="h-7 px-2"
                          title="Swap this meal"
                        >
                          <Repeat size={14} />
                        </Button>
                      )}
                    </div>
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-left">
                    {translateMeal(meal.recipe_name, language)}
                  </h3>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-sm text-muted-foreground hidden md:flex items-center gap-4">
                    <span className="tabular-nums">{adjustedMeal.nutrition.calories} cal</span>
                    <span className="tabular-nums">{adjustedMeal.nutrition.protein_g}g P</span>
                    <span className="tabular-nums">{adjustedMeal.nutrition.carbohydrates_g}g C</span>
                    <span className="tabular-nums">{adjustedMeal.nutrition.fats_g}g F</span>
                  </div>
                  <div className="font-heading font-semibold text-accent tabular-nums">
                    €{adjustedMeal.cost.meal_cost_eur.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className="px-6 pb-4">
            <Separator className="mb-4" />
            
            <div className="md:hidden mb-4 flex gap-4 text-sm text-muted-foreground">
              <span className="tabular-nums">{adjustedMeal.nutrition.calories} cal</span>
              <span className="tabular-nums">{adjustedMeal.nutrition.protein_g}g P</span>
              <span className="tabular-nums">{adjustedMeal.nutrition.carbohydrates_g}g C</span>
              <span className="tabular-nums">{adjustedMeal.nutrition.fats_g}g F</span>
            </div>

            {onPortionAdjustment && (
              <div className="mb-6 bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Portion Size</div>
                  <div className="text-sm text-muted-foreground">
                    {localMultiplier === 1 
                      ? 'Standard serving' 
                      : `${(localMultiplier * 100).toFixed(0)}% of standard`}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePortionChange(localMultiplier - 0.25)}
                    disabled={localMultiplier <= 0.25}
                    className="h-8 w-8 p-0"
                  >
                    <Minus size={16} />
                  </Button>
                  <Input
                    type="number"
                    value={localMultiplier}
                    onChange={(e) => handlePortionChange(parseFloat(e.target.value) || 1)}
                    min="0.25"
                    max="5"
                    step="0.25"
                    className="w-20 text-center tabular-nums"
                  />
                  <span className="text-sm text-muted-foreground">×</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePortionChange(localMultiplier + 0.25)}
                    disabled={localMultiplier >= 5}
                    className="h-8 w-8 p-0"
                  >
                    <Plus size={16} />
                  </Button>
                  {localMultiplier !== 1 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handlePortionChange(1)}
                      className="ml-2"
                    >
                      Reset
                    </Button>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Adjust portion size between 0.25× and 5× of the standard serving
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <h4 className="font-heading font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                  {t.ingredients}
                  <InfoTooltip 
                    content="Ingredient quantities and nutrition values are calculated based on the recipe. Actual values may vary based on product brands and measurements."
                    ariaLabel={INFO_LABELS.ingredientBreakdown}
                  />
                </h4>
                <div className="space-y-1">
                  {adjustedMeal.ingredients.map((ingredient) => (
                    <div
                      key={ingredient.ingredient_id}
                      className="grid grid-cols-1 md:grid-cols-12 gap-2 py-3 px-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
                    >
                      <div className="md:col-span-4 font-medium">
                        {translateIngredient(ingredient.name, language)}
                      </div>
                      <div className="md:col-span-2 text-sm text-muted-foreground tabular-nums">
                        {ingredient.quantity_g}g
                      </div>
                      <div className="md:col-span-5 flex gap-3 text-xs text-muted-foreground">
                        <span className="tabular-nums">{ingredient.nutrition.calories} cal</span>
                        <span className="tabular-nums">{ingredient.nutrition.protein_g}g P</span>
                        <span className="tabular-nums">{ingredient.nutrition.carbohydrates_g}g C</span>
                        <span className="tabular-nums">{ingredient.nutrition.fats_g}g F</span>
                      </div>
                      <div className="md:col-span-1 text-right font-medium text-accent tabular-nums">
                        €{ingredient.cost_eur.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {meal.cooking_instructions && meal.cooking_instructions.length > 0 && (
                <div className="space-y-3 bg-primary/5 rounded-xl p-4 border border-primary/10">
                  <h4 className="font-heading font-semibold text-base text-primary flex items-center gap-2">
                    <span className="text-xl">👨‍🍳</span>
                    {t.cookingInstructions}
                  </h4>
                  <ol className="space-y-3">
                    {meal.cooking_instructions.map((instruction, index) => (
                      <li key={index} className="flex gap-3">
                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-sm">
                          {index + 1}
                        </span>
                        <span className="flex-1 text-sm leading-relaxed pt-1">{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
