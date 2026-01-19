// Points awarded per action
export const POINTS = {
  PUSHUP: 1, // 1 point per pushup
  DAILY_BONUS: 50, // Bonus for logging any pushups on a day
  STREAK_BONUS: 10, // Bonus per day of streak
  ACHIEVEMENT_COMMON: 100,
  ACHIEVEMENT_UNCOMMON: 250,
  ACHIEVEMENT_RARE: 500,
  ACHIEVEMENT_EPIC: 1000,
  ACHIEVEMENT_LEGENDARY: 2500,
};

// Level thresholds (cumulative points needed)
export const LEVEL_THRESHOLDS = [
  0,      // Level 1
  100,    // Level 2
  300,    // Level 3
  600,    // Level 4
  1000,   // Level 5
  1500,   // Level 6
  2200,   // Level 7
  3000,   // Level 8
  4000,   // Level 9
  5200,   // Level 10
  6600,   // Level 11
  8200,   // Level 12
  10000,  // Level 13
  12000,  // Level 14
  14500,  // Level 15
  17500,  // Level 16
  21000,  // Level 17
  25000,  // Level 18
  30000,  // Level 19
  36000,  // Level 20
  43000,  // Level 21
  51000,  // Level 22
  60000,  // Level 23
  70000,  // Level 24
  82000,  // Level 25
  95000,  // Level 26
  110000, // Level 27
  130000, // Level 28
  155000, // Level 29
  185000, // Level 30
];

export function calculateLevel(points: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

export function getPointsForNextLevel(currentLevel: number): number {
  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + (currentLevel - LEVEL_THRESHOLDS.length + 1) * 50000;
  }
  return LEVEL_THRESHOLDS[currentLevel];
}

export function getLevelProgress(points: number, currentLevel: number): number {
  const currentThreshold = LEVEL_THRESHOLDS[currentLevel - 1] || 0;
  const nextThreshold = getPointsForNextLevel(currentLevel);
  const pointsInLevel = points - currentThreshold;
  const pointsNeeded = nextThreshold - currentThreshold;

  return Math.min((pointsInLevel / pointsNeeded) * 100, 100);
}

export function calculatePushupPoints(amount: number, isFirstOfDay: boolean, streakDays: number): number {
  let points = amount * POINTS.PUSHUP;

  if (isFirstOfDay) {
    points += POINTS.DAILY_BONUS;
  }

  if (streakDays > 1) {
    points += Math.min(streakDays, 30) * POINTS.STREAK_BONUS;
  }

  return points;
}

// Titles based on total pushups
export const TITLES: { threshold: number; title: string }[] = [
  { threshold: 0, title: "Beginner" },
  { threshold: 100, title: "Novice" },
  { threshold: 500, title: "Apprentice" },
  { threshold: 1000, title: "Dedicated" },
  { threshold: 2500, title: "Warrior" },
  { threshold: 5000, title: "Champion" },
  { threshold: 10000, title: "Master" },
  { threshold: 25000, title: "Grandmaster" },
  { threshold: 50000, title: "Legend" },
  { threshold: 100000, title: "Immortal" },
];

export function getTitle(totalPushups: number): string {
  for (let i = TITLES.length - 1; i >= 0; i--) {
    if (totalPushups >= TITLES[i].threshold) {
      return TITLES[i].title;
    }
  }
  return TITLES[0].title;
}
