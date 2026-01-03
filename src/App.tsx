import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { AnimatePresence, motion } from 'framer-motion';
import type { MealPlan, UserProfile, ShoppingList, MealRating, Meal, MealPrepPlan, CompletedMeal } from '@/types/domain';
import { generateMealPlan, generateShoppingList } from '@/lib/mock-data';
import { generateMealSubstitution } from '@/lib/meal-substitution';
import { generateMealPrepPlan } from '@/lib/meal-prep-generator';
import { OnboardingDialog } from '@/components/onboarding-dialog';
import { MealPlanView } from '@/components/meal-plan-view';
import { MealPrepView } from '@/components/meal-prep-view';
import { MealCalendar } from '@/components/meal-calendar';
import { MacroTrendsChart } from '@/components/macro-trends-chart';
import { ShoppingListSheet } from '@/components/shopping-list-sheet';
import { BudgetGauge } from '@/components/budget-gauge';
import { SavedPlansDialog } from '@/components/saved-plans-dialog';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ShareMealPlanDialog } from '@/components/share-meal-plan-dialog';
import { AppFooter } from '@/components/app-footer';
import { DemoPreview } from '@/components/demo-preview';
import { AnimatedAppDemo } from '@/components/animated-app-demo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Toaster } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, List, UserCircleGear, SignOut, FloppyDisk, Check, ClockClockwise, ShareNetwork, FilePdf, ChefHat } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useLanguage } from '@/hooks/use-language';
import { exportMealPlanToPDF } from '@/lib/export-meal-plan-pdf';
import { DISCLAIMERS, EMPTY_STATES } from '@/lib/disclaimers';

interface UserInfo {
  avatarUrl: string;
  email: string;
  id: string;
  isOwner: boolean;
  login: string;
}

