import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import type { MealPlan, UserProfile, ShoppingList } from '@/types/domain';
import { generateMealPlan, generateShoppingList } from '@/lib/mock-data';
import { generateMealSubstitution } from '@/lib/meal-substitution';
import { OnboardingDialog } from '@/components/onboarding-dialog';
import { MealPlanView } from '@/components/meal-plan-view';
import { ShoppingListSheet } from '@/components/shopping-list-sheet';
import { BudgetGauge } from '@/components/budget-gauge';
import { SavedPlansDialog } from '@/components/saved-plans-dialog';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ShareMealPlanDialog } from '@/components/share-meal-plan-dialog';
import { AppFooter } from '@/components/app-footer';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Toaster } from '@/components/ui/sonner';
import { Plus, List, UserCircleGear, SignOut, FloppyDisk, Check, ClockClockwise, ShareNetwork, FilePdf } from '@phosphor-icons/react';
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
  const [shoppingListState, setShoppingListState] = useKV<ShoppingList | null>('shopping_list_state', null);
  const [savedMealPlans, setSavedMealPlans] = useKV<MealPlan[]>('saved_meal_plans', []);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shoppingListOpen, setShoppingListOpen] = useState(false);
  const [savedPlansOpen, setSavedPlansOpen] = useState(false);
  const [shareMealPlanOpen, setShareMealPlanOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);

  const hasProfile = userProfile !== null;
  const hasMealPlan = mealPlan !== null;
  const canSaveMorePlans = (savedMealPlans?.length ?? 0) < 5;
  const isCurrentPlanAlreadySaved = mealPlan ? (savedMealPlans || []).some(p => p.plan_id === mealPlan.plan_id) : false;

  const currentShoppingList = shoppingListState || (mealPlan ? generateShoppingList(mealPlan) : null);

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
      setCurrentUser(null);
      
      await fetch('/.spark/logout', { 
        method: 'POST',
        credentials: 'same-origin'
      });
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      setCurrentUser(null);
      window.location.reload();
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
      const newPlan = await generateMealPlan(userProfile);
      setMealPlan(() => newPlan);
      setShoppingListState(() => null);
      
      toast.success('Meal plan generated successfully!');
    } catch (error) {
      console.error('Error generating meal plan:', error);
      toast.error('Failed to generate meal plan. Please try again.');
    } finally {
      setIsGenerating(false);
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
      setUserProfile(() => null);
      setMealPlan(() => null);
      setShoppingListState(() => null);
      setSavedMealPlans(() => []);
      
      await handleLogout();
      
      toast.success('All your data has been deleted');
      setShowDeleteAccountDialog(false);
    } catch (error) {
      toast.error('Failed to delete account data');
      console.error('Delete account error:', error);
    }
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
        mealPlan
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
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="flex items-center justify-end gap-2">
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
          
          <div className="space-y-4">
            <h1 className="font-heading text-5xl font-bold text-primary tracking-tight">
              {t.appName}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t.tagline}
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 border shadow-sm space-y-6">
            {!currentUser && (
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6">
                <p className="text-sm">
                  <strong>✨ No login required to try Gurmaio</strong>
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {EMPTY_STATES.guestMode}
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <h2 className="font-heading text-2xl font-semibold">{t.welcome}</h2>
              <p className="text-muted-foreground">
                Let's create your personalized meal plan based on your budget, dietary preferences, and nutrition goals.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
              <div className="space-y-2">
                <div className="text-3xl">💰</div>
                <h3 className="font-heading font-medium">Budget-First</h3>
                <p className="text-sm text-muted-foreground">
                  Every meal plan respects your budget with transparent cost breakdowns
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl">🎯</div>
                <h3 className="font-heading font-medium">Precise Nutrition</h3>
                <p className="text-sm text-muted-foreground">
                  Deterministic calculations for calories, protein, carbs, and fats
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl">🛒</div>
                <h3 className="font-heading font-medium">Smart Shopping</h3>
                <p className="text-sm text-muted-foreground">
                  Aggregated shopping lists with realistic grocery costs
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {!currentUser && (
                <Button
                  onClick={() => window.location.href = '/.spark/login'}
                  size="lg"
                  className="w-full"
                  variant="default"
                >
                  {t.login}
                </Button>
              )}
              <Button
                onClick={() => setIsOnboarding(true)}
                size="lg"
                className="w-full"
                variant={currentUser ? "default" : "outline"}
              >
                <Plus className="mr-2" />
                {currentUser ? t.getStarted : t.continueAsGuest}
              </Button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Production-ready architecture • Cloud-native • Edge-first
          </p>
        </div>

        <OnboardingDialog
          open={isOnboarding}
          onOpenChange={setIsOnboarding}
          onSave={handleSaveProfile}
        />

        <AppFooter onDeleteAccount={currentUser ? () => setShowDeleteAccountDialog(true) : undefined} />

        <AlertDialog open={showDeleteAccountDialog} onOpenChange={setShowDeleteAccountDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete All Your Data</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete your profile, all saved meal plans, and shopping lists. This action cannot be undone.
                
                You will be logged out after deletion.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                Delete Everything
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
        {!hasMealPlan ? (
          <div className="max-w-3xl mx-auto">
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
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-3xl font-bold">{t.yourMealPlan}</h2>
                <p className="text-muted-foreground">
                  {mealPlan!.metadata.days}-{t.day} plan • Generated {new Date(mealPlan!.generated_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
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

            <MealPlanView mealPlan={mealPlan!} onSwapMeal={handleSwapMeal} />
          </div>
        )}
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
            <AlertDialogTitle>Delete All Your Data</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your profile, all saved meal plans, and shopping lists. This action cannot be undone.
              
              You will be logged out after deletion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
              Delete Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </div>
  );
}

export default App;