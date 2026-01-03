import { MealPrepPlan } from '@/types/domain';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Clock, Package, CheckCircle, Flame, Timer, Lightbulb, Info } from '@phosphor-icons/react';
import { InfoTooltip } from '@/components/info-tooltip';

interface MealPrepViewProps {
  prepPlan: MealPrepPlan;
}

export function MealPrepView({ prepPlan }: MealPrepViewProps) {
  const totalTimeHours = Math.floor(prepPlan.total_prep_time_minutes / 60);
  const totalTimeMinutes = prepPlan.total_prep_time_minutes % 60;
  const containersPerDay = Math.round((prepPlan.storage_requirements.containers_needed / prepPlan.prep_schedule.length) * 10) / 10;
  const mealsPerSession = Math.round(prepPlan.prep_schedule.reduce((sum, day) => sum + day.meals_prepared, 0) / prepPlan.prep_schedule.length);

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Flame className="text-primary" weight="duotone" />
            Weekly Meal Prep Plan
          </CardTitle>
          <CardDescription>
            Cook in focused sessions to avoid daily prep. This approach helps streamline your week.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-card border">
              <Timer className="text-primary mt-1" size={28} weight="duotone" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">Estimated Weekly Prep Time</p>
                  <InfoTooltip content="This is the total time for one or two focused cooking sessions that replace daily cooking throughout the week. Actual time may vary based on kitchen setup and experience." />
                </div>
                <p className="text-lg font-semibold mt-1">
                  {totalTimeHours > 0 ? `${totalTimeHours}h ` : ''}{totalTimeMinutes}m
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Replaces cooking {mealsPerSession}+ meals individually
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-card border">
              <Package className="text-secondary-foreground mt-1" size={28} weight="duotone" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">Storage Containers</p>
                  <InfoTooltip content="Total airtight containers needed for the full plan. Use containers that seal well and are microwave-safe for reheating." />
                </div>
                <p className="text-lg font-semibold mt-1">
                  {prepPlan.storage_requirements.containers_needed} total
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ~{containersPerDay} per prep session
                </p>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 border border-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground flex items-start gap-2">
              <Info className="mt-0.5 flex-shrink-0" size={16} />
              <span>
                <strong>Why meal prep?</strong> Batching similar tasks (chopping, cooking, storing) in one session is often more efficient than preparing meals individually. You'll spend focused time upfront to simplify your weekday routine.
              </span>
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Lightbulb className="text-primary" weight="duotone" />
              Practical Tips
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {prepPlan.tips.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {prepPlan.batch_cooking_groups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="text-primary" weight="duotone" />
              Batch Cooking Opportunities
            </CardTitle>
            <CardDescription>
              These recipes appear multiple times in your plan—cook them together to reduce repetitive tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {prepPlan.batch_cooking_groups.map((group, idx) => (
                <Card key={group.group_id} className="border-accent/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{group.recipe_type}</CardTitle>
                        <CardDescription>
                          Make {group.batch_servings} servings at once • ~{group.total_prep_time_minutes + group.total_cook_time_minutes} minutes
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Prep Time</p>
                        <p className="font-medium">{group.total_prep_time_minutes} minutes</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Cook Time</p>
                        <p className="font-medium">{group.total_cook_time_minutes} minutes</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Ingredients ({group.shared_ingredients.length})</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {group.shared_ingredients.slice(0, 6).map((ing, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {ing.quantity_g}g {ing.name}
                          </Badge>
                        ))}
                        {group.shared_ingredients.length > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{group.shared_ingredients.length - 6} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Storage</p>
                      <p className="text-sm text-muted-foreground">{group.storage_instructions}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Reheating</p>
                      <p className="text-sm text-muted-foreground">{group.reheating_instructions}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="text-primary" weight="duotone" />
            Your Prep Schedule
          </CardTitle>
          <CardDescription>
            Suggested timing for batch cooking sessions—adjust based on your schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {prepPlan.prep_schedule.map((prepDay, idx) => {
              const dayTimeHours = Math.floor(prepDay.total_time_minutes / 60);
              const dayTimeMinutes = prepDay.total_time_minutes % 60;
              
              return (
                <AccordionItem key={idx} value={`day-${idx}`}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">{idx + 1}</span>
                        </div>
                        <div className="text-left">
                          <p className="font-semibold">{prepDay.prep_day}</p>
                          <p className="text-sm text-muted-foreground">
                            {prepDay.tasks.length} tasks • {prepDay.meals_prepared} meals
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">
                          {dayTimeHours > 0 ? `${dayTimeHours}h ` : ''}{dayTimeMinutes}m
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pl-4 pt-4">
                      {prepDay.tips.length > 0 && (
                        <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 space-y-2">
                          <p className="text-sm font-medium flex items-center gap-2">
                            <Lightbulb size={16} className="text-accent" />
                            Tips for this session
                          </p>
                          <ul className="space-y-1">
                            {prepDay.tips.map((tip, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-accent">•</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="space-y-3">
                        {prepDay.tasks.map((task, taskIdx) => (
                          <Card key={task.task_id} className="border-muted">
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                  <div className="mt-1">
                                    <Badge variant={task.category === 'cooking' ? 'default' : 'secondary'}>
                                      {task.category}
                                    </Badge>
                                  </div>
                                  <div>
                                    <CardTitle className="text-base">{task.task_name}</CardTitle>
                                    <CardDescription className="text-xs mt-1">
                                      {task.meal_ids.length} meal{task.meal_ids.length > 1 ? 's' : ''}
                                    </CardDescription>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Timer size={16} />
                                  <span>{task.prep_time_minutes}m</span>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                              {task.ingredients.length > 0 && (
                                <div>
                                  <p className="font-medium mb-2">Ingredients</p>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                                    {task.ingredients.slice(0, 4).map((ing, i) => (
                                      <p key={i} className="text-muted-foreground text-xs">• {ing}</p>
                                    ))}
                                    {task.ingredients.length > 4 && (
                                      <p className="text-muted-foreground text-xs">
                                        • +{task.ingredients.length - 4} more ingredients
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}

                              {task.instructions.length > 0 && (
                                <div>
                                  <p className="font-medium mb-2">Instructions</p>
                                  <ol className="space-y-1">
                                    {task.instructions.map((instruction, i) => (
                                      <li key={i} className="text-muted-foreground text-xs flex gap-2">
                                        <span className="font-medium">{i + 1}.</span>
                                        <span>{instruction}</span>
                                      </li>
                                    ))}
                                  </ol>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>

      <Card className="border-muted bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="text-primary" weight="duotone" />
            What You'll Need
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Airtight Containers</p>
              <p className="font-semibold">{prepPlan.storage_requirements.containers_needed} containers</p>
              <p className="text-xs text-muted-foreground mt-1">For storing prepared meals</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Fridge Space</p>
              <p className="font-semibold capitalize">{prepPlan.storage_requirements.fridge_space}</p>
              <p className="text-xs text-muted-foreground mt-1">Shelf space required</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Freezer Space</p>
              <p className="font-semibold capitalize">{prepPlan.storage_requirements.freezer_space}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {prepPlan.storage_requirements.freezer_space === 'none' ? 'Not required for this plan' : 'For longer storage'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
