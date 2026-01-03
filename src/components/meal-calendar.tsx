import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle } from '@phosphor-icons/react';
import type { Day, DayProgress, CompletedMeal } from '@/types/domain';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MealCalendarProps {
  mealPlan: {
    days: Day[];
  };
  completedDays: DayProgress[];
  onToggleDayComplete: (day: Day, isComplete: boolean) => void;
  currentDate?: string;
}

export function MealCalendar({
  mealPlan,
  completedDays,
  onToggleDayComplete,
  currentDate = new Date().toISOString().split('T')[0],
}: MealCalendarProps) {
  const [selectedDay, setSelectedDay] = useState<DayProgress | null>(null);

  const isDayComplete = (date: string): boolean => {
    return completedDays.some(d => d.date === date);
  };

  const getDayProgress = (date: string): DayProgress | undefined => {
    return completedDays.find(d => d.date === date);
  };

  const handleDayClick = (day: Day) => {
    const dayProgress = getDayProgress(day.date);
    setSelectedDay(dayProgress || null);
  };

  const handleToggleComplete = (day: Day) => {
    const isCurrentlyComplete = isDayComplete(day.date);
    onToggleDayComplete(day, !isCurrentlyComplete);
    
    if (isCurrentlyComplete) {
      setSelectedDay(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {mealPlan.days.map((day, index) => {
          const isComplete = isDayComplete(day.date);
          const isCurrent = day.date === currentDate;
          const dayProgress = getDayProgress(day.date);

          return (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={cn(
                  'p-4 cursor-pointer transition-all hover:shadow-md',
                  isComplete && 'border-primary bg-primary/5',
                  isCurrent && 'ring-2 ring-accent',
                  selectedDay?.date === day.date && 'ring-2 ring-primary'
                )}
                onClick={() => handleDayClick(day)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Day {day.day_number}</p>
                    <p className="text-sm font-semibold">
                      {new Date(day.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={isComplete ? 'default' : 'outline'}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleComplete(day);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    {isComplete ? (
                      <CheckCircle weight="fill" size={20} />
                    ) : (
                      <Circle size={20} />
                    )}
                  </Button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Meals:</span>
                    <span className="font-medium">
                      {isComplete ? dayProgress?.meals_count : day.meals.length}
                    </span>
                  </div>
                  {isComplete && dayProgress && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Calories:</span>
                        <span className="font-medium">
                          {Math.round(dayProgress.total_nutrition.calories)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Cost:</span>
                        <span className="font-medium">€{dayProgress.total_cost.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>

                {isComplete && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center gap-2 text-xs text-primary">
                      <CheckCircle weight="fill" size={14} />
                      <span className="font-medium">Completed</span>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      {selectedDay && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {new Date(selectedDay.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </h3>
              <div className="flex items-center gap-2 text-sm text-primary font-medium">
                <CheckCircle weight="fill" size={16} />
                <span>Completed</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Meals</p>
                <p className="text-xl font-bold">{selectedDay.meals_count}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Calories</p>
                <p className="text-xl font-bold">
                  {Math.round(selectedDay.total_nutrition.calories)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Protein</p>
                <p className="text-xl font-bold">
                  {Math.round(selectedDay.total_nutrition.protein_g)}g
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Cost</p>
                <p className="text-xl font-bold">€{selectedDay.total_cost.toFixed(2)}</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm font-semibold mb-3">Completed Meals</p>
              <div className="space-y-2">
                {selectedDay.completed_meals.map((meal) => (
                  <div
                    key={meal.meal_id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium">{meal.recipe_name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{meal.meal_type}</p>
                    </div>
                    <div className="text-right text-xs">
                      <p className="font-medium">
                        {Math.round(meal.nutrition.calories)} cal
                      </p>
                      <p className="text-muted-foreground">€{meal.cost_eur.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
