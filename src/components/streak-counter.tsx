import { Card } from '@/components/ui/card';
import { Flame, TrendUp } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { calculateStreak } from '@/lib/streak-calculator';
import type { DayProgress } from '@/types/domain';

interface StreakCounterProps {
  completedDays: DayProgress[];
  compact?: boolean;
}

export function StreakCounter({ completedDays, compact = false }: StreakCounterProps) {
  const streakInfo = calculateStreak(completedDays);

  if (compact) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-card border rounded-lg">
        <div className="flex items-center gap-2">
          <Flame 
            size={20} 
            weight="fill" 
            className={streakInfo.streakActive ? 'text-orange-500' : 'text-muted-foreground'}
          />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Streak</span>
            <span className="text-sm font-bold">{streakInfo.currentStreak} days</span>
          </div>
        </div>
        
        {streakInfo.longestStreak > 0 && (
          <div className="h-6 w-px bg-border" />
        )}
        
        {streakInfo.longestStreak > 0 && (
          <div className="flex items-center gap-2">
            <TrendUp size={16} className="text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Best</span>
              <span className="text-sm font-medium">{streakInfo.longestStreak}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-1">Your Streak</h3>
          <p className="text-sm text-muted-foreground">
            {streakInfo.streakActive 
              ? 'Keep going! Complete today to maintain your streak' 
              : streakInfo.currentStreak > 0
              ? 'Start a new streak by completing today'
              : 'Complete your first day to start a streak'
            }
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <motion.div 
          className="space-y-3"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${
              streakInfo.streakActive 
                ? 'bg-orange-500/10' 
                : 'bg-muted'
            }`}>
              <Flame 
                size={32} 
                weight="fill" 
                className={streakInfo.streakActive ? 'text-orange-500' : 'text-muted-foreground'}
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Current Streak
              </p>
              <motion.p 
                className="text-3xl font-bold"
                key={streakInfo.currentStreak}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {streakInfo.currentStreak}
              </motion.p>
              <p className="text-xs text-muted-foreground">
                {streakInfo.currentStreak === 1 ? 'day' : 'days'}
              </p>
            </div>
          </div>

          {streakInfo.streakActive && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-1.5 text-xs text-orange-600 font-medium bg-orange-500/10 px-3 py-1.5 rounded-full w-fit"
            >
              <Flame size={12} weight="fill" />
              <span>Active</span>
            </motion.div>
          )}
        </motion.div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary/10">
              <TrendUp 
                size={32} 
                weight="bold" 
                className="text-primary"
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Longest Streak
              </p>
              <p className="text-3xl font-bold">
                {streakInfo.longestStreak}
              </p>
              <p className="text-xs text-muted-foreground">
                {streakInfo.longestStreak === 1 ? 'day' : 'days'}
              </p>
            </div>
          </div>

          {streakInfo.longestStreak > streakInfo.currentStreak && (
            <p className="text-xs text-muted-foreground">
              Beat your record of {streakInfo.longestStreak} days!
            </p>
          )}
        </div>
      </div>

      {streakInfo.lastCompletedDate && (
        <div className="mt-6 pt-6 border-t">
          <p className="text-xs text-muted-foreground">
            Last completed: {' '}
            <span className="font-medium text-foreground">
              {new Date(streakInfo.lastCompletedDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </p>
        </div>
      )}
    </Card>
  );
}
