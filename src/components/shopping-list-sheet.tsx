import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ShoppingList, ShoppingListItem } from '@/types/domain';
import { ShoppingCart, CurrencyDollar, Export, Trash, Share, WhatsappLogo, Envelope, Copy, FilePdf, Users, Minus, Plus } from '@phosphor-icons/react';
import { exportShoppingList, GROCERY_SERVICES, type GroceryService } from '@/lib/grocery-export';
import { generateShoppingListText, shareViaWhatsApp, shareViaEmail, copyToClipboard } from '@/lib/share-shopping-list';
import { exportShoppingListToPDF } from '@/lib/export-shopping-list-pdf';
import { toast } from 'sonner';
import { useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { translateIngredient } from '@/lib/i18n/content-translations';
import { InfoTooltip } from '@/components/info-tooltip';
import { DISCLAIMERS, INFO_LABELS } from '@/lib/disclaimers';

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
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [multiplier, setMultiplier] = useState(1);

  const visibleItems = shoppingList.items.filter(item => !item.deleted);
  const ownedCount = visibleItems.filter(item => item.owned).length;
  const totalCostRemaining = visibleItems
    .filter(item => !item.owned)
    .reduce((sum, item) => sum + item.estimated_price_eur, 0) * multiplier;
  
  const adjustedPlanCost = shoppingList.summary.plan_cost_eur * multiplier;

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

  const handleShareWhatsApp = () => {
    const text = generateShoppingListText(shoppingList, language, true);
    shareViaWhatsApp(text);
    toast.success(t.shareViaWhatsApp);
  };

  const handleShareEmail = () => {
    const text = generateShoppingListText(shoppingList, language, true);
    const subject = `${t.shoppingList} - ${t.appName}`;
    shareViaEmail(text, subject);
    toast.success(t.shareViaEmail);
  };

  const handleCopyToClipboard = async () => {
    try {
      const text = generateShoppingListText(shoppingList, language, true);
      await copyToClipboard(text);
      toast.success(t.copiedToClipboard);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleExportPDF = () => {
    try {
      exportShoppingListToPDF(shoppingList, language, multiplier);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      toast.error('Failed to export PDF');
      console.error('PDF export error:', error);
    }
  };

  const handleMultiplierChange = (newValue: number) => {
    const value = Math.max(1, Math.min(10, newValue));
    setMultiplier(value);
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

        <div className="mt-6 space-y-4">
          <Card className="p-3 bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-primary" />
                <Label className="font-medium text-sm">Multiply portions by</Label>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleMultiplierChange(multiplier - 1)}
                  disabled={multiplier <= 1}
                >
                  <Minus size={14} />
                </Button>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={multiplier}
                  onChange={(e) => handleMultiplierChange(parseInt(e.target.value) || 1)}
                  className="text-center font-heading font-bold w-14 h-8 text-base"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleMultiplierChange(multiplier + 1)}
                  disabled={multiplier >= 10}
                >
                  <Plus size={14} />
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-3 bg-accent/10 border-accent/30">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-heading font-semibold text-sm">Cost Summary</h3>
              <InfoTooltip 
                content={DISCLAIMERS.cost.full} 
                ariaLabel={INFO_LABELS.costInfo}
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{t.planCost}:</span>
                <span className="font-heading text-base font-bold tabular-nums">
                  €{adjustedPlanCost.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{t.toBuy}:</span>
                <span className="font-heading text-base font-bold tabular-nums text-accent">
                  €{totalCostRemaining.toFixed(2)}
                </span>
              </div>
            </div>

            {shoppingList.summary.waste_cost_eur > 0 && (
              <>
                <Separator className="my-2" />
                <div className="text-center text-xs text-muted-foreground">
                  <span className="font-medium">€{(shoppingList.summary.waste_cost_eur * multiplier).toFixed(2)}</span> estimated unused portions
                </div>
              </>
            )}
          </Card>

          <div className="space-y-3">
            {!showExportOptions && !showShareOptions && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm">
                <p className="text-muted-foreground">
                  💡 Share your list via <strong>WhatsApp</strong> or <strong>Email</strong>, or export to delivery services!
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={handleExportPDF}
                className="w-full"
                size="lg"
                variant="outline"
              >
                <FilePdf className="mr-2" />
                PDF
              </Button>
              
              <Button
                onClick={() => {
                  setShowShareOptions(!showShareOptions);
                  setShowExportOptions(false);
                }}
                className="w-full"
                size="lg"
                variant={showShareOptions ? "default" : "outline"}
              >
                <Share className="mr-2" />
                Share
              </Button>
              
              <Button
                onClick={() => {
                  setShowExportOptions(!showExportOptions);
                  setShowShareOptions(false);
                }}
                className="w-full"
                size="lg"
                variant={showExportOptions ? "default" : "outline"}
              >
                <Export className="mr-2" />
                Export
              </Button>
            </div>

            {showShareOptions && (
              <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
                <h4 className="font-heading font-semibold text-sm text-muted-foreground mb-3">
                  {t.shareOptions}
                </h4>
                
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant="outline"
                    onClick={handleShareWhatsApp}
                    className="justify-start h-auto py-3 hover:bg-green-500/10 transition-all group"
                  >
                    <WhatsappLogo size={24} className="mr-3 text-green-600 group-hover:scale-110 transition-transform" weight="fill" />
                    <div className="flex-1 text-left">
                      <div className="font-semibold">{t.shareViaWhatsApp}</div>
                      <div className="text-xs text-muted-foreground">Share your shopping list instantly</div>
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleShareEmail}
                    className="justify-start h-auto py-3 hover:bg-blue-500/10 transition-all group"
                  >
                    <Envelope size={24} className="mr-3 text-blue-600 group-hover:scale-110 transition-transform" weight="fill" />
                    <div className="flex-1 text-left">
                      <div className="font-semibold">{t.shareViaEmail}</div>
                      <div className="text-xs text-muted-foreground">Send via your email client</div>
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleCopyToClipboard}
                    className="justify-start h-auto py-3 hover:bg-accent/10 transition-all group"
                  >
                    <Copy size={24} className="mr-3 text-accent group-hover:scale-110 transition-transform" weight="bold" />
                    <div className="flex-1 text-left">
                      <div className="font-semibold">{t.copyToClipboard}</div>
                      <div className="text-xs text-muted-foreground">Copy as text to share anywhere</div>
                    </div>
                  </Button>
                </div>
              </div>
            )}

            {showExportOptions && (
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                <h4 className="font-heading font-semibold text-sm text-muted-foreground mb-3">
                  {t.chooseExportFormat}
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground mb-2 px-1">🇪🇺 EU DELIVERY SERVICES</div>
                    <div className="grid grid-cols-1 gap-2">
                      {(Object.entries(GROCERY_SERVICES) as [GroceryService, typeof GROCERY_SERVICES[GroceryService]][])
                        .filter(([_, config]) => config.region === 'EU')
                        .map(([key, config]) => (
                          <Button
                            key={key}
                            variant="outline"
                            onClick={() => handleExport(key)}
                            className="justify-start h-auto py-3 hover:bg-accent/10 transition-all group"
                          >
                            <span className="text-xl mr-3 group-hover:scale-110 transition-transform">{config.icon}</span>
                            <div className="flex-1 text-left">
                              <div className="font-semibold">{config.name}</div>
                              <div className="text-xs text-muted-foreground">{config.description}</div>
                            </div>
                          </Button>
                        ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground mb-2 px-1">🌍 GLOBAL SERVICES</div>
                    <div className="grid grid-cols-1 gap-2">
                      {(Object.entries(GROCERY_SERVICES) as [GroceryService, typeof GROCERY_SERVICES[GroceryService]][])
                        .filter(([_, config]) => config.region === 'Global' || config.region === 'US')
                        .map(([key, config]) => (
                          <Button
                            key={key}
                            variant="outline"
                            onClick={() => handleExport(key)}
                            className="justify-start h-auto py-3 hover:bg-accent/10 transition-all group"
                          >
                            <span className="text-xl mr-3 group-hover:scale-110 transition-transform">{config.icon}</span>
                            <div className="flex-1 text-left">
                              <div className="font-semibold">{config.name}</div>
                              <div className="text-xs text-muted-foreground">{config.description}</div>
                            </div>
                          </Button>
                        ))}
                    </div>
                  </div>
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
                    {(item.total_quantity * multiplier).toFixed(0)}{item.unit}
                    {item.minimum_purchase_quantity > item.total_quantity && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        min {(item.minimum_purchase_quantity * multiplier).toFixed(0)}{item.unit}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`font-heading font-semibold tabular-nums ${
                    item.owned ? 'text-muted-foreground line-through' : 'text-accent'
                  }`}>
                    €{(item.estimated_price_eur * multiplier).toFixed(2)}
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
