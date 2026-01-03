import { Progress } from '@/components/ui/progress';
import { CurrencyDollar } from '@phosphor-icons/react';
import { useLanguage } from '@/hooks/use-language';

interface BudgetGaugeProps {
  budget: number;
  spent: number;
  isOverBudget: boolean;
  compact?: boolean;
}

export function BudgetGauge({ budget, spent, isOverBudget, compact = false }: BudgetGaugeProps) {
  const { t } = useLanguage();
  const remaining = budget - spent;
  const percentage = Math.min((spent / budget) * 100, 100);

  if (compact) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-card rounded-lg border">
        <CurrencyDollar className="text-primary" size={20} />
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium tabular-nums">
            €{spent.toFixed(2)} / €{budget.toFixed(2)}
          </span>
          {isOverBudget && (
            <span className="text-xs text-destructive font-medium">
              {t.overBudget}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-6 border space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CurrencyDollar className="text-primary" size={24} />
          <h3 className="font-heading text-lg font-semibold">{t.budget}</h3>
        </div>
        {isOverBudget && (
          <span className="px-3 py-1 bg-destructive/10 text-destructive rounded-full text-sm font-medium">
            {t.overBudget}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="font-heading text-3xl font-bold tabular-nums">
              €{remaining.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">{t.remaining}</div>
          </div>
          <div className="text-right">
            <div className="font-heading text-xl font-semibold tabular-nums text-muted-foreground">
              €{spent.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">{t.spent}</div>
          </div>
        </div>

        <Progress
          value={percentage}
          className="h-3"
        />

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>€0</span>
          <span>€{budget.toFixed(2)} {t.budget.toLowerCase()}</span>
        </div>
      </div>
    </div>
  );
}
