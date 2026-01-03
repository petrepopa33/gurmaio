import { useState } from 'react';
import type { MealPlan } from '@/types/domain';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WhatsappLogo, EnvelopeSimple, Copy, Check } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { generateMealPlanText, generateMealPlanSummary, shareViaWhatsApp, shareViaEmail, copyToClipboard } from '@/lib/share-meal-plan';
import type { Language } from '@/lib/i18n/translations';

interface ShareMealPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealPlan: MealPlan;
  language: Language;
  t: any;
}

export function ShareMealPlanDialog({
  open,
  onOpenChange,
  mealPlan,
  language,
  t,
}: ShareMealPlanDialogProps) {
  const [shareFormat, setShareFormat] = useState<'full' | 'summary'>('summary');
  const [copied, setCopied] = useState(false);

  const handleShare = (method: 'whatsapp' | 'email' | 'copy') => {
    const text = shareFormat === 'full' 
      ? generateMealPlanText(mealPlan, language)
      : generateMealPlanSummary(mealPlan, language);

    switch (method) {
      case 'whatsapp':
        shareViaWhatsApp(text);
        toast.success(t.shareViaWhatsApp);
        break;
      case 'email':
        shareViaEmail(text, `${t.mealPlan} - ${t.appName}`);
        break;
      case 'copy':
        copyToClipboard(text)
          .then(() => {
            setCopied(true);
            toast.success(t.copiedToClipboard);
            setTimeout(() => setCopied(false), 2000);
          })
          .catch(() => {
            toast.error('Failed to copy');
          });
        break;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">{t.shareMealPlan}</DialogTitle>
          <DialogDescription>
            {t.shareMealPlanOptions}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={shareFormat} onValueChange={(v) => setShareFormat(v as 'full' | 'summary')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="summary">{t.summary}</TabsTrigger>
            <TabsTrigger value="full">{t.fullDetails}</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4 mt-4">
            <div className="text-sm text-muted-foreground">
              Share a concise overview with meals and nutrition totals
            </div>
          </TabsContent>

          <TabsContent value="full" className="space-y-4 mt-4">
            <div className="text-sm text-muted-foreground">
              Share complete details including all ingredients and nutrition per meal
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex flex-col gap-3 pt-4">
          <Button
            onClick={() => handleShare('whatsapp')}
            variant="default"
            className="w-full justify-start gap-3"
          >
            <WhatsappLogo size={20} weight="fill" />
            {t.shareViaWhatsApp}
          </Button>

          <Button
            onClick={() => handleShare('email')}
            variant="outline"
            className="w-full justify-start gap-3"
          >
            <EnvelopeSimple size={20} weight="fill" />
            {t.shareViaEmail}
          </Button>

          <Button
            onClick={() => handleShare('copy')}
            variant="outline"
            className="w-full justify-start gap-3"
          >
            {copied ? <Check size={20} /> : <Copy size={20} />}
            {t.copyToClipboard}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
