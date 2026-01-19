import { startOfYear, endOfYear, differenceInDays, startOfDay } from "date-fns";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function calculateDailyTarget(yearlyGoal: number, totalDone: number, timezone: string = "UTC"): number {
  const now = new Date();
  const yearEnd = endOfYear(now);
  const daysRemaining = differenceInDays(yearEnd, now) + 1;

  const remaining = yearlyGoal - totalDone;
  if (remaining <= 0) return 0;

  return Math.ceil(remaining / daysRemaining);
}

export function calculateYearProgress(totalDone: number, yearlyGoal: number): number {
  if (yearlyGoal <= 0) return 0;
  return Math.min((totalDone / yearlyGoal) * 100, 100);
}

export function getDaysElapsedInYear(): number {
  const now = new Date();
  const yearStart = startOfYear(now);
  return differenceInDays(now, yearStart) + 1;
}

export function calculateStreak(entryDates: Date[]): { current: number; longest: number } {
  if (entryDates.length === 0) return { current: 0, longest: 0 };

  // Sort dates in descending order (most recent first)
  const sortedDates = [...entryDates]
    .map(d => startOfDay(new Date(d)))
    .sort((a, b) => b.getTime() - a.getTime());

  // Remove duplicates (same day)
  const uniqueDates: Date[] = [];
  for (const date of sortedDates) {
    if (uniqueDates.length === 0 || uniqueDates[uniqueDates.length - 1].getTime() !== date.getTime()) {
      uniqueDates.push(date);
    }
  }

  const today = startOfDay(new Date());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Calculate current streak
  let currentStreak = 0;
  const firstDate = uniqueDates[0];

  // Check if the most recent entry is today or yesterday
  if (firstDate.getTime() === today.getTime() || firstDate.getTime() === yesterday.getTime()) {
    currentStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const expectedDate = new Date(uniqueDates[i - 1]);
      expectedDate.setDate(expectedDate.getDate() - 1);

      if (uniqueDates[i].getTime() === expectedDate.getTime()) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 1;
  let tempStreak = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const expectedDate = new Date(uniqueDates[i - 1]);
    expectedDate.setDate(expectedDate.getDate() - 1);

    if (uniqueDates[i].getTime() === expectedDate.getTime()) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  return {
    current: currentStreak,
    longest: Math.max(longestStreak, currentStreak)
  };
}

export function getWeekBounds(): { start: Date; end: Date } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const start = new Date(now);
  start.setDate(now.getDate() - dayOfWeek);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export function getMonthBounds(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  return { start, end };
}

export function getTodayBounds(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  return { start, end };
}
