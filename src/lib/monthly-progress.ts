import type { DayProgress, MonthlyProgress, Badge } from '@/types/domain';

export function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function calculateMonthlyProgress(
  dayProgressData: DayProgress[],
  month: string,
  year: number
): MonthlyProgress {
  const monthPadded = String(month).padStart(2, '0');
  const monthPrefix = `${year}-${monthPadded}`;
  
  const daysInMonth = getDaysInMonth(year, parseInt(month));
  
  const monthDays = dayProgressData.filter(day => day.date.startsWith(monthPrefix));
  
  const completedDates = [...new Set(monthDays.map(d => d.date))];
  const daysCompleted = completedDates.length;
  
  const completionPercentage = Math.round((daysCompleted / daysInMonth) * 100);
  
  const badgeEarned = completionPercentage === 100;
  
  const totalNutrition = monthDays.reduce(
    (acc, day) => ({
      calories: acc.calories + day.total_nutrition.calories,
      protein_g: acc.protein_g + day.total_nutrition.protein_g,
      carbohydrates_g: acc.carbohydrates_g + day.total_nutrition.carbohydrates_g,
      fats_g: acc.fats_g + day.total_nutrition.fats_g,
    }),
    { calories: 0, protein_g: 0, carbohydrates_g: 0, fats_g: 0 }
  );
  
  const totalCost = monthDays.reduce((acc, day) => acc + day.total_cost, 0);
  const totalMeals = monthDays.reduce((acc, day) => acc + day.meals_count, 0);
  
  const badgeEarnedAt = badgeEarned 
    ? monthDays[monthDays.length - 1]?.date 
    : undefined;
  
  return {
    month: monthPadded,
    year,
    days_completed: daysCompleted,
    total_days_in_month: daysInMonth,
    completion_percentage: completionPercentage,
    badge_earned: badgeEarned,
    badge_earned_at: badgeEarnedAt,
    total_meals_completed: totalMeals,
    total_nutrition: totalNutrition,
    total_cost: totalCost,
    completed_dates: completedDates,
  };
}

export function getMonthName(month: string, locale: string = 'en'): string {
  const monthNames: Record<string, Record<string, string>> = {
    en: {
      '01': 'January', '02': 'February', '03': 'March', '04': 'April',
      '05': 'May', '06': 'June', '07': 'July', '08': 'August',
      '09': 'September', '10': 'October', '11': 'November', '12': 'December'
    },
    es: {
      '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
      '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
      '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
    },
    fr: {
      '01': 'Janvier', '02': 'Février', '03': 'Mars', '04': 'Avril',
      '05': 'Mai', '06': 'Juin', '07': 'Juillet', '08': 'Août',
      '09': 'Septembre', '10': 'Octobre', '11': 'Novembre', '12': 'Décembre'
    },
    de: {
      '01': 'Januar', '02': 'Februar', '03': 'März', '04': 'April',
      '05': 'Mai', '06': 'Juni', '07': 'Juli', '08': 'August',
      '09': 'September', '10': 'Oktober', '11': 'November', '12': 'Dezember'
    },
    it: {
      '01': 'Gennaio', '02': 'Febbraio', '03': 'Marzo', '04': 'Aprile',
      '05': 'Maggio', '06': 'Giugno', '07': 'Luglio', '08': 'Agosto',
      '09': 'Settembre', '10': 'Ottobre', '11': 'Novembre', '12': 'Dicembre'
    },
    pt: {
      '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril',
      '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
      '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro'
    },
    nl: {
      '01': 'Januari', '02': 'Februari', '03': 'Maart', '04': 'April',
      '05': 'Mei', '06': 'Juni', '07': 'Juli', '08': 'Augustus',
      '09': 'September', '10': 'Oktober', '11': 'November', '12': 'December'
    },
    pl: {
      '01': 'Styczeń', '02': 'Luty', '03': 'Marzec', '04': 'Kwiecień',
      '05': 'Maj', '06': 'Czerwiec', '07': 'Lipiec', '08': 'Sierpień',
      '09': 'Wrzesień', '10': 'Październik', '11': 'Listopad', '12': 'Grudzień'
    },
    ro: {
      '01': 'Ianuarie', '02': 'Februarie', '03': 'Martie', '04': 'Aprilie',
      '05': 'Mai', '06': 'Iunie', '07': 'Iulie', '08': 'August',
      '09': 'Septembrie', '10': 'Octombrie', '11': 'Noiembrie', '12': 'Decembrie'
    },
    cs: {
      '01': 'Leden', '02': 'Únor', '03': 'Březen', '04': 'Duben',
      '05': 'Květen', '06': 'Červen', '07': 'Červenec', '08': 'Srpen',
      '09': 'Září', '10': 'Říjen', '11': 'Listopad', '12': 'Prosinec'
    }
  };
  
  return monthNames[locale]?.[month] || monthNames.en[month] || month;
}

export async function generateBadgeImage(
  monthlyProgress: MonthlyProgress,
  locale: string = 'en'
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 800;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');
  
  const gradient = ctx.createLinearGradient(0, 0, 800, 800);
  gradient.addColorStop(0, '#4ade80');
  gradient.addColorStop(1, '#16a34a');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 800, 800);
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.beginPath();
  ctx.arc(400, 400, 300, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.beginPath();
  ctx.arc(400, 400, 200, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 72px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('🏆', 400, 200);
  
  ctx.font = 'bold 48px Arial';
  ctx.fillText('Perfect Month!', 400, 300);
  
  const monthName = getMonthName(monthlyProgress.month, locale);
  ctx.font = '36px Arial';
  ctx.fillText(`${monthName} ${monthlyProgress.year}`, 400, 360);
  
  ctx.font = 'bold 64px Arial';
  ctx.fillText(`${monthlyProgress.days_completed}`, 400, 480);
  
  ctx.font = '28px Arial';
  ctx.fillText('Days Completed', 400, 520);
  
  ctx.font = '24px Arial';
  ctx.fillText(`${monthlyProgress.total_meals_completed} meals tracked`, 400, 580);
  
  ctx.font = 'bold 20px Arial';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillText('Gurmaio', 400, 750);
  
  return canvas.toDataURL('image/png');
}
