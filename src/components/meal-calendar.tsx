import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { motion, AnimatePresence } from 'framer-motion';
import type { MealPlan, CompletedMeal, DayProgress } from '@/types/domain';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Calendar, Check, X, ChartBar } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { format, parseISO, isSameDay } from 'date-fns';

interface MealCalendarProps {
  mealPlan: MealPlan;
}

export function MealCalendar({ mealPlan }: MealCalendarProps) {
  const [completedMeals, setCompletedMeals] = useKV<CompletedMeal[]>('completed_meals', []);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const getCompletedMealsForDay = (date: string): CompletedMeal[] => {
    return (completedMeals || []).filter(cm => cm.date === date);
  };

  const getDayProgress = (date: string): DayProgress | null => {
    const dayMeals = getCompletedMealsForDay(date);
    if (dayMeals.length === 0) return null;

    const totalNutrition = dayMeals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.nutrition.calories,
        protein_g: acc.protein_g + meal.nutrition.protein_g,
        carbohydrates_g: acc.carbohydrates_g + meal.nutrition.carbohydrates_g,
        fats_g: acc.fats_g + meal.nutrition.fats_g,
      }),
      { calories: 0, protein_g: 0, carbohydrates_g: 0, fats_g: 0 }
    );

    const totalCost = dayMeals.reduce((acc, meal) => acc + meal.cost_eur, 0);

    return {
      date,
      completed_meals: dayMeals,
      total_nutrition: totalNutrition,
      total_cost: totalCost,
      meals_count: dayMeals.length,
    };
  };

  const isMealCompleted = (mealId: string, date: string): boolean => {
    return (completedMeals || []).some(
      cm => cm.meal_id === mealId && cm.date === date
    );
  };

  const handleToggleMeal = (dayNumber: number, mealId: string) => {
    const day = mealPlan.days.find(d => d.day_number === dayNumber);
    if (!day) return;

    const meal = day.meals.find(m => m.meal_id === mealId);
    if (!meal) return;

    const isCompleted = isMealCompleted(mealId, day.date);

    if (isCompleted) {
      setCompletedMeals(current =>
        (current || []).filter(cm => !(cm.meal_id === mealId && cm.date === day.date))
      );
      toast.success('Meal unmarked');
    } else {
      const completedMeal: CompletedMeal = {
        meal_id: mealId,
        plan_id: mealPlan.plan_id,
        completed_at: new Date().toISOString(),
        date: day.date,
        meal_type: meal.meal_type,
        recipe_name: meal.recipe_name,
        nutrition: meal.nutrition,
        cost_eur: meal.cost.meal_cost_eur,
      };

      setCompletedMeals(current => [...(current || []), completedMeal]);
      toast.success('Meal marked as done!');
    }
  };

  const getDayCompletionPercentage = (date: string): number => {
    const day = mealPlan.days.find(d => d.date === date);
    if (!day) return 0;

    const totalMeals = day.meals.length;
    const completedCount = day.meals.filter(m => isMealCompleted(m.meal_id, date)).length;
    
    return totalMeals > 0 ? Math.round((completedCount / totalMeals) * 100) : 0;
  };

  const selectedDayProgress = selectedDate ? getDayProgress(selectedDate) : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="text-primary" />
            Meal Tracking Calendar
          </CardTitle>
          <CardDescription>
            Mark meals as completed to track your daily macro intake
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {mealPlan.days.map(day => {
              const completionPercentage = getDayCompletionPercentage(day.date);
              const isSelected = selectedDate === day.date;
              const hasProgress = completionPercentage > 0;

              return (
                <motion.div
                  key={day.day_number}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: day.day_number * 0.05 }}
                >
                  <Card
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? 'ring-2 ring-primary' : ''
                    } ${hasProgress ? 'bg-accent/5' : ''}`}
                    onClick={() => setSelectedDate(day.date)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center justify-between">
                        <span>Day {day.day_number}</span>
                        {hasProgress && (
                          <Badge variant="secondary" className="text-xs">
                            {completionPercentage}%
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {format(parseISO(day.date), 'MMM d, yyyy')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${completionPercentage}%` }}
                          transition={{ duration: 0.5 }}
                          className="absolute left-0 top-0 h-full bg-primary rounded-full"
                        />
                      </div>
                      <div className="space-y-1">
                        {day.meals.map(meal => (
                          <div
                            key={meal.meal_id}
                            className="flex items-center gap-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleMeal(day.day_number, meal.meal_id);
                            }}
                          >
                            <Checkbox
                              checked={isMealCompleted(meal.meal_id, day.date)}
                              className="h-3 w-3"
                            />
                            <span className={`flex-1 truncate ${
                              isMealCompleted(meal.meal_id, day.date)
                                ? 'line-through text-muted-foreground'
                                : ''
                            }`}>
                              {meal.meal_type}
                            </span>
                            {isMealCompleted(meal.meal_id, day.date) && (
                              <Check size={12} className="text-primary" />
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {selectedDate && selectedDayProgress && (
              <motion.div
                key={selectedDate}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Separator className="my-6" />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-heading text-xl font-semibold">
                        {format(parseISO(selectedDate), 'EEEE, MMMM d')}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedDayProgress.meals_count} meal{selectedDayProgress.meals_count !== 1 ? 's' : ''} completed
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedDate(null)}
                    >
                      <X />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription className="text-xs">Calories</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-primary">
                          {Math.round(selectedDayProgress.total_nutrition.calories)}
                        </p>
                        <p className="text-xs text-muted-foreground">kcal</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription className="text-xs">Protein</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-primary">
                          {Math.round(selectedDayProgress.total_nutrition.protein_g)}
                        </p>
                        <p className="text-xs text-muted-foreground">grams</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription className="text-xs">Carbs</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-primary">
                          {Math.round(selectedDayProgress.total_nutrition.carbohydrates_g)}
                        </p>
                        <p className="text-xs text-muted-foreground">grams</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription className="text-xs">Fats</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-primary">
                          {Math.round(selectedDayProgress.total_nutrition.fats_g)}
                        </p>
                        <p className="text-xs text-muted-foreground">grams</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Completed Meals</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[200px]">
                        <div className="space-y-3">
                          {selectedDayProgress.completed_meals.map((meal, idx) => (
                            <div key={idx} className="p-3 bg-muted/50 rounded-lg space-y-2">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-sm">{meal.recipe_name}</p>
                                  <p className="text-xs text-muted-foreground capitalize">{meal.meal_type}</p>
                                </div>
                                <Badge variant="outline">€{meal.cost_eur.toFixed(2)}</Badge>
                              </div>
                              <div className="flex gap-4 text-xs text-muted-foreground">
                                <span>{Math.round(meal.nutrition.calories)} kcal</span>
                                <span>P: {Math.round(meal.nutrition.protein_g)}g</span>
                                <span>C: {Math.round(meal.nutrition.carbohydrates_g)}g</span>
                                <span>F: {Math.round(meal.nutrition.fats_g)}g</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  <Card className="bg-primary/5 border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <ChartBar className="text-primary" />
                        Daily Cost
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-primary">
                        €{selectedDayProgress.total_cost.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Total spent on completed meals
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
