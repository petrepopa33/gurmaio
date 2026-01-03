import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CheckCircle, Circle, CalendarBlank } from '@phosphor-icons/react';
import type { Day, DayProgress, CompletedMeal } from '@/types/domain';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface MealCalendarProps {
  mealPlan: {
    days: Day[];
  };
  completedDays: DayProgress[];
  onToggleDayComplete: (day: Day, isComplete: boolean, selectedDate: string) => void;
  currentDate?: string;
}

export function MealCalendar({
  mealPlan,
  completedDays,
  onToggleDayComplete,
  currentDate = new Date().toISOString().split('T')[0],
}: MealCalendarProps) {
  const [selectedDay, setSelectedDay] = useState<DayProgress | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState<string | null>(null);

  const getDayProgress = (dayNumber: number): DayProgress | undefined => {
    return completedDays.find(d => {
      const planDay = mealPlan.days.find(pd => pd.day_number === dayNumber);
      return planDay && d.date === planDay.date;
    });
  };

  const isDayComplete = (dayNumber: number): boolean => {
    return getDayProgress(dayNumber) !== undefined;
  };

  const handleDayClick = (dayNumber: number) => {
    const dayProgress = getDayProgress(dayNumber);
    setSelectedDay(dayProgress || null);
  };

  const handleDateSelect = (day: Day, selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const isCurrentlyComplete = isDayComplete(day.day_number);
    
    if (day.day_number === 1 && !isCurrentlyComplete) {
      const startDate = new Date(selectedDate);
      
      mealPlan.days.forEach((planDay) => {
        const dayOffset = planDay.day_number - 1;
        const dayDate = new Date(startDate);
        dayDate.setDate(dayDate.getDate() + dayOffset);
        const dayDateString = format(dayDate, 'yyyy-MM-dd');
        
        const updatedPlanDay = {
          ...planDay,
          date: dayDateString
        };
        
        onToggleDayComplete(updatedPlanDay, true, dayDateString);
      });
      
      setDatePickerOpen(null);
      return;
    }
    
    const updatedDay = {
      ...day,
      date: dateString
    };
    
    onToggleDayComplete(updatedDay, !isCurrentlyComplete, dateString);
    setDatePickerOpen(null);
  };

  const getUsedDates = (): string[] => {
    return completedDays.map(d => d.date);
  };

  return (
    <div className="space-y-6">
      <div className="bg-muted/50 border rounded-lg p-4 mb-4">
        <p className="text-sm text-muted-foreground">
          📅 <strong>Quick Start:</strong> Click the calendar icon on Day 1 to choose your start date. All subsequent days will automatically be scheduled in order. You can also schedule individual days separately if needed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {mealPlan.days.map((day, index) => {
          const isComplete = isDayComplete(day.day_number);
          const dayProgress = getDayProgress(day.day_number);
          const displayDate = dayProgress?.date || day.date;
          const isCurrent = displayDate === currentDate;

          return (
            <motion.div
              key={day.day_number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={cn(
                  'p-4 transition-all hover:shadow-md',
                  isComplete && 'border-primary bg-primary/5',
                  isCurrent && 'ring-2 ring-accent',
                  selectedDay && dayProgress?.date === selectedDay.date && 'ring-2 ring-primary'
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Day {day.day_number}</p>
                    <p className="text-sm font-semibold">
                      {isComplete && dayProgress ? (
                        new Date(dayProgress.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })
                      ) : (
                        <span className="text-muted-foreground">Choose date...</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {isComplete ? (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleDayClick(day.day_number)}
                        className="h-8 w-8 p-0"
                      >
                        <CheckCircle weight="fill" size={20} />
                      </Button>
                    ) : (
                      <Popover
                        open={datePickerOpen === `day-${day.day_number}`}
                        onOpenChange={(open) => setDatePickerOpen(open ? `day-${day.day_number}` : null)}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                          >
                            <CalendarBlank size={20} />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                          <Calendar
                            mode="single"
                            selected={undefined}
                            onSelect={(date) => handleDateSelect(day, date)}
                            disabled={(date) => {
                              const dateStr = format(date, 'yyyy-MM-dd');
                              return getUsedDates().includes(dateStr);
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
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
