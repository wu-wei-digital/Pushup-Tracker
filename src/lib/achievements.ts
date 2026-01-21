export type BadgeRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface BadgeDefinition {
  type: string;
  name: string;
  description: string;
  rarity: BadgeRarity;
  icon: string;
  checkCondition: (stats: AchievementCheckStats) => boolean;
}

export interface AchievementCheckStats {
  totalPushups: number;
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  todayTotal: number;
  weekTotal: number;
  monthTotal: number;
  singleEntryMax: number;
  totalEntries: number;
  level: number;
  friendCount: number;
  challengesWon: number;
  challengesJoined: number;
  pomodoroSessions: number;
  pomodoroPushups: number;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
    // Milestone badges - Total pushups
    { type: "first_pushup", name: "First Rep", description: "Log your first pushup", rarity: "common", icon: "baby", checkCondition: (s) => s.totalPushups >= 1 },
    { type: "pushups_100", name: "Century", description: "Complete 100 total pushups", rarity: "common", icon: "star", checkCondition: (s) => s.totalPushups >= 100 },
    { type: "pushups_500", name: "Rising Star", description: "Complete 500 total pushups", rarity: "common", icon: "trending-up", checkCondition: (s) => s.totalPushups >= 500 },
    { type: "pushups_1000", name: "Thousand Club", description: "Complete 1,000 total pushups", rarity: "uncommon", icon: "award", checkCondition: (s) => s.totalPushups >= 1000 },
    { type: "pushups_5000", name: "Powerhouse", description: "Complete 5,000 total pushups", rarity: "rare", icon: "zap", checkCondition: (s) => s.totalPushups >= 5000 },
    { type: "pushups_10000", name: "Iron Will", description: "Complete 10,000 total pushups", rarity: "epic", icon: "shield", checkCondition: (s) => s.totalPushups >= 10000 },
    { type: "pushups_50000", name: "Legendary Strength", description: "Complete 50,000 total pushups", rarity: "legendary", icon: "crown", checkCondition: (s) => s.totalPushups >= 50000 },
    { type: "pushups_100000", name: "Immortal", description: "Complete 100,000 total pushups", rarity: "legendary", icon: "flame", checkCondition: (s) => s.totalPushups >= 100000 },

    // Daily badges
    { type: "daily_50", name: "Daily Fifty", description: "Do 50 pushups in a single day", rarity: "common", icon: "calendar-check", checkCondition: (s) => s.todayTotal >= 50 },
    { type: "daily_100", name: "Century Day", description: "Do 100 pushups in a single day", rarity: "uncommon", icon: "calendar-star", checkCondition: (s) => s.todayTotal >= 100 },
    { type: "daily_200", name: "Double Century", description: "Do 200 pushups in a single day", rarity: "rare", icon: "calendar-flame", checkCondition: (s) => s.todayTotal >= 200 },
    { type: "daily_500", name: "Beast Mode", description: "Do 500 pushups in a single day", rarity: "epic", icon: "skull", checkCondition: (s) => s.todayTotal >= 500 },

    // Single session badges
    { type: "single_25", name: "Power Set", description: "Log 25+ pushups in one entry", rarity: "common", icon: "bolt", checkCondition: (s) => s.singleEntryMax >= 25 },
    { type: "single_50", name: "Monster Set", description: "Log 50+ pushups in one entry", rarity: "uncommon", icon: "flame", checkCondition: (s) => s.singleEntryMax >= 50 },
    { type: "single_100", name: "Superhuman", description: "Log 100+ pushups in one entry", rarity: "rare", icon: "rocket", checkCondition: (s) => s.singleEntryMax >= 100 },

    // Streak badges
    { type: "streak_3", name: "Hat Trick", description: "Maintain a 3-day streak", rarity: "common", icon: "fire", checkCondition: (s) => s.currentStreak >= 3 || s.longestStreak >= 3 },
    { type: "streak_7", name: "Week Warrior", description: "Maintain a 7-day streak", rarity: "uncommon", icon: "fire", checkCondition: (s) => s.currentStreak >= 7 || s.longestStreak >= 7 },
    { type: "streak_14", name: "Fortnight Fighter", description: "Maintain a 14-day streak", rarity: "uncommon", icon: "fire", checkCondition: (s) => s.currentStreak >= 14 || s.longestStreak >= 14 },
    { type: "streak_30", name: "Monthly Master", description: "Maintain a 30-day streak", rarity: "rare", icon: "fire", checkCondition: (s) => s.currentStreak >= 30 || s.longestStreak >= 30 },
    { type: "streak_60", name: "Unstoppable", description: "Maintain a 60-day streak", rarity: "epic", icon: "fire", checkCondition: (s) => s.currentStreak >= 60 || s.longestStreak >= 60 },
    { type: "streak_100", name: "Century Streak", description: "Maintain a 100-day streak", rarity: "epic", icon: "fire", checkCondition: (s) => s.currentStreak >= 100 || s.longestStreak >= 100 },
    { type: "streak_365", name: "Year of Dedication", description: "Maintain a 365-day streak", rarity: "legendary", icon: "fire", checkCondition: (s) => s.currentStreak >= 365 || s.longestStreak >= 365 },