function App() {
  const { language, setLanguage, t } = useLanguage();
  const [userProfile, setUserProfile] = useKV<UserProfile | null>('user_profile', null);
  const [mealPlan, setMealPlan] = useKV<MealPlan | null>('current_meal_plan', null);
  const [mealPrepPlan, setMealPrepPlan] = useKV<MealPrepPlan | null>('current_meal_prep_plan', null);
  const [shoppingListState, setShoppingListState] = useKV<ShoppingList | null>('shopping_list_state', null);
  const [savedMealPlans, setSavedMealPlans] = useKV<MealPlan[]>('saved_meal_plans', []);
  const [mealRatings, setMealRatings] = useKV<MealRating[]>('meal_ratings', []);
  const [completedMeals, setCompletedMeals] = useKV<CompletedMeal[]>('completed_meals', []);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingPrep, setIsGeneratingPrep] = useState(false);
  const [shoppingListOpen, setShoppingListOpen] = useState(false);
  const [savedPlansOpen, setSavedPlansOpen] = useState(false);
  const [shareMealPlanOpen, setShareMealPlanOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
  const [showAnimatedDemo, setShowAnimatedDemo] = useState(true);
  const [activeTab, setActiveTab] = useState<'meals' | 'prep' | 'calendar'>('meals');

  const hasProfile = userProfile !== null;
  const hasMealPlan = mealPlan !== null;
  const canSaveMorePlans = (savedMealPlans?.length ?? 0) < 5;
  const isCurrentPlanAlreadySaved = mealPlan ? (savedMealPlans || []).some(p => p.plan_id === mealPlan.plan_id) : false;

  const currentShoppingList = shoppingListState || (mealPlan ? generateShoppingList(mealPlan) : null);

  const mealRatingsMap = new Map<string, number>();
  (mealRatings || []).forEach(rating => {
    mealRatingsMap.set(rating.meal_id, rating.rating);
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await window.spark.user();
      setCurrentUser(user as unknown as UserInfo);
    } catch (error) {
      setCurrentUser(null);
    }
  };

  const handleLogout = async () => {
    try {
      toast.loading('Logging out...', { id: 'logout' });
      
      setCurrentUser(null);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      window.location.href = '/.spark/logout';
    } catch (error) {
      console.error('Logout error:', error);
      
      setCurrentUser(null);
      
      window.location.href = '/.spark/logout';
    }
  };

  const handleSaveMealPlan = async () => {
    if (!mealPlan || !currentUser) {
      toast.error('Please log in to save meal plans');
      return;
    }

    setIsSaving(true);
    
    const result = await new Promise<boolean>((resolve) => {
      setSavedMealPlans((current) => {
        const plans = current || [];
        const existingIndex = plans.findIndex(p => p.plan_id === mealPlan.plan_id);
        
        if (existingIndex >= 0) {
          const updated = [...plans];
          updated[existingIndex] = mealPlan;
          resolve(true);
          return updated;
        }
        
        if (plans.length >= 5) {
          resolve(false);
          return plans;
        }
        
        resolve(true);
        return [...plans, mealPlan];
      });
    });

    setIsSaving(false);
    
    if (result) {
      setJustSaved(true);
      toast.success('Meal plan saved successfully!');
      setTimeout(() => setJustSaved(false), 2000);
    } else {
      toast.error('Maximum 5 saved plans reached. Please delete an old plan first.');
    }
  };

  const handleSaveProfile = (profile: UserProfile) => {
    setUserProfile(() => profile);
    setIsOnboarding(false);
    toast.success('Profile saved successfully');
  };

  const handleGeneratePlan = async () => {
    if (!userProfile) {
      toast.error('Please complete your profile first');
      return;
    }

    setIsGenerating(true);
    
    try {
      setMealPlan(() => null);
      setShoppingListState(() => null);
      setMealPrepPlan(() => null);
      setActiveTab('meals');
      
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const newPlan = await generateMealPlan(userProfile);
      setMealPlan(() => newPlan);
      
      toast.success('Meal plan generated successfully!');
    } catch (error) {
      console.error('Error generating meal plan:', error);
      toast.error('Failed to generate meal plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePrepPlan = async () => {
    if (!mealPlan) {
      toast.error('Please generate a meal plan first');
      return;
    }

    setIsGeneratingPrep(true);
    
    try {
      const newPrepPlan = await generateMealPrepPlan(mealPlan);
      setMealPrepPlan(() => newPrepPlan);
      
      toast.success('Meal prep plan generated!');
      setActiveTab('prep');
    } catch (error) {
      console.error('Error generating prep plan:', error);
      toast.error('Failed to generate prep plan. Please try again.');
    } finally {
      setIsGeneratingPrep(false);
    }
  };

  const handleToggleOwned = (ingredientId: string) => {
    if (!currentShoppingList) return;
    
    setShoppingListState((current) => {
      const base = current || currentShoppingList;
      return {
        ...base,
        items: base.items.map(item =>
          item.ingredient_id === ingredientId
            ? { ...item, owned: !item.owned }
            : item
        )
      };
    });
  };

  const handleDeleteItem = (ingredientId: string) => {
    if (!currentShoppingList) return;
    
    setShoppingListState((current) => {
      const base = current || currentShoppingList;
      return {
        ...base,
        items: base.items.map(item =>
          item.ingredient_id === ingredientId
            ? { ...item, deleted: true }
            : item
        )
      };
    });
  };

  const handleLoadSavedPlan = (plan: MealPlan) => {
    setMealPlan(() => plan);
    setShoppingListState(() => null);
    setMealPrepPlan(() => null);
    toast.success('Meal plan loaded successfully');
  };

  const handleDeleteSavedPlan = (planId: string) => {
    setSavedMealPlans((current) => {
      const plans = current || [];
      return plans.filter(p => p.plan_id !== planId);
    });
    toast.success('Meal plan deleted');
  };

  const handleShareSavedPlan = (plan: MealPlan) => {
    setMealPlan(() => plan);
    setShareMealPlanOpen(true);
  };

  const handleExportToPDF = () => {
    if (!mealPlan) return;
    
    try {
      exportMealPlanToPDF(mealPlan, language);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      toast.error('Failed to export PDF');
      console.error('PDF export error:', error);
    }
  };

  const handleLanguageChange = async (newLanguage: string) => {
    setLanguage(() => newLanguage as any);
    await new Promise(resolve => setTimeout(resolve, 100));
    window.location.reload();
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    
    try {
      setShowDeleteAccountDialog(false);
      
      toast.loading('Deleting your account and all data...', { id: 'delete-account' });
      
      setUserProfile(() => null);
      setMealPlan(() => null);
      setShoppingListState(() => null);
      setSavedMealPlans(() => []);
      setMealRatings(() => []);
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        console.warn('Storage cleanup failed:', e);
      }
      
      setCurrentUser(null);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      toast.success('Your account and all data have been deleted', { id: 'delete-account', duration: 2000 });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      window.location.href = '/.spark/logout';
    } catch (error) {
      toast.error('Failed to delete account data', { id: 'delete-account' });
      console.error('Delete account error:', error);
      
      window.location.href = '/.spark/logout';
    }
  };

  const handleRateMeal = (mealId: string, rating: 1 | 2 | 3 | 4 | 5, meal: Meal) => {
    setMealRatings((current) => {
      const ratings = current || [];
      const existingIndex = ratings.findIndex(r => r.meal_id === mealId);
      
      const newRating: MealRating = {
        meal_id: mealId,
        recipe_name: meal.recipe_name,
        meal_type: meal.meal_type,
        rating,
        rated_at: new Date().toISOString(),
        ingredients: meal.ingredients.map(ing => ing.name),
      };
      
      if (existingIndex >= 0) {
        const updated = [...ratings];
        updated[existingIndex] = newRating;
        return updated;
      }
      
      return [...ratings, newRating];
    });
    
    toast.success(`Rated ${rating} star${rating > 1 ? 's' : ''}`, {
      description: 'Your preferences help us suggest better meals'
    });
  };

  const handleSwapMeal = async (mealId: string, dayNumber: number) => {
    if (!mealPlan || !userProfile) {
      toast.error(t.swapFailed);
      return;
    }

    try {
      const day = mealPlan.days.find(d => d.day_number === dayNumber);
      if (!day) throw new Error('Day not found');

      const currentMeal = day.meals.find(m => m.meal_id === mealId);
      if (!currentMeal) throw new Error('Meal not found');

      const newMeal = await generateMealSubstitution(
        currentMeal,
        dayNumber,
        userProfile,
        mealPlan,
        mealRatings || []
      );

      setMealPlan((currentPlan) => {
        if (!currentPlan) return null;

        const updatedDays = currentPlan.days.map(d => {
          if (d.day_number !== dayNumber) return d;

          const updatedMeals = d.meals.map(m => 
            m.meal_id === mealId ? newMeal : m
          );

          const dayTotals = updatedMeals.reduce(
            (acc, meal) => ({
              calories: acc.calories + meal.nutrition.calories,
              protein_g: acc.protein_g + meal.nutrition.protein_g,
              carbohydrates_g: acc.carbohydrates_g + meal.nutrition.carbohydrates_g,
              fats_g: acc.fats_g + meal.nutrition.fats_g,
              cost_eur: acc.cost_eur + meal.cost.meal_cost_eur,
            }),
            { calories: 0, protein_g: 0, carbohydrates_g: 0, fats_g: 0, cost_eur: 0 }
          );

          return {
            ...d,
            meals: updatedMeals,
            totals: dayTotals,
          };
        });

        const planTotals = updatedDays.reduce(
          (acc, day) => ({
            calories: acc.calories + day.totals.calories,
            protein_g: acc.protein_g + day.totals.protein_g,
            carbohydrates_g: acc.carbohydrates_g + day.totals.carbohydrates_g,
            fats_g: acc.fats_g + day.totals.fats_g,
            total_cost_eur: acc.total_cost_eur + day.totals.cost_eur,
          }),
          { calories: 0, protein_g: 0, carbohydrates_g: 0, fats_g: 0, total_cost_eur: 0 }
        );

        const isOverBudget = planTotals.total_cost_eur > currentPlan.metadata.period_budget_eur;

        return {
          ...currentPlan,
          days: updatedDays,
          plan_totals: planTotals,
          metadata: {
            ...currentPlan.metadata,
            period_cost_eur: planTotals.total_cost_eur,
            budget_remaining_eur: currentPlan.metadata.period_budget_eur - planTotals.total_cost_eur,
            is_over_budget: isOverBudget,
          },
        };
      });

      setShoppingListState(() => null);

      toast.success(t.mealSwapped);
    } catch (error) {
      console.error('Error swapping meal:', error);
      toast.error(t.swapFailed);
    }
  };

  if (!hasProfile) {
    return (
      <div className="min-h-screen bg-background">
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="font-heading text-xl font-bold text-primary">{t.appName}</h1>
              <div className="flex items-center gap-2">
                <LanguageSwitcher currentLanguage={language} onLanguageChange={handleLanguageChange} />
                {currentUser && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={currentUser.avatarUrl} alt={currentUser.login} />
                          <AvatarFallback>{currentUser.login.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{currentUser.login}</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {currentUser.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <SignOut className="mr-2" />
                        {t.logout}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="pt-20 pb-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-6 mb-12">
              <h2 className="font-heading text-5xl md:text-6xl font-bold text-foreground tracking-tight">
                {t.tagline}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Create personalized meal plans based on your budget, dietary preferences, and nutrition goals
              </p>
            </div>

            <div className="mb-12 space-y-6">
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant={showAnimatedDemo ? 'default' : 'outline'}
                  onClick={() => setShowAnimatedDemo(true)}
                  size="sm"
                >
                  Interactive Demo
                </Button>
                <Button
                  variant={!showAnimatedDemo ? 'default' : 'outline'}
                  onClick={() => setShowAnimatedDemo(false)}
                  size="sm"
                >
                  Feature Overview
                </Button>
              </div>

              {showAnimatedDemo ? (
                <AnimatedAppDemo />
              ) : (
                <DemoPreview autoPlay={true} />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-card rounded-xl p-6 border shadow-sm space-y-3">
                <div className="text-4xl">💰</div>
                <h3 className="font-heading text-lg font-semibold">Budget-First</h3>
                <p className="text-sm text-muted-foreground">
                  Transparent cost breakdowns for every meal
                </p>
              </div>
              <div className="bg-card rounded-xl p-6 border shadow-sm space-y-3">
                <div className="text-4xl">🎯</div>
                <h3 className="font-heading text-lg font-semibold">Precise Nutrition</h3>
                <p className="text-sm text-muted-foreground">
                  Accurate calories, protein, carbs, and fats
                </p>
              </div>
              <div className="bg-card rounded-xl p-6 border shadow-sm space-y-3">
                <div className="text-4xl">🛒</div>
                <h3 className="font-heading text-lg font-semibold">Smart Shopping</h3>
                <p className="text-sm text-muted-foreground">
                  Aggregated lists with realistic grocery costs
                </p>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-8 border shadow-sm space-y-6 max-w-xl mx-auto">
              {!currentUser && (
                <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
                  <p className="text-sm font-medium">
                    ✨ No login required to try {t.appName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {EMPTY_STATES.guestMode}
                  </p>
                </div>
              )}
              
              <div className="space-y-3">
                <h3 className="font-heading text-2xl font-semibold text-center">{t.welcome}</h3>
                <p className="text-muted-foreground text-center text-sm">
                  Answer a few quick questions to get your personalized meal plan
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                {!currentUser ? (
                  <>
                    <Button
                      onClick={() => window.location.href = '/.spark/login'}
                      size="lg"
                      className="w-full"
                    >
                      {t.login}
                    </Button>
                    <Button
                      onClick={() => setIsOnboarding(true)}
                      size="lg"
                      className="w-full"
                      variant="outline"
                    >
                      {t.continueAsGuest}
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setIsOnboarding(true)}
                    size="lg"
                    className="w-full"
                  >
                    <Plus className="mr-2" />
                    {t.getStarted}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </main>

        <OnboardingDialog
          open={isOnboarding}
          onOpenChange={setIsOnboarding}
          onSave={handleSaveProfile}
        />

        <AppFooter onDeleteAccount={currentUser ? () => setShowDeleteAccountDialog(true) : undefined} />

        <AlertDialog open={showDeleteAccountDialog} onOpenChange={setShowDeleteAccountDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete My Account & All Data</AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>
                  This will <strong>permanently and irreversibly delete</strong>:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Your user profile and preferences</li>
                  <li>All saved meal plans (up to 5 plans)</li>
                  <li>Your meal ratings and history</li>
                  <li>Shopping lists and tracked items</li>
                  <li>All associated data stored in our system</li>
                </ul>
                <p className="pt-2">
                  Your session will be terminated and you will be logged out immediately.
                </p>
                <p className="text-xs text-muted-foreground pt-2">
                  This action complies with GDPR Article 17 (Right to Erasure) and cannot be undone.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                Yes, Delete Everything
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="font-heading text-2xl font-bold text-primary">{t.appName}</h1>
              {mealPlan && (
                <BudgetGauge
                  budget={mealPlan.metadata.period_budget_eur}
                  spent={mealPlan.metadata.period_cost_eur}
                  isOverBudget={mealPlan.metadata.is_over_budget}
                  compact
                />
              )}
            </div>

            <div className="flex items-center gap-2">
              <LanguageSwitcher currentLanguage={language} onLanguageChange={handleLanguageChange} />
              {hasMealPlan && currentUser && (
                <Button
                  variant={justSaved ? "default" : "outline"}
                  onClick={handleSaveMealPlan}
                  disabled={isSaving || (!canSaveMorePlans && !isCurrentPlanAlreadySaved)}
                  title={!canSaveMorePlans && !isCurrentPlanAlreadySaved ? "Maximum 5 saved plans reached" : ""}
                >
                  {justSaved ? (
                    <>
                      <Check className="mr-2" />
                      {t.saved}
                    </>
                  ) : (
                    <>
                      <FloppyDisk className="mr-2" />
                      {isSaving ? t.saving : t.savePlan}
                    </>
                  )}
                </Button>
              )}
              {currentUser && (savedMealPlans?.length ?? 0) > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setSavedPlansOpen(true)}
                  className="relative"
                >
                  <ClockClockwise className="mr-2" />
                  {t.history} ({savedMealPlans?.length ?? 0}/5)
                </Button>
              )}
              {hasMealPlan && (
                <Button
                  variant="outline"
                  onClick={() => setShoppingListOpen(true)}
                >
                  <List className="mr-2" />
                  {t.shoppingList}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setIsOnboarding(true)}
                title={t.profile}
              >
                <UserCircleGear />
              </Button>
              
              {currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={currentUser.avatarUrl} alt={currentUser.login} />
                        <AvatarFallback>{currentUser.login.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{currentUser.login}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {currentUser.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <SignOut className="mr-2" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="default"
                  onClick={() => window.location.href = '/.spark/login'}
                >
                  Log in
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {!hasMealPlan ? (
            <motion.div
              key="no-plan"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-card rounded-2xl p-8 border shadow-sm space-y-6 text-center">
                <div className="space-y-2">
                  <h2 className="font-heading text-3xl font-semibold">
                    Ready to generate your meal plan?
                  </h2>
                  <p className="text-muted-foreground">
                    We'll create a {userProfile!.meal_plan_days}-{t.day} meal plan with {userProfile!.meals_per_day} meals per day for €{userProfile!.budget_eur}
                    {userProfile!.budget_period === 'daily' ? '/day' : '/week'} based on your preferences.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                  {userProfile!.dietary_preferences.map((pref) => (
                    <span
                      key={pref}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                    >
                      {pref}
                    </span>
                  ))}
                </div>

                <Button
                  onClick={handleGeneratePlan}
                  size="lg"
                  disabled={isGenerating}
                  className="w-full max-w-sm"
                >
                  {isGenerating ? t.generating : t.generate}
                </Button>

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                    <span>🤖</span>
                    <span>{DISCLAIMERS.ai.short}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="has-plan"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-heading text-3xl font-bold">{t.yourMealPlan}</h2>
                  <p className="text-muted-foreground">
                    {mealPlan!.metadata.days}-{t.day} plan • Generated {new Date(mealPlan!.generated_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!mealPrepPlan && (
                    <Button
                      onClick={handleGeneratePrepPlan}
                      disabled={isGeneratingPrep}
                      variant="outline"
                    >
                      <ChefHat className="mr-2" />
                      {isGeneratingPrep ? 'Generating...' : 'Generate Prep Plan'}
                    </Button>
                  )}
                  <Button
                    onClick={handleExportToPDF}
                    variant="outline"
                  >
                    <FilePdf className="mr-2" />
                    {t.exportPDF}
                  </Button>
                  <Button
                    onClick={() => setShareMealPlanOpen(true)}
                    variant="outline"
                  >
                    <ShareNetwork className="mr-2" />
                    {t.sharePlan}
                  </Button>
                  <Button onClick={handleGeneratePlan} disabled={isGenerating}>
                    <Plus className="mr-2" />
                    {isGenerating ? t.generating : t.regenerate}
                  </Button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center justify-center py-20 space-y-6"
                  >
                    <motion.div
                      animate={{ 
                        rotate: 360,
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                        scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                      }}
                      className="text-6xl"
                    >
                      🍽️
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-center space-y-2"
                    >
                      <h3 className="font-heading text-2xl font-semibold text-foreground">
                        Generating your meal plan...
                      </h3>
                      <p className="text-muted-foreground">
                        Calculating nutrition, costs, and balancing your budget
                      </p>
                    </motion.div>
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                      className="w-64 h-1 bg-primary/20 rounded-full overflow-hidden"
                    >
                      <motion.div
                        animate={{ x: [-100, 300] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="h-full w-1/3 bg-primary rounded-full"
                      />
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={mealPlan!.plan_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'meals' | 'prep' | 'calendar')}>
                      <TabsList className="grid w-full max-w-2xl grid-cols-3">
                        <TabsTrigger value="meals">Meal Plan</TabsTrigger>
                        <TabsTrigger value="prep" disabled={!mealPrepPlan}>
                          Meal Prep {mealPrepPlan && '✓'}
                        </TabsTrigger>
                        <TabsTrigger value="calendar">
                          Progress & Trends
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="meals" className="mt-6">
                        <MealPlanView key={mealPlan!.plan_id} mealPlan={mealPlan!} onSwapMeal={handleSwapMeal} onRateMeal={handleRateMeal} mealRatings={mealRatingsMap} />
                      </TabsContent>
                      
                      <TabsContent value="prep" className="mt-6">
                        <AnimatePresence mode="wait">
                          {isGeneratingPrep ? (
                            <motion.div
                              key="loading-prep"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="flex flex-col items-center justify-center py-20 space-y-6"
                            >
                              <motion.div
                                animate={{ 
                                  rotate: 360,
                                  scale: [1, 1.1, 1]
                                }}
                                transition={{ 
                                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                                  scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                                }}
                                className="text-6xl"
                              >
                                👨‍🍳
                              </motion.div>
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-center space-y-2"
                              >
                                <h3 className="font-heading text-2xl font-semibold text-foreground">
                                  Generating your meal prep plan...
                                </h3>
                                <p className="text-muted-foreground">
                                  Organizing batch cooking sessions and prep schedules
                                </p>
                              </motion.div>
                              <motion.div
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                                className="w-64 h-1 bg-primary/20 rounded-full overflow-hidden"
                              >
                                <motion.div
                                  animate={{ x: [-100, 300] }}
                                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                  className="h-full w-1/3 bg-primary rounded-full"
                                />
                              </motion.div>
                            </motion.div>
                          ) : mealPrepPlan ? (
                            <MealPrepView key={mealPrepPlan.plan_id} prepPlan={mealPrepPlan} />
                          ) : (
                            <motion.div
                              key="no-prep"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="text-center py-12 text-muted-foreground"
                            >
                              <ChefHat size={48} className="mx-auto mb-4 opacity-50" />
                              <p>Generate a meal prep plan to see batch cooking recommendations</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </TabsContent>

                      <TabsContent value="calendar" className="mt-6">
                        <div className="space-y-6">
                          <MacroTrendsChart completedMeals={completedMeals || []} />
                          <MealCalendar mealPlan={mealPlan!} />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <OnboardingDialog
        open={isOnboarding && hasProfile}
        onOpenChange={setIsOnboarding}
        onSave={handleSaveProfile}
        existingProfile={userProfile}
      />

      {mealPlan && currentShoppingList && (
        <ShoppingListSheet
          open={shoppingListOpen}
          onOpenChange={setShoppingListOpen}
          shoppingList={currentShoppingList}
          onToggleOwned={handleToggleOwned}
          onDeleteItem={handleDeleteItem}
        />
      )}

      <SavedPlansDialog
        open={savedPlansOpen}
        onOpenChange={setSavedPlansOpen}
        savedPlans={savedMealPlans || []}
        onLoadPlan={handleLoadSavedPlan}
        onDeletePlan={handleDeleteSavedPlan}
        onSharePlan={handleShareSavedPlan}
      />

      {mealPlan && (
        <ShareMealPlanDialog
          open={shareMealPlanOpen}
          onOpenChange={setShareMealPlanOpen}
          mealPlan={mealPlan}
          language={language}
          t={t}
        />
      )}

      <AppFooter onDeleteAccount={currentUser ? () => setShowDeleteAccountDialog(true) : undefined} />

      <AlertDialog open={showDeleteAccountDialog} onOpenChange={setShowDeleteAccountDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete My Account & All Data</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                This will <strong>permanently and irreversibly delete</strong>:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Your user profile and preferences</li>
                <li>All saved meal plans (up to 5 plans)</li>
                <li>Your meal ratings and history</li>
                <li>Shopping lists and tracked items</li>
                <li>All associated data stored in our system</li>
              </ul>
              <p className="pt-2">
                Your session will be terminated and you will be logged out immediately.
              </p>
              <p className="text-xs text-muted-foreground pt-2">
                This action complies with GDPR Article 17 (Right to Erasure) and cannot be undone.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
              Yes, Delete Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </div>
  );
}

export default App;