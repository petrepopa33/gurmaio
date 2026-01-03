import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import type { UserProfile } from '@/types/domain';
import { calculateTargetCalories, getActivityLevelLabel, getObjectiveLabel, type Sex, type ActivityLevel, type Objective } from '@/lib/calorie-calculator';
import { toast } from 'sonner';
import { useLanguage } from '@/hooks/use-language';

interface OnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (profile: UserProfile) => void;
  existingProfile?: UserProfile | null;
}

const DIETARY_OPTIONS = [
  'Balanced',
  'High Protein',
  'Low Carb',
  'Vegetarian',
  'Vegan',
  'Mediterranean',
  'Paleo',
];

const ALLERGEN_OPTIONS = [
  'Gluten',
  'Dairy',
  'Nuts',
  'Shellfish',
  'Eggs',
  'Soy',
];

const CUISINE_OPTIONS = [
  'Italian',
  'Asian',
  'Mediterranean',
  'Mexican',
  'American',
  'Indian',
];

function getDietaryTranslationKey(option: string): keyof typeof import('@/lib/i18n/translations').translations.en.dietary {
  const mapping: Record<string, keyof typeof import('@/lib/i18n/translations').translations.en.dietary> = {
    'Balanced': 'balanced',
    'High Protein': 'highProtein',
    'Low Carb': 'lowCarb',
    'Vegetarian': 'vegetarian',
    'Vegan': 'vegan',
    'Mediterranean': 'mediterranean',
    'Paleo': 'paleo',
  };
  return mapping[option] || 'balanced';
}

function getAllergenTranslationKey(option: string): keyof typeof import('@/lib/i18n/translations').translations.en.allergens {
  const mapping: Record<string, keyof typeof import('@/lib/i18n/translations').translations.en.allergens> = {
    'Gluten': 'gluten',
    'Dairy': 'dairy',
    'Nuts': 'nuts',
    'Shellfish': 'shellfish',
    'Eggs': 'eggs',
    'Soy': 'soy',
  };
  return mapping[option] || 'gluten';
}

function getCuisineTranslationKey(option: string): keyof typeof import('@/lib/i18n/translations').translations.en.cuisines {
  const mapping: Record<string, keyof typeof import('@/lib/i18n/translations').translations.en.cuisines> = {
    'Italian': 'italian',
    'Asian': 'asian',
    'Mediterranean': 'mediterranean',
    'Mexican': 'mexican',
    'American': 'american',
    'Indian': 'indian',
  };
  return mapping[option] || 'italian';
}

