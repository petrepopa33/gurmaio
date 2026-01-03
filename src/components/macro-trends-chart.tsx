import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { TrendUp, Calendar, ChartLine } from '@phosphor-icons/react';
import type { CompletedMeal, IngredientNutrition } from '@/types/domain';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, eachWeekOfInterval, startOfMonth, endOfMonth } from 'date-fns';

interface MacroTrendsChartProps {
  completedMeals: CompletedMeal[];
}

type ViewMode = 'weekly' | 'monthly';
type ChartType = 'line' | 'bar';

interface DayData {
  date: string;
  displayDate: string;
  calories: number;
  protein_g: number;
  carbohydrates_g: number;
  fats_g: number;
  cost_eur: number;
  meals_count: number;
}

interface WeekData {
  week: string;
  displayWeek: string;
  avgCalories: number;
  avgProtein: number;
  avgCarbs: number;
  avgFats: number;
  avgCost: number;
  totalMeals: number;
}

export function MacroTrendsChart({ completedMeals }: MacroTrendsChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');
  const [chartType, setChartType] = useState<ChartType>('line');

  const dailyData = useMemo(() => {
    const mealsMap = new Map<string, CompletedMeal[]>();
    
    completedMeals.forEach(meal => {
      const dateKey = meal.date;
      if (!mealsMap.has(dateKey)) {
        mealsMap.set(dateKey, []);
      }
      mealsMap.get(dateKey)!.push(meal);
    });

    const data: DayData[] = Array.from(mealsMap.entries())
      .map(([date, meals]) => {
        const totals = meals.reduce(
          (acc, meal) => ({
            calories: acc.calories + meal.nutrition.calories,
            protein_g: acc.protein_g + meal.nutrition.protein_g,
            carbohydrates_g: acc.carbohydrates_g + meal.nutrition.carbohydrates_g,
            fats_g: acc.fats_g + meal.nutrition.fats_g,
            cost_eur: acc.cost_eur + meal.cost_eur,
          }),
          { calories: 0, protein_g: 0, carbohydrates_g: 0, fats_g: 0, cost_eur: 0 }
        );

        return {
          date,
          displayDate: format(new Date(date), 'MMM d'),
          calories: Math.round(totals.calories),
          protein_g: Math.round(totals.protein_g),
          carbohydrates_g: Math.round(totals.carbohydrates_g),
          fats_g: Math.round(totals.fats_g),
          cost_eur: Math.round(totals.cost_eur * 100) / 100,
          meals_count: meals.length,
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return data;
  }, [completedMeals]);

  const weeklyData = useMemo(() => {
    if (dailyData.length === 0) return [];

    const firstDate = new Date(dailyData[0].date);
    const lastDate = new Date(dailyData[dailyData.length - 1].date);
    
    const weeks = eachWeekOfInterval({ start: firstDate, end: lastDate }, { weekStartsOn: 1 });
    
    const data: WeekData[] = weeks.map(weekStart => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const weekDays = dailyData.filter(day => {
        const dayDate = new Date(day.date);
        return dayDate >= weekStart && dayDate <= weekEnd;
      });

      if (weekDays.length === 0) {
        return null;
      }

      const totals = weekDays.reduce(
        (acc, day) => ({
          calories: acc.calories + day.calories,
          protein: acc.protein + day.protein_g,
          carbs: acc.carbs + day.carbohydrates_g,
          fats: acc.fats + day.fats_g,
          cost: acc.cost + day.cost_eur,
          meals: acc.meals + day.meals_count,
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0, cost: 0, meals: 0 }
      );

      const daysCount = weekDays.length;

      return {
        week: format(weekStart, 'yyyy-MM-dd'),
        displayWeek: `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`,
        avgCalories: Math.round(totals.calories / daysCount),
        avgProtein: Math.round(totals.protein / daysCount),
        avgCarbs: Math.round(totals.carbs / daysCount),
        avgFats: Math.round(totals.fats / daysCount),
        avgCost: Math.round((totals.cost / daysCount) * 100) / 100,
        totalMeals: totals.meals,
      };
    }).filter((week): week is WeekData => week !== null);

    return data;
  }, [dailyData]);

  const chartData = viewMode === 'weekly' ? weeklyData : dailyData;

  if (completedMeals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartLine className="text-primary" />
            Macro Trends
          </CardTitle>
          <CardDescription>
            Track your nutrition patterns over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <TrendUp size={48} className="text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              Complete meals from your meal plan to see your nutrition trends
            </p>
            <p className="text-sm text-muted-foreground">
              Track calories, protein, carbs, and fats over time
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ChartLine className="text-primary" />
              Macro Trends
            </CardTitle>
            <CardDescription>
              {viewMode === 'weekly' 
                ? 'Average daily intake per week' 
                : 'Daily nutrition intake'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Tabs value={chartType} onValueChange={(v) => setChartType(v as ChartType)}>
              <TabsList className="h-8">
                <TabsTrigger value="line" className="text-xs">Line</TabsTrigger>
                <TabsTrigger value="bar" className="text-xs">Bar</TabsTrigger>
              </TabsList>
            </Tabs>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <TabsList className="h-8">
                <TabsTrigger value="weekly" className="text-xs">Weekly</TabsTrigger>
                <TabsTrigger value="monthly" className="text-xs">Daily</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey={viewMode === 'weekly' ? 'displayWeek' : 'displayDate'}
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                    labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey={viewMode === 'weekly' ? 'avgCalories' : 'calories'}
                    stroke="hsl(var(--chart-1))"
                    name="Calories"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey={viewMode === 'weekly' ? 'avgProtein' : 'protein_g'}
                    stroke="hsl(var(--chart-2))"
                    name="Protein (g)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey={viewMode === 'weekly' ? 'avgCarbs' : 'carbohydrates_g'}
                    stroke="hsl(var(--chart-3))"
                    name="Carbs (g)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey={viewMode === 'weekly' ? 'avgFats' : 'fats_g'}
                    stroke="hsl(var(--chart-4))"
                    name="Fats (g)"
                    strokeWidth={2}
                  />
                </LineChart>
              ) : (
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey={viewMode === 'weekly' ? 'displayWeek' : 'displayDate'}
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                    labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
                  />
                  <Legend />
                  <Bar
                    dataKey={viewMode === 'weekly' ? 'avgCalories' : 'calories'}
                    fill="hsl(var(--chart-1))"
                    name="Calories"
                  />
                  <Bar
                    dataKey={viewMode === 'weekly' ? 'avgProtein' : 'protein_g'}
                    fill="hsl(var(--chart-2))"
                    name="Protein (g)"
                  />
                  <Bar
                    dataKey={viewMode === 'weekly' ? 'avgCarbs' : 'carbohydrates_g'}
                    fill="hsl(var(--chart-3))"
                    name="Carbs (g)"
                  />
                  <Bar
                    dataKey={viewMode === 'weekly' ? 'avgFats' : 'fats_g'}
                    fill="hsl(var(--chart-4))"
                    name="Fats (g)"
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-xs text-muted-foreground mb-1">
                {viewMode === 'weekly' ? 'Avg Calories' : 'Total Days'}
              </div>
              <div className="text-2xl font-bold text-foreground">
                {viewMode === 'weekly' 
                  ? Math.round(weeklyData.reduce((sum, w) => sum + w.avgCalories, 0) / weeklyData.length) 
                  : dailyData.length}
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-xs text-muted-foreground mb-1">
                {viewMode === 'weekly' ? 'Avg Protein' : 'Total Meals'}
              </div>
              <div className="text-2xl font-bold text-chart-2">
                {viewMode === 'weekly' 
                  ? `${Math.round(weeklyData.reduce((sum, w) => sum + w.avgProtein, 0) / weeklyData.length)}g`
                  : dailyData.reduce((sum, d) => sum + d.meals_count, 0)}
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-xs text-muted-foreground mb-1">
                {viewMode === 'weekly' ? 'Avg Carbs' : 'Avg Calories/Day'}
              </div>
              <div className="text-2xl font-bold text-chart-3">
                {viewMode === 'weekly' 
                  ? `${Math.round(weeklyData.reduce((sum, w) => sum + w.avgCarbs, 0) / weeklyData.length)}g`
                  : Math.round(dailyData.reduce((sum, d) => sum + d.calories, 0) / dailyData.length)}
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-xs text-muted-foreground mb-1">
                {viewMode === 'weekly' ? 'Avg Fats' : 'Avg Protein/Day'}
              </div>
              <div className="text-2xl font-bold text-chart-4">
                {viewMode === 'weekly' 
                  ? `${Math.round(weeklyData.reduce((sum, w) => sum + w.avgFats, 0) / weeklyData.length)}g`
                  : `${Math.round(dailyData.reduce((sum, d) => sum + d.protein_g, 0) / dailyData.length)}g`}
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-xs text-muted-foreground mb-1">
                {viewMode === 'weekly' ? 'Avg Cost/Day' : 'Avg Cost/Day'}
              </div>
              <div className="text-2xl font-bold text-chart-5">
                €{viewMode === 'weekly' 
                  ? (weeklyData.reduce((sum, w) => sum + w.avgCost, 0) / weeklyData.length).toFixed(2)
                  : (dailyData.reduce((sum, d) => sum + d.cost_eur, 0) / dailyData.length).toFixed(2)}
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Tracking {completedMeals.length} completed meal{completedMeals.length !== 1 ? 's' : ''} across {dailyData.length} day{dailyData.length !== 1 ? 's' : ''}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