    // Weekly badges
    { type: "week_500", name: "Crushing It", description: "Do 500 pushups in a week", rarity: "uncommon", icon: "calendar-week", checkCondition: (s) => s.weekTotal >= 500 },
    { type: "week_1000", name: "Weekly Warrior", description: "Do 1,000 pushups in a week", rarity: "rare", icon: "sword", checkCondition: (s) => s.weekTotal >= 1000 },

    // Level badges
    { type: "level_5", name: "Getting Started", description: "Reach level 5", rarity: "common", icon: "arrow-up", checkCondition: (s) => s.level >= 5 },
    { type: "level_10", name: "Dedicated", description: "Reach level 10", rarity: "uncommon", icon: "arrow-up", checkCondition: (s) => s.level >= 10 },
    { type: "level_20", name: "Committed", description: "Reach level 20", rarity: "rare", icon: "arrow-up", checkCondition: (s) => s.level >= 20 },
    { type: "level_30", name: "Elite", description: "Reach level 30", rarity: "epic", icon: "arrow-up", checkCondition: (s) => s.level >= 30 },

    // Social badges
    { type: "first_friend", name: "Social Butterfly", description: "Add your first friend", rarity: "common", icon: "users", checkCondition: (s) => s.friendCount >= 1 },
    { type: "friends_10", name: "Popular", description: "Have 10 friends", rarity: "uncommon", icon: "users", checkCondition: (s) => s.friendCount >= 10 },
    { type: "friends_50", name: "Influencer", description: "Have 50 friends", rarity: "rare", icon: "users", checkCondition: (s) => s.friendCount >= 50 },

    // Challenge badges
    { type: "first_challenge", name: "Challenger", description: "Join your first challenge", rarity: "common", icon: "trophy", checkCondition: (s) => s.challengesJoined >= 1 },
    { type: "challenge_win", name: "Champion", description: "Win a challenge", rarity: "uncommon", icon: "trophy", checkCondition: (s) => s.challengesWon >= 1 },
    { type: "challenge_wins_5", name: "Dominator", description: "Win 5 challenges", rarity: "rare", icon: "trophy", checkCondition: (s) => s.challengesWon >= 5 },

    // Activity badges
    { type: "entries_100", name: "Logger", description: "Log 100 entries", rarity: "uncommon", icon: "list", checkCondition: (s) => s.totalEntries >= 100 },
    { type: "entries_500", name: "Dedicated Logger", description: "Log 500 entries", rarity: "rare", icon: "list", checkCondition: (s) => s.totalEntries >= 500 },
    { type: "entries_1000", name: "Master Logger", description: "Log 1,000 entries", rarity: "epic", icon: "list", checkCondition: (s) => s.totalEntries >= 1000 },

    // Pomodoro badges
    { type: "first_pomodoro", name: "Pomodoro Starter", description: "Complete your first pomodoro session", rarity: "common", icon: "timer", checkCondition: (s) => s.pomodoroSessions >= 1 },
    { type: "pomodoro_10", name: "Focused Mind", description: "Complete 10 pomodoro sessions", rarity: "uncommon", icon: "timer", checkCondition: (s) => s.pomodoroSessions >= 10 },
    { type: "pomodoro_50", name: "Productivity Pro", description: "Complete 50 pomodoro sessions", rarity: "rare", icon: "timer", checkCondition: (s) => s.pomodoroSessions >= 50 },
    { type: "pomodoro_100", name: "Time Master", description: "Complete 100 pomodoro sessions", rarity: "epic", icon: "timer", checkCondition: (s) => s.pomodoroSessions >= 100 },
    { type: "pomodoro_pushups_1000", name: "Pomodoro Warrior", description: "Log 1,000 pushups during pomodoro breaks", rarity: "rare", icon: "timer", checkCondition: (s) => s.pomodoroPushups >= 1000 },
];

export function getUnlockedBadges(stats: AchievementCheckStats): BadgeDefinition[] {
    return BADGE_DEFINITIONS.filter(badge => badge.checkCondition(stats));
}

export function getNewlyUnlockedBadges(
    stats: AchievementCheckStats,
    existingBadgeTypes: string[]
): BadgeDefinition[] {
    return BADGE_DEFINITIONS.filter(
        badge => badge.checkCondition(stats) && !existingBadgeTypes.includes(badge.type)
    );
}

export const RARITY_COLORS: Record<BadgeRarity, string> = {
    common: "bg-gray-100 text-gray-800 border-gray-300",
    uncommon: "bg-green-100 text-green-800 border-green-300",
    rare: "bg-blue-100 text-blue-800 border-blue-300",
    epic: "bg-purple-100 text-purple-800 border-purple-300",
    legendary: "bg-amber-100 text-amber-800 border-amber-300",
};

export const RARITY_ORDER: BadgeRarity[] = ["legendary", "epic", "rare", "uncommon", "common"];
