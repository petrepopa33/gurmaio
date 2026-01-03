import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CheckCircle, Circle, CalendarBlank, PencilSimple, X, CopySimple, CalendarCheck } from '@phosphor-icons/react';
import type { Day, ScheduledDay } from '@/types/domain';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CopyWeekDialog } from '@/components/copy-week-dialog';

interface MealCalendarProps {
  mealPlan: {
    days: Day[];
  };
  scheduledDays: ScheduledDay[];
  onScheduleDay: (day: Day, selectedDate: string) => void;
  onUnscheduleDay: (date: string) => void;
  onChangeDayDate?: (oldDate: string, newDate: string, dayNumber: number) => void;
  onToggleComplete?: (date: string, isComplete: boolean) => void;
  onCopyWeek?: (sourceDates: string[], targetStartDate: string) => void;
  currentDate?: string;
}

export function MealCalendar({
  mealPlan,
  scheduledDays,
  onScheduleDay,
  onUnscheduleDay,
  onChangeDayDate,
  onToggleComplete,
  onCopyWeek,
  currentDate = new Date().toISOString().split('T')[0],
}: MealCalendarProps) {
  const [selectedDay, setSelectedDay] = useState<ScheduledDay | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState<string | null>(null);
  const [editingDayNumber, setEditingDayNumber] = useState<number | null>(null);
  const [copyWeekDialogOpen, setCopyWeekDialogOpen] = useState(false);

  const getScheduledDay = (dayNumber: number): ScheduledDay | undefined => {
    return scheduledDays.find(d => d.day_number === dayNumber);
  };

  const isDayScheduled = (dayNumber: number): boolean => {
    return getScheduledDay(dayNumber) !== undefined;
  };

  const handleDayClick = (dayNumber: number) => {
    const scheduled = getScheduledDay(dayNumber);
    setSelectedDay(scheduled || null);
  };

  const handleDateSelect = (day: Day, selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const isCurrentlyScheduled = isDayScheduled(day.day_number);
    const scheduled = getScheduledDay(day.day_number);
    
    if (editingDayNumber === day.day_number && isCurrentlyScheduled && scheduled && onChangeDayDate) {
      onChangeDayDate(scheduled.date, dateString, day.day_number);
      setEditingDayNumber(null);
      setDatePickerOpen(null);
      return;
    }
    
    if (day.day_number === 1 && !isCurrentlyScheduled) {
      const startDate = new Date(selectedDate);
      
      mealPlan.days.forEach((planDay) => {
        const dayOffset = planDay.day_number - 1;
        const dayDate = new Date(startDate);
        dayDate.setDate(dayDate.getDate() + dayOffset);
        const dayDateString = format(dayDate, 'yyyy-MM-dd');
        
        onScheduleDay(planDay, dayDateString);
      });
      
      setDatePickerOpen(null);
      return;
    }
    
    onScheduleDay(day, dateString);
    setDatePickerOpen(null);
  };

  const handleEditDate = (dayNumber: number) => {
    setEditingDayNumber(dayNumber);
    setDatePickerOpen(`day-${dayNumber}`);
  };

  const handleCancelEdit = () => {
    setEditingDayNumber(null);
    setDatePickerOpen(null);
  };

  const handleUnscheduleDay = (dayNumber: number) => {
    const scheduled = getScheduledDay(dayNumber);
    if (!scheduled) return;
    
    onUnscheduleDay(scheduled.date);
  };

  const handleToggleComplete = (dayNumber: number) => {
    const scheduled = getScheduledDay(dayNumber);
    if (!scheduled || !onToggleComplete) return;
    
    onToggleComplete(scheduled.date, !scheduled.is_completed);
  };

  const getUsedDates = (): string[] => {
    return scheduledDays.map(d => d.date);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 bg-muted/50 border rounded-lg p-4 mb-4">
        <p className="text-sm text-muted-foreground flex-1">
          📅 <strong>Quick Start:</strong> Click the calendar icon on Day 1 to choose your start date. All subsequent days will automatically be scheduled in order. 
          {scheduledDays.length > 0 && ' You can edit any scheduled date using the pencil icon or remove days using the X button.'}
        </p>
        {scheduledDays.length > 0 && onCopyWeek && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCopyWeekDialogOpen(true)}
            className="shrink-0"
          >
            <CopySimple className="mr-2" size={16} />
            Copy Week
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {mealPlan.days.map((day, index) => {
          const isScheduled = isDayScheduled(day.day_number);
          const scheduled = getScheduledDay(day.day_number);
          const displayDate = scheduled?.date || day.date;
          const isCurrent = displayDate === currentDate;
          const isComplete = scheduled?.is_completed || false;

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
                  isScheduled && 'border-primary bg-primary/5',
                  isComplete && 'border-accent bg-accent/5',
                  isCurrent && 'ring-2 ring-accent',
                  selectedDay && scheduled?.date === selectedDay.date && 'ring-2 ring-primary'
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Day {day.day_number}</p>
                    <p className="text-sm font-semibold">
                      {isScheduled && scheduled ? (
                        new Date(scheduled.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })
                      ) : (
                        <span className="text-muted-foreground">Not scheduled...</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {isScheduled ? (
                      <>
                        <Popover
                          open={datePickerOpen === `day-${day.day_number}`}
                          onOpenChange={(open) => {
                            if (!open) {
                              setEditingDayNumber(null);
                            }
                            setDatePickerOpen(open ? `day-${day.day_number}` : null);
                          }}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditDate(day.day_number)}
                              className="h-8 w-8 p-0 hover:bg-primary/10"
                              title="Change date"
                            >
                              <PencilSimple size={16} />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="end">
                            <div className="p-3 border-b">
                              <p className="text-sm font-medium">Change Date for Day {day.day_number}</p>
                              <p className="text-xs text-muted-foreground">Select a new date</p>
                            </div>
                            <Calendar
                              mode="single"
                              selected={scheduled ? new Date(scheduled.date) : undefined}
                              onSelect={(date) => handleDateSelect(day, date)}
                              disabled={(date) => {
                                const dateStr = format(date, 'yyyy-MM-dd');
                                const usedDates = getUsedDates().filter(d => d !== scheduled?.date);
                                return usedDates.includes(dateStr);
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUnscheduleDay(day.day_number)}
                          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                          title="Remove from schedule"
                        >
                          <X size={16} />
                        </Button>
                        {onToggleComplete && (
                          <Button
                            size="sm"
                            variant={isComplete ? "default" : "outline"}
                            onClick={() => handleToggleComplete(day.day_number)}
                            className="h-8 w-8 p-0"
                            title={isComplete ? "Mark as incomplete" : "Mark as complete"}
                          >
                            {isComplete ? (
                              <CheckCircle weight="fill" size={20} />
                            ) : (
                              <Circle size={20} />
                            )}
                          </Button>
                        )}
                      </>
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
                            title="Schedule this day"
                          >
                            <CalendarBlank size={20} />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                          {day.day_number === 1 && (
                            <div className="p-3 border-b bg-primary/5">
                              <p className="text-sm font-medium">Schedule All Days</p>
                              <p className="text-xs text-muted-foreground">Choose start date - remaining days will auto-schedule</p>
                            </div>
                          )}
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
                      {isScheduled ? scheduled?.meals_count : day.meals.length}
                    </span>
                  </div>
                  {isScheduled && scheduled && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Calories:</span>
                        <span className="font-medium">
                          {Math.round(scheduled.total_nutrition.calories)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Cost:</span>
                        <span className="font-medium">€{scheduled.total_cost.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>

                {isScheduled && (
                  <div className="mt-3 pt-3 border-t">
                    <div className={cn(
                      "flex items-center gap-2 text-xs",
                      isComplete ? "text-accent font-medium" : "text-primary"
                    )}>
                      {isComplete ? (
                        <>
                          <CheckCircle weight="fill" size={14} />
                          <span>Completed</span>
                        </>
                      ) : (
                        <>
                          <CalendarCheck size={14} />
                          <span>Scheduled</span>
                        </>
                      )}
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
              <div className={cn(
                "flex items-center gap-2 text-sm font-medium",
                selectedDay.is_completed ? "text-accent" : "text-primary"
              )}>
                {selectedDay.is_completed ? (
                  <>
                    <CheckCircle weight="fill" size={16} />
                    <span>Completed</span>
                  </>
                ) : (
                  <>
                    <CalendarCheck size={16} />
                    <span>Scheduled</span>
                  </>
                )}
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
              <p className="text-sm font-semibold mb-3">Scheduled Meals</p>
              <div className="space-y-2">
                {selectedDay.meals.map((meal) => (
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

      {onCopyWeek && (
        <CopyWeekDialog
          open={copyWeekDialogOpen}
          onOpenChange={setCopyWeekDialogOpen}
          completedDays={scheduledDays.map(sd => ({
            date: sd.date,
            completed_meals: sd.meals.map(m => ({
              meal_id: m.meal_id,
              plan_id: sd.plan_id,
              completed_at: sd.scheduled_at,
              date: sd.date,
              meal_type: m.meal_type,
              recipe_name: m.recipe_name,
              nutrition: m.nutrition,
              cost_eur: m.cost_eur,
            })),
            total_nutrition: sd.total_nutrition,
            total_cost: sd.total_cost,
            meals_count: sd.meals_count,
          }))}
          onCopyWeek={onCopyWeek}
        />
      )}
    </div>
  );
}
