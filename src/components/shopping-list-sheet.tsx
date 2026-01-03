import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ShoppingList } from '@/types/domain';
import { ShoppingCart, CurrencyDollar, Export } from '@phosphor-icons/react';
import { exportShoppingList, GROCERY_SERVICES, type GroceryService } from '@/lib/grocery-export';
import { toast } from 'sonner';
import { useState } from 'react';

interface ShoppingListSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shoppingList: ShoppingList;
}

export function ShoppingListSheet({ open, onOpenChange, shoppingList }: ShoppingListSheetProps) {
  const [showExportOptions, setShowExportOptions] = useState(false);

  const handleExport = (service: GroceryService) => {
    try {
      (window as any).showToast = (message: string) => toast.success(message);
      exportShoppingList(shoppingList, service);
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
            <SheetTitle className="font-heading text-2xl">Shopping List</SheetTitle>
          </div>
          <SheetDescription>
            Aggregated ingredients for your {shoppingList.summary.total_items} item shopping trip
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <Card className="p-4 bg-accent/10 border-accent/30">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-muted-foreground">Items</div>
                <div className="font-heading text-xl font-bold">{shoppingList.summary.total_items}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Plan Cost</div>
                <div className="font-heading text-xl font-bold tabular-nums">
                  €{shoppingList.summary.plan_cost_eur.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Shopping Cost</div>
                <div className="font-heading text-xl font-bold tabular-nums text-accent">
                  €{shoppingList.summary.total_shopping_cost_eur.toFixed(2)}
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
              Export to Grocery Service
            </Button>

            {showExportOptions && (
              <div className="space-y-2 p-4 bg-muted/30 rounded-lg border">
                <h4 className="font-heading font-semibold text-sm text-muted-foreground mb-3">
                  Choose Export Format
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
              Your Shopping List
            </h3>
            {shoppingList.items.map((item) => (
              <div
                key={item.ingredient_id}
                className="flex items-center justify-between py-3 px-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium">{item.display_name}</div>
                  <div className="text-sm text-muted-foreground tabular-nums">
                    {item.total_quantity}{item.unit}
                    {item.minimum_purchase_quantity > item.total_quantity && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        min {item.minimum_purchase_quantity}{item.unit}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="font-heading font-semibold text-accent tabular-nums">
                  €{item.estimated_price_eur.toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CurrencyDollar size={20} className="text-primary" />
                <span className="font-heading font-semibold">Total Estimated Cost</span>
              </div>
              <div className="font-heading text-2xl font-bold text-primary tabular-nums">
                €{shoppingList.summary.total_shopping_cost_eur.toFixed(2)}
              </div>
            </div>
          </Card>

          <p className="text-xs text-muted-foreground text-center">
            Prices are estimates based on regional averages. Actual costs may vary by store and location.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