export function OnboardingDialog({ open, onOpenChange, onSave, existingProfile }: OnboardingDialogProps) {
  const { t } = useLanguage();
  const [budget, setBudget] = useState(existingProfile?.budget_eur?.toString() || '50');
  const [budgetPeriod, setBudgetPeriod] = useState<'daily' | 'weekly'>(existingProfile?.budget_period || 'weekly');
  const [days, setDays] = useState(existingProfile?.meal_plan_days?.toString() || '5');
  const [dietaryPrefs, setDietaryPrefs] = useState<string[]>(existingProfile?.dietary_preferences || ['Balanced']);
  const [allergens, setAllergens] = useState<string[]>(existingProfile?.allergens || []);
  const [cuisines, setCuisines] = useState<string[]>(existingProfile?.cuisine_preferences || ['Italian', 'Mediterranean']);
  
  const [weight, setWeight] = useState(existingProfile?.weight_kg?.toString() || '');
  const [height, setHeight] = useState(existingProfile?.height_cm?.toString() || '');
  const [age, setAge] = useState(existingProfile?.age?.toString() || '');
  const [sex, setSex] = useState<Sex | ''>(existingProfile?.sex || '');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | ''>(existingProfile?.activity_level || '');
  const [objective, setObjective] = useState<Objective | ''>(existingProfile?.objective || '');
  
  const [calculatedCalories, setCalculatedCalories] = useState<number | null>(null);
  const [manualCalories, setManualCalories] = useState(existingProfile?.target_calories?.toString() || '');
  const [useManualCalories, setUseManualCalories] = useState(!!existingProfile?.target_calories && !existingProfile?.weight_kg);

  useEffect(() => {
    if (!useManualCalories && weight && height && age && sex && activityLevel && objective) {
      const weightNum = parseFloat(weight);
      const heightNum = parseFloat(height);
      const ageNum = parseInt(age);

      if (!isNaN(weightNum) && !isNaN(heightNum) && !isNaN(ageNum)) {
        const calories = calculateTargetCalories({
          weight_kg: weightNum,
          height_cm: heightNum,
          age: ageNum,
          sex: sex as Sex,
          activity_level: activityLevel as ActivityLevel,
          objective: objective as Objective,
        });
        setCalculatedCalories(calories);
      } else {
        setCalculatedCalories(null);
      }
    } else {
      setCalculatedCalories(null);
    }
  }, [weight, height, age, sex, activityLevel, objective, useManualCalories]);

  const handleSave = () => {
    const budgetNum = parseFloat(budget);
    const daysNum = parseInt(days);
    
    let finalCalories: number | undefined;
    if (useManualCalories) {
      const manualCaloriesNum = parseInt(manualCalories);
      if (!isNaN(manualCaloriesNum)) {
        finalCalories = manualCaloriesNum;
      }
    } else {
      finalCalories = calculatedCalories || undefined;
    }

    if (isNaN(budgetNum) || budgetNum <= 0) {
      toast.error('Please enter a valid budget');
      return;
    }

    if (isNaN(daysNum) || daysNum < 1 || daysNum > 14) {
      toast.error('Please enter days between 1 and 14');
      return;
    }

    if (dietaryPrefs.length === 0) {
      toast.error('Please select at least one dietary preference');
      return;
    }

    const profile: UserProfile = {
      budget_eur: budgetNum,
      budget_period: budgetPeriod,
      meal_plan_days: daysNum,
      dietary_preferences: dietaryPrefs,
      allergens,
      cuisine_preferences: cuisines,
      target_calories: finalCalories,
      weight_kg: weight ? parseFloat(weight) : undefined,
      height_cm: height ? parseFloat(height) : undefined,
      age: age ? parseInt(age) : undefined,
      sex: sex || undefined,
      activity_level: activityLevel || undefined,
      objective: objective || undefined,
    };

    onSave(profile);
  };

  const toggleDietary = (option: string) => {
    setDietaryPrefs((prev) =>
      prev.includes(option) ? prev.filter((p) => p !== option) : [...prev, option]
    );
  };

  const toggleAllergen = (option: string) => {
    setAllergens((prev) =>
      prev.includes(option) ? prev.filter((p) => p !== option) : [...prev, option]
    );
  };

  const toggleCuisine = (option: string) => {
    setCuisines((prev) =>
      prev.includes(option) ? prev.filter((p) => p !== option) : [...prev, option]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">
            {existingProfile ? t.onboarding.updateProfile : t.onboarding.createProfile}
          </DialogTitle>
          <DialogDescription>
            {t.onboarding.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">{t.onboarding.budgetLabel}</Label>
              <Input
                id="budget"
                type="number"
                step="0.01"
                min="1"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="50.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget-period">{t.onboarding.budgetPeriodLabel}</Label>
              <Select value={budgetPeriod} onValueChange={(v) => setBudgetPeriod(v as 'daily' | 'weekly')}>
                <SelectTrigger id="budget-period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">{t.onboarding.perDay}</SelectItem>
                  <SelectItem value="weekly">{t.onboarding.perWeek}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="days">{t.onboarding.mealPlanDaysLabel}</Label>
            <Input
              id="days"
              type="number"
              min="1"
              max="14"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              placeholder="5"
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-semibold">{t.onboarding.nutritionGoals}</h3>
              <div className="flex items-center gap-2">
                <Label htmlFor="manual-calories" className="text-sm text-muted-foreground cursor-pointer">
                  {t.onboarding.manualEntry}
                </Label>
                <Checkbox
                  id="manual-calories"
                  checked={useManualCalories}
                  onCheckedChange={(checked) => setUseManualCalories(!!checked)}
                />
              </div>
            </div>
            
            {!useManualCalories ? (
              <>
                <p className="text-sm text-muted-foreground">
                  {t.onboarding.calculatedDescription}
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">{t.onboarding.weightLabel}</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      min="30"
                      max="300"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="70"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height">{t.onboarding.heightLabel}</Label>
                    <Input
                      id="height"
                      type="number"
                      min="100"
                      max="250"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="170"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">{t.onboarding.ageLabel}</Label>
                    <Input
                      id="age"
                      type="number"
                      min="13"
                      max="120"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sex">{t.onboarding.sexLabel}</Label>
                    <Select value={sex} onValueChange={(v) => setSex(v as Sex)}>
                      <SelectTrigger id="sex">
                        <SelectValue placeholder={t.onboarding.sexLabel} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">{t.onboarding.male}</SelectItem>
                        <SelectItem value="female">{t.onboarding.female}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activity">{t.onboarding.activityLevelLabel}</Label>
                  <Select value={activityLevel} onValueChange={(v) => setActivityLevel(v as ActivityLevel)}>
                    <SelectTrigger id="activity">
                      <SelectValue placeholder={t.onboarding.activityLevelLabel} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">{t.activityLevels.sedentary}</SelectItem>
                      <SelectItem value="light">{t.activityLevels.light}</SelectItem>
                      <SelectItem value="moderate">{t.activityLevels.moderate}</SelectItem>
                      <SelectItem value="active">{t.activityLevels.active}</SelectItem>
                      <SelectItem value="very_active">{t.activityLevels.veryActive}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="objective">{t.onboarding.objectiveLabel}</Label>
                  <Select value={objective} onValueChange={(v) => setObjective(v as Objective)}>
                    <SelectTrigger id="objective">
                      <SelectValue placeholder={t.onboarding.objectiveLabel} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lose_weight">{t.objectives.loseWeight}</SelectItem>
                      <SelectItem value="maintain">{t.objectives.maintain}</SelectItem>
                      <SelectItem value="gain_muscle">{t.objectives.gainMuscle}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {calculatedCalories && (
                  <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
                    <p className="text-sm">
                      <span className="text-muted-foreground">{t.onboarding.calculatedTarget} </span>
                      <span className="font-heading font-bold text-lg text-accent-foreground">
                        {calculatedCalories} {t.onboarding.calPerDay}
                      </span>
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="manual-calories-input">{t.onboarding.targetCaloriesLabel}</Label>
                <Input
                  id="manual-calories-input"
                  type="number"
                  min="1000"
                  max="5000"
                  value={manualCalories}
                  onChange={(e) => setManualCalories(e.target.value)}
                  placeholder="2000"
                />
                <p className="text-xs text-muted-foreground">
                  {t.onboarding.enterCustomCalories}
                </p>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>{t.onboarding.dietaryPreferences}</Label>
            <div className="grid grid-cols-2 gap-2">
              {DIETARY_OPTIONS.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`dietary-${option}`}
                    checked={dietaryPrefs.includes(option)}
                    onCheckedChange={() => toggleDietary(option)}
                  />
                  <label
                    htmlFor={`dietary-${option}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {t.dietary[getDietaryTranslationKey(option)]}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>{t.onboarding.allergensToAvoid}</Label>
            <div className="grid grid-cols-2 gap-2">
              {ALLERGEN_OPTIONS.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`allergen-${option}`}
                    checked={allergens.includes(option)}
                    onCheckedChange={() => toggleAllergen(option)}
                  />
                  <label
                    htmlFor={`allergen-${option}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {t.allergens[getAllergenTranslationKey(option)]}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>{t.onboarding.cuisinePreferences}</Label>
            <div className="grid grid-cols-2 gap-2">
              {CUISINE_OPTIONS.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cuisine-${option}`}
                    checked={cuisines.includes(option)}
                    onCheckedChange={() => toggleCuisine(option)}
                  />
                  <label
                    htmlFor={`cuisine-${option}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {t.cuisines[getCuisineTranslationKey(option)]}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            {t.onboarding.cancel}
          </Button>
          <Button onClick={handleSave} className="flex-1">
            {existingProfile ? t.onboarding.updateProfileButton : t.onboarding.saveProfile}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
