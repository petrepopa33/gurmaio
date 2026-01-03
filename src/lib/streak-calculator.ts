import type { DayProgress } from '@/types/domain';

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  streakActive: boolean;
}

export function calculateStreak(completedDays: DayProgress[]): StreakInfo {
  if (!completedDays || completedDays.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: null,
      streakActive: false,
    };
  }

  const sortedDates = completedDays
    .map(day => day.date)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (sortedDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: null,
      streakActive: false,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const lastCompletedDate = new Date(sortedDates[0]);
  lastCompletedDate.setHours(0, 0, 0, 0);

  const isToday = lastCompletedDate.getTime() === today.getTime();
  const isYesterday = lastCompletedDate.getTime() === yesterday.getTime();
  const streakActive = isToday || isYesterday;

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const dateSet = new Set(sortedDates);

  if (streakActive) {
    let checkDate = new Date(today);
    if (!isToday) {
      checkDate = new Date(yesterday);
    }
    
    while (dateSet.has(checkDate.toISOString().split('T')[0])) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  }

  const allDates = sortedDates.map(d => {
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    return date;
  }).sort((a, b) => a.getTime() - b.getTime());

  for (let i = 0; i < allDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prevDate = new Date(allDates[i - 1]);
      const currDate = new Date(allDates[i]);
      
      const daysDiff = Math.floor(
        (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return {
    currentStreak,
    longestStreak,
    lastCompletedDate: sortedDates[0],
    streakActive,
  };
}
