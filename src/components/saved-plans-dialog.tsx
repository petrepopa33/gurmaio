import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { MealPlan } from '@/types/domain';
import { Calendar, CurrencyDollar, FireSimple, Barbell, Trash, Eye, ShareNetwork, FilePdf } from '@phosphor-icons/react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { exportMealPlanToPDF } from '@/lib/export-meal-plan-pdf';
import { useLanguage } from '@/hooks/use-language';
import { toast } from 'sonner';
import { EMPTY_STATES } from '@/lib/disclaimers';

interface SavedPlansDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  savedPlans: MealPlan[];
  onLoadPlan: (plan: MealPlan) => void;
  onDeletePlan: (planId: string) => void;
  onSharePlan?: (plan: MealPlan) => void;
}

export function SavedPlansDialog({ 
  open, 
  onOpenChange, 
  savedPlans, 
  onLoadPlan,
  onDeletePlan,
  onSharePlan 
}: SavedPlansDialogProps) {
  const { language } = useLanguage();
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);

  const handleDeleteClick = (planId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPlanToDelete(planId);
  };

  const handleShareClick = (plan: MealPlan, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSharePlan) {
      onSharePlan(plan);
    }
  };

  const handleExportPDF = (plan: MealPlan, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      exportMealPlanToPDF(plan, language);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      toast.error('Failed to export PDF');
      console.error('PDF export error:', error);
    }
  };

  const handleConfirmDelete = () => {
    if (planToDelete) {
      onDeletePlan(planToDelete);
      setPlanToDelete(null);
    }
  };

  const sortedPlans = [...savedPlans].sort((a, b) => 
    new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime()
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">Saved Meal Plans</DialogTitle>
            <DialogDescription>
              View and manage your previously saved meal plans ({sortedPlans.length}/5)
            </DialogDescription>
          </DialogHeader>

          {sortedPlans.length >= 5 && (
            <Alert className="border-accent/50 bg-accent/10">
              <AlertDescription className="text-sm">
                <strong>Storage limit reached:</strong> You can save up to 5 meal plans. Delete an old plan to save a new one.
              </AlertDescription>
            </Alert>
          )}

          {sortedPlans.length >= 4 && sortedPlans.length < 5 && (
            <Alert className="border-muted-foreground/30 bg-muted/50">
              <AlertDescription className="text-sm">
                You have {5 - sortedPlans.length} slot{5 - sortedPlans.length !== 1 ? 's' : ''} remaining.
              </AlertDescription>
            </Alert>
          )}

          {sortedPlans.length === 0 ? (
            <div className="py-12 text-center">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="font-heading text-xl font-semibold mb-2">No saved plans yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {EMPTY_STATES.noSavedPlans}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {sortedPlans.map((plan) => (
                  <SavedPlanCard
                    key={plan.plan_id}
                    plan={plan}
                    onLoad={() => {
                      onLoadPlan(plan);
                      onOpenChange(false);
                    }}
                    onDelete={(e) => handleDeleteClick(plan.plan_id, e)}
                    onShare={(e) => handleShareClick(plan, e)}
                    onExportPDF={(e) => handleExportPDF(plan, e)}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={planToDelete !== null} onOpenChange={(open) => !open && setPlanToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete meal plan?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this meal plan from your saved history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface SavedPlanCardProps {
  plan: MealPlan;
  onLoad: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
  onExportPDF: (e: React.MouseEvent) => void;
}

function SavedPlanCard({ plan, onLoad, onDelete, onShare, onExportPDF }: SavedPlanCardProps) {
  const generatedDate = new Date(plan.generated_at);
  const isOverBudget = plan.metadata.is_over_budget;

  return (
    <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer group" onClick={onLoad}>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar size={16} />
                <span>
                  {generatedDate.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
              <Badge variant={isOverBudget ? "destructive" : "default"}>
                {plan.metadata.days}-day plan
              </Badge>
              {isOverBudget && (
                <Badge variant="destructive">Over Budget</Badge>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CurrencyDollar size={14} />
                  <span>Total Cost</span>
                </div>
                <div className="font-heading font-semibold text-lg tabular-nums text-accent">
                  €{plan.plan_totals.total_cost_eur.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Budget: €{plan.metadata.period_budget_eur.toFixed(2)}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <FireSimple size={14} />
                  <span>Calories</span>
                </div>
                <div className="font-heading font-semibold text-lg tabular-nums">
                  {plan.plan_totals.calories.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">total</div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Barbell size={14} />
                  <span>Protein</span>
                </div>
                <div className="font-heading font-semibold text-lg tabular-nums">
                  {plan.plan_totals.protein_g}g
                </div>
                <div className="text-xs text-muted-foreground">total</div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Macros</div>
                <div className="text-sm tabular-nums">
                  {plan.plan_totals.carbohydrates_g}g C
                </div>
                <div className="text-sm tabular-nums">
                  {plan.plan_totals.fats_g}g F
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onLoad();
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Eye className="mr-2" />
              Load
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onExportPDF}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              title="Export to PDF"
            >
              <FilePdf />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onShare}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ShareNetwork />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash />
            </Button>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">
            {plan.days.reduce((sum, day) => sum + day.meals.length, 0)} meals total
          </div>
          {isOverBudget && (
            <Alert className="p-2 border-destructive/50 bg-destructive/5 inline-flex items-center gap-2">
              <AlertDescription className="text-xs text-destructive p-0 m-0">
                €{(plan.metadata.period_cost_eur - plan.metadata.period_budget_eur).toFixed(2)} over budget
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </Card>
  );
}
