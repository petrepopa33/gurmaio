import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { ShoppingList, ShoppingListItem } from '@/types/domain';
import { ShoppingCart, CurrencyDollar, Export, Trash } from '@phosphor-icons/react';
import { exportShoppingList, GROCERY_SERVICES, type GroceryService } from '@/lib/grocery-export';
import { toast } from 'sonner';
import { useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { translateIngredient } from '@/lib/i18n/content-translations';

interface ShoppingListSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shoppingList: ShoppingList;
  onToggleOwned?: (ingredientId: string) => void;
  onDeleteItem?: (ingredientId: string) => void;
}

export function ShoppingListSheet({ open, onOpenChange, shoppingList, onToggleOwned, onDeleteItem }: ShoppingListSheetProps) {
  const { language, t } = useLanguage();
  const [showExportOptions, setShowExportOptions] = useState(false);

  const visibleItems = shoppingList.items.filter(item => !item.deleted);
  const ownedCount = visibleItems.filter(item => item.owned).length;
  const totalCostRemaining = visibleItems
    .filter(item => !item.owned)
    .reduce((sum, item) => sum + item.estimated_price_eur, 0);

  const handleExport = (service: GroceryService) => {
    try {
      (window as any).showToast = (message: string) => toast.success(message);
      const exportList = {
        ...shoppingList,
        items: visibleItems.filter(item => !item.owned)
      };
      exportShoppingList(exportList, service);
      setShowExportOptions(false);
    } catch (error) {
      toast.error('Export failed. Please try again.');
      console.error('Export error:', error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center gap-2">
            <ShoppingCart size={24} className="text-primary" />
            <SheetTitle className="font-heading text-2xl">{t.shoppingList}</SheetTitle>
          </div>
          <SheetDescription>
            {shoppingList.summary.total_items} {t.items}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <Card className="p-4 bg-accent/10 border-accent/30">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-muted-foreground">{t.items}</div>
                <div className="font-heading text-xl font-bold">
                  {visibleItems.length - ownedCount}/{visibleItems.length}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">{t.planCost}</div>
                <div className="font-heading text-xl font-bold tabular-nums">
                  €{shoppingList.summary.plan_cost_eur.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">{t.toBuy}</div>
                <div className="font-heading text-xl font-bold tabular-nums text-accent">
                  €{totalCostRemaining.toFixed(2)}
                </div>
              </div>
            </div>

            {shoppingList.summary.waste_cost_eur > 0 && (
              <>
                <Separator className="my-3" />
                <div className="text-center text-sm text-muted-foreground">
                  <span className="font-medium">€{shoppingList.summary.waste_cost_eur.toFixed(2)}</span> estimated unused portions
                </div>
              </>
            )}
          </Card>

          <div className="space-y-3">
            <Button
              onClick={() => setShowExportOptions(!showExportOptions)}
              className="w-full"
              size="lg"
            >
              <Export className="mr-2" />
              {t.exportToGrocery}
            </Button>

            {showExportOptions && (
              <div className="space-y-2 p-4 bg-muted/30 rounded-lg border">
                <h4 className="font-heading font-semibold text-sm text-muted-foreground mb-3">
                  {t.chooseExportFormat}
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {(Object.entries(GROCERY_SERVICES) as [GroceryService, typeof GROCERY_SERVICES[GroceryService]][]).map(
                    ([key, config]) => (
                      <Button
                        key={key}
                        variant="outline"
                        onClick={() => handleExport(key)}
                        className="justify-start h-auto py-3 hover:bg-background"
                      >
                        <span className="text-xl mr-3">{config.icon}</span>
                        <span className="font-medium">{config.name}</span>
                      </Button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="font-heading font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              {t.yourShoppingList}
            </h3>
            {visibleItems.map((item) => (
              <div
                key={item.ingredient_id}
                className={`flex items-center gap-3 py-3 px-4 rounded-lg border transition-all ${
                  item.owned
                    ? 'bg-muted/30 opacity-60'
                    : 'hover:bg-muted/50'
                }`}
              >
                <Checkbox
                  id={`item-${item.ingredient_id}`}
                  checked={item.owned || false}
                  onCheckedChange={() => onToggleOwned?.(item.ingredient_id)}
                  className="flex-shrink-0"
                />
                <div className="flex-1">
                  <label
                    htmlFor={`item-${item.ingredient_id}`}
                    className={`font-medium cursor-pointer ${
                      item.owned ? 'line-through text-muted-foreground' : ''
                    }`}
                  >
                    {translateIngredient(item.display_name, language)}
                  </label>
                  <div className="text-sm text-muted-foreground tabular-nums">
                    {item.total_quantity}{item.unit}
                    {item.minimum_purchase_quantity > item.total_quantity && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        min {item.minimum_purchase_quantity}{item.unit}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`font-heading font-semibold tabular-nums ${
                    item.owned ? 'text-muted-foreground line-through' : 'text-accent'
                  }`}>
                    €{item.estimated_price_eur.toFixed(2)}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      onDeleteItem?.(item.ingredient_id);
                      toast.success(t.itemRemoved);
                    }}
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CurrencyDollar size={20} className="text-primary" />
                <span className="font-heading font-semibold">{t.totalToBuy}</span>
              </div>
              <div className="font-heading text-2xl font-bold text-primary tabular-nums">
                €{totalCostRemaining.toFixed(2)}
              </div>
            </div>
            {ownedCount > 0 && (
              <div className="mt-2 text-sm text-muted-foreground text-center">
                {t.alreadyHave} {ownedCount} {t.item}{ownedCount !== 1 ? 's' : ''}
              </div>
            )}
          </Card>

          <p className="text-xs text-muted-foreground text-center">
            Prices are estimates based on regional averages. Actual costs may vary by store and location.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
