import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MonthlyProgressCard } from '@/components/monthly-progress-card';
import { StreakCounter } from '@/components/streak-counter';
import type { DayProgress, MonthlyProgress, Badge } from '@/types/domain';
import { calculateMonthlyProgress, generateBadgeImage } from '@/lib/monthly-progress';
import { toast } from 'sonner';
import { Trophy, CalendarBlank } from '@phosphor-icons/react';

interface ProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dayProgress: DayProgress[];
  badges: Badge[];
  onBadgeGenerated: (badge: Badge) => void;
  locale: string;
}

export function ProgressDialog({
  open,
  onOpenChange,
  dayProgress,
  badges,
  onBadgeGenerated,
  locale,
}: ProgressDialogProps) {
  const [monthlyData, setMonthlyData] = useState<MonthlyProgress[]>([]);
  const [activeTab, setActiveTab] = useState<'progress' | 'badges'>('progress');

  useEffect(() => {
    if (open && dayProgress.length > 0) {
      calculateAllMonthlyProgress();
    }
  }, [open, dayProgress]);

  const calculateAllMonthlyProgress = async () => {
    const monthsMap = new Map<string, { month: string; year: number }>();

    dayProgress.forEach((day) => {
      const date = new Date(day.date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const key = `${year}-${month}`;
      monthsMap.set(key, { month, year });
    });

    const progressData: MonthlyProgress[] = [];

    for (const [, { month, year }] of monthsMap) {
      const progress = calculateMonthlyProgress(dayProgress, month, year);
      progressData.push(progress);

      if (progress.badge_earned && !badges.some(b => b.month === month && b.year === year)) {
        await generateAndSaveBadge(progress);
      }
    }

    progressData.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return parseInt(b.month) - parseInt(a.month);
    });

    setMonthlyData(progressData);
  };

  const generateAndSaveBadge = async (progress: MonthlyProgress) => {
    try {
      const imageDataUrl = await generateBadgeImage(progress, locale);

      const badge: Badge = {
        badge_id: `badge-${progress.year}-${progress.month}`,
        month: progress.month,
        year: progress.year,
        earned_at: progress.badge_earned_at || new Date().toISOString(),
        completion_percentage: progress.completion_percentage,
        total_days_completed: progress.days_completed,
        total_meals: progress.total_meals_completed,
        image_data_url: imageDataUrl,
      };

      onBadgeGenerated(badge);
    } catch (error) {
      console.error('Failed to generate badge:', error);
    }
  };

  const handleShareBadge = async (badge: Badge) => {
    if (!badge.image_data_url) {
      toast.error('Badge image not available');
      return;
    }

    try {
      const blob = await (await fetch(badge.image_data_url)).blob();
      const file = new File([blob], `gurmaio-badge-${badge.year}-${badge.month}.png`, {
        type: 'image/png',
      });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'My Gurmaio Achievement!',
          text: `I completed every day of meal planning in ${badge.month}/${badge.year}! 🏆`,
          files: [file],
        });
        toast.success('Badge shared successfully!');
      } else {
        const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          `I completed every day of meal planning with @Gurmaio! 🏆 ${badge.month}/${badge.year}`
        )}`;
        window.open(shareUrl, '_blank');
      }
    } catch (error) {
      console.error('Share failed:', error);
      toast.error('Failed to share badge');
    }
  };

  const handleDownloadBadge = (badge: Badge) => {
    if (!badge.image_data_url) {
      toast.error('Badge image not available');
      return;
    }

    const link = document.createElement('a');
    link.href = badge.image_data_url;
    link.download = `gurmaio-badge-${badge.year}-${badge.month}.png`;
    link.click();
    toast.success('Badge downloaded!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy weight="duotone" size={24} />
            Your Progress & Achievements
          </DialogTitle>
          <DialogDescription>
            Track your meal plan completion and earn badges for perfect months
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="progress">
              <CalendarBlank className="mr-2" size={16} />
              Monthly Progress
            </TabsTrigger>
            <TabsTrigger value="badges">
              <Trophy className="mr-2" size={16} />
              Badges ({badges.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="flex-1 mt-4">
            <ScrollArea className="h-[500px] pr-4">
              {monthlyData.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarBlank size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Start tracking your meals to see monthly progress
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <StreakCounter completedDays={dayProgress} />
                  
                  {monthlyData.map((progress) => {
                    const badge = badges.find(
                      (b) => b.month === progress.month && b.year === progress.year
                    );
                    return (
                      <MonthlyProgressCard
                        key={`${progress.year}-${progress.month}`}
                        monthlyProgress={progress}
                        badge={badge}
                        onShareBadge={handleShareBadge}
                        onDownloadBadge={handleDownloadBadge}
                        locale={locale}
                      />
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="badges" className="flex-1 mt-4">
            <ScrollArea className="h-[500px] pr-4">
              {badges.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-2">No badges earned yet</p>
                  <p className="text-sm text-muted-foreground">
                    Complete every day in a month to earn your first badge!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {badges.map((badge) => (
                    <div
                      key={badge.badge_id}
                      className="border rounded-lg p-4 space-y-4 bg-card hover:shadow-md transition-shadow"
                    >
                      {badge.image_data_url && (
                        <img
                          src={badge.image_data_url}
                          alt={`Badge for ${badge.month}/${badge.year}`}
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                      )}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">
                            {badge.month}/{badge.year}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(badge.earned_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleShareBadge(badge)}
                            className="flex-1"
                          >
                            Share
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadBadge(badge)}
                            className="flex-1"
                          >
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
