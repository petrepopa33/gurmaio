import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { MealPlan, Meal } from '@/types/domain';
import { Barbell, FireSimple, ChartBar, CurrencyDollar } from '@phosphor-icons/react';
import { useLanguage } from '@/hooks/use-language';
import { translateMeal, translateIngredient } from '@/lib/i18n/content-translations';
import type { Language } from '@/lib/i18n/translations';

interface MealPlanViewProps {
  mealPlan: MealPlan;
}

export function MealPlanView({ mealPlan }: MealPlanViewProps) {
  const { language, t } = useLanguage();
  const [selectedDay, setSelectedDay] = useState(mealPlan.days[0]?.day_number.toString() || '1');

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <FireSimple size={16} />
              <span>{t.calories}</span>
            </div>
            <div className="font-heading text-2xl font-bold tabular-nums">
              {mealPlan.plan_totals.calories.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">{t.total}</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Barbell size={16} />
              <span>{t.protein}</span>
            </div>
            <div className="font-heading text-2xl font-bold tabular-nums">
              {mealPlan.plan_totals.protein_g}g
            </div>
            <div className="text-xs text-muted-foreground">{t.total}</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <ChartBar size={16} />
              <span>{t.carbs}</span>
            </div>
            <div className="font-heading text-2xl font-bold tabular-nums">
              {mealPlan.plan_totals.carbohydrates_g}g
            </div>
            <div className="text-xs text-muted-foreground">{t.total}</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <ChartBar size={16} />
              <span>{t.fats}</span>
            </div>
            <div className="font-heading text-2xl font-bold tabular-nums">
              {mealPlan.plan_totals.fats_g}g
            </div>
            <div className="text-xs text-muted-foreground">{t.total}</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <CurrencyDollar size={16} />
              <span>{t.totalCost}</span>
            </div>
            <div className="font-heading text-2xl font-bold tabular-nums text-accent">
              €{mealPlan.plan_totals.total_cost_eur.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              {mealPlan.metadata.days} {t.days}
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
                <MealCard key={meal.meal_id} meal={meal} language={language} t={t} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function MealCard({ meal, language, t }: { meal: Meal; language: Language; t: any }) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <Accordion type="single" collapsible>
        <AccordionItem value="meal" className="border-none">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center justify-between w-full pr-4">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="capitalize">
                  {t[meal.meal_type]}
                </Badge>
                <h3 className="font-heading text-lg font-semibold text-left">
                  {translateMeal(meal.recipe_name, language)}
                </h3>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-sm text-muted-foreground hidden md:flex items-center gap-4">
                  <span className="tabular-nums">{meal.nutrition.calories} cal</span>
                  <span className="tabular-nums">{meal.nutrition.protein_g}g P</span>
                  <span className="tabular-nums">{meal.nutrition.carbohydrates_g}g C</span>
                  <span className="tabular-nums">{meal.nutrition.fats_g}g F</span>
                </div>
                <div className="font-heading font-semibold text-accent tabular-nums">
                  €{meal.cost.meal_cost_eur.toFixed(2)}
                </div>
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className="px-6 pb-4">
            <Separator className="mb-4" />
            
            <div className="md:hidden mb-4 flex gap-4 text-sm text-muted-foreground">
              <span className="tabular-nums">{meal.nutrition.calories} cal</span>
              <span className="tabular-nums">{meal.nutrition.protein_g}g P</span>
              <span className="tabular-nums">{meal.nutrition.carbohydrates_g}g C</span>
              <span className="tabular-nums">{meal.nutrition.fats_g}g F</span>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <h4 className="font-heading font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                  {t.ingredients}
                </h4>
                {meal.ingredients.map((ingredient) => (
                  <div
                    key={ingredient.ingredient_id}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-medium">
                        {translateIngredient(ingredient.name, language)}
                      </span>
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {ingredient.quantity_g}g
                      </span>
                    </div>
                    <div className="text-right font-medium text-accent tabular-nums">
                      €{ingredient.cost_eur.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {meal.cooking_instructions && meal.cooking_instructions.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-heading font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    {t.cookingInstructions}
                  </h4>
                  <ol className="space-y-2">
                    {meal.cooking_instructions.map((instruction, index) => (
                      <li key={index} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </span>
                        <span className="flex-1 text-sm leading-relaxed pt-0.5">{instruction}</span>
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
