import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge as BadgeUI } from '@/components/ui/badge';
import { ShareNetwork, Download, Trophy, CheckCircle, CalendarBlank } from '@phosphor-icons/react';
import type { MonthlyProgress, Badge } from '@/types/domain';
import { getMonthName } from '@/lib/monthly-progress';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface MonthlyProgressCardProps {
  monthlyProgress: MonthlyProgress;
  badge?: Badge;
  onShareBadge: (badge: Badge) => void;
  onDownloadBadge: (badge: Badge) => void;
  locale: string;
}

export function MonthlyProgressCard({
  monthlyProgress,
  badge,
  onShareBadge,
  onDownloadBadge,
  locale,
}: MonthlyProgressCardProps) {
  const monthName = getMonthName(monthlyProgress.month, locale);
  const [showBadgeAnimation, setShowBadgeAnimation] = useState(false);

  useEffect(() => {
    if (monthlyProgress.badge_earned && badge) {
      setShowBadgeAnimation(true);
      const timer = setTimeout(() => setShowBadgeAnimation(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [monthlyProgress.badge_earned, badge]);

  const isCurrentMonth = () => {
    const now = new Date();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const currentYear = now.getFullYear();
    return monthlyProgress.month === currentMonth && monthlyProgress.year === currentYear;
  };

  return (
    <Card className="p-6 relative overflow-hidden">
      <AnimatePresence>
        {showBadgeAnimation && (
          <motion.div
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: 180, opacity: 0 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="absolute inset-0 flex items-center justify-center bg-primary/10 backdrop-blur-sm z-10"
          >
            <div className="text-center space-y-4">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 0.5,
                  repeat: 2,
                  repeatType: 'reverse'
                }}
                className="text-8xl"
              >
                🏆
              </motion.div>
              <h3 className="text-2xl font-bold text-primary">Perfect Month!</h3>
              <p className="text-muted-foreground">You completed every day!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <CalendarBlank weight="duotone" size={24} />
            {monthName} {monthlyProgress.year}
          </h3>
          {isCurrentMonth() && (
            <BadgeUI variant="outline" className="mt-2">Current Month</BadgeUI>
          )}
        </div>
        {monthlyProgress.badge_earned && (
          <div className="text-4xl">
            🏆
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm font-bold text-primary">
              {monthlyProgress.completion_percentage}%
            </span>
          </div>
          <Progress value={monthlyProgress.completion_percentage} className="h-3" />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Days Completed</p>
            <p className="text-2xl font-bold">
              {monthlyProgress.days_completed}
              <span className="text-sm text-muted-foreground font-normal">
                /{monthlyProgress.total_days_in_month}
              </span>
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Meals Tracked</p>
            <p className="text-2xl font-bold">{monthlyProgress.total_meals_completed}</p>
          </div>
        </div>

        {monthlyProgress.total_meals_completed > 0 && (
          <div className="pt-4 border-t space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Monthly Totals</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Calories:</span>
                <span className="font-semibold ml-2">
                  {Math.round(monthlyProgress.total_nutrition.calories).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Cost:</span>
                <span className="font-semibold ml-2">€{monthlyProgress.total_cost.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Protein:</span>
                <span className="font-semibold ml-2">
                  {Math.round(monthlyProgress.total_nutrition.protein_g)}g
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Carbs:</span>
                <span className="font-semibold ml-2">
                  {Math.round(monthlyProgress.total_nutrition.carbohydrates_g)}g
                </span>
              </div>
            </div>
          </div>
        )}

        {badge && monthlyProgress.badge_earned && (
          <div className="pt-4 border-t space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Trophy weight="fill" size={20} />
              <span>Achievement Unlocked!</span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onShareBadge(badge)}
                className="flex-1"
              >
                <ShareNetwork className="mr-2" size={16} />
                Share
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDownloadBadge(badge)}
                className="flex-1"
              >
                <Download className="mr-2" size={16} />
                Download
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
