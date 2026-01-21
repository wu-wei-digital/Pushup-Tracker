import prisma from "@/lib/prisma";
import { getNewlyUnlockedBadges, type AchievementCheckStats } from "@/lib/achievements";
import { calculateStreak, getTodayBounds, getWeekBounds } from "@/lib/calculations";
import { POINTS } from "@/lib/points";
import { startOfYear } from "date-fns";

export interface CheckAchievementsResult {
    newBadges: Array<{
        type: string;
        name: string;
        description: string;
        rarity: string;
    }>;
    pointsAwarded: number;
}

/**
 * Checks and awards achievements for a user.
 * This function can be called from any endpoint that might trigger achievements.
 *
 * @param userId - The user's ID to check achievements for
 * @returns Object containing newly unlocked badges and points awarded
 */
export async function checkAndAwardAchievements(userId: number): Promise<CheckAchievementsResult> {
    // Get user data
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { level: true, points: true, timezone: true },
    });

    if (!user) {
        return { newBadges: [], pointsAwarded: 0 };
    }

    // Get existing achievements
    const existingAchievements = await prisma.achievement.findMany({
        where: { userId },
        select: { badgeType: true },
    });
    const existingBadgeTypes = existingAchievements.map((a) => a.badgeType);

    // Calculate stats
    const userTimezone = user.timezone || "Australia/Brisbane";
    const yearStart = startOfYear(new Date());
    const { start: todayStart, end: todayEnd } = getTodayBounds(userTimezone);
    const { start: weekStart, end: weekEnd } = getWeekBounds(userTimezone);

    const entries = await prisma.pushupEntry.findMany({
        where: { userId, isDeleted: false },
        select: { amount: true, createdAt: true, source: true },
    });

    const yearEntries = entries.filter((e) => e.createdAt >= yearStart);
    const todayEntries = yearEntries.filter((e) => e.createdAt >= todayStart && e.createdAt <= todayEnd);
    const weekEntries = yearEntries.filter((e) => e.createdAt >= weekStart && e.createdAt <= weekEnd);

    const totalPushups = entries.reduce((sum, e) => sum + e.amount, 0);
    const todayTotal = todayEntries.reduce((sum, e) => sum + e.amount, 0);
    const weekTotal = weekEntries.reduce((sum, e) => sum + e.amount, 0);
    const { current: currentStreak, longest: longestStreak } = calculateStreak(entries.map((e) => e.createdAt), userTimezone);
    const singleEntryMax = Math.max(...entries.map((e) => e.amount), 0);

    // Calculate pomodoro stats
    const pomodoroEntries = entries.filter((e) => e.source === "pomodoro");
    const pomodoroSessions = pomodoroEntries.length;
    const pomodoroPushups = pomodoroEntries.reduce((sum, e) => sum + e.amount, 0);

    // Get friend count
    const friendCount = await prisma.friendship.count({
        where: {
            OR: [
                { userId, status: "accepted" },
                { friendId: userId, status: "accepted" },
            ],
        },
    });

    // Get challenges stats
    const challengesJoined = await prisma.challengeParticipant.count({
        where: { userId },
    });

    const stats: AchievementCheckStats = {
        totalPushups,
        currentStreak,
        longestStreak,
        totalDays: new Set(entries.map((e) => e.createdAt.toISOString().split("T")[0])).size,
        todayTotal,
        weekTotal,
        monthTotal: 0, // Not used for badges currently
        singleEntryMax,
        totalEntries: entries.length,
        level: user.level,
        friendCount,
        challengesWon: 0, // Would need to implement challenge winner logic
        challengesJoined,
        pomodoroSessions,
        pomodoroPushups,
    };

    // Check for new badges
    const newBadges = getNewlyUnlockedBadges(stats, existingBadgeTypes);

    if (newBadges.length === 0) {
        return { newBadges: [], pointsAwarded: 0 };
    }

    // Create new achievements and notifications
    let totalPoints = 0;
    const pointsMap: Record<string, number> = {
        common: POINTS.ACHIEVEMENT_COMMON,
        uncommon: POINTS.ACHIEVEMENT_UNCOMMON,
        rare: POINTS.ACHIEVEMENT_RARE,
        epic: POINTS.ACHIEVEMENT_EPIC,
        legendary: POINTS.ACHIEVEMENT_LEGENDARY,
    };

    await prisma.$transaction(async (tx) => {
        for (const badge of newBadges) {
            await tx.achievement.create({
                data: {
                    userId,
                    badgeType: badge.type,
                    badgeName: badge.name,
                    badgeDesc: badge.description,
                    badgeRarity: badge.rarity,
                },
            });

            totalPoints += pointsMap[badge.rarity] || 0;

            // Create notification
            await tx.notification.create({
                data: {
                    userId,
                    type: "achievement",
                    title: "Achievement Unlocked!",
                    content: `You earned the "${badge.name}" badge!`,
                    link: "/achievements",
                },
            });
        }

        // Update user points
        if (totalPoints > 0) {
            await tx.user.update({
                where: { id: userId },
                data: { points: { increment: totalPoints } },
            });
        }
    });

    return {
        newBadges: newBadges.map((b) => ({
            type: b.type,
            name: b.name,
            description: b.description,
            rarity: b.rarity,
        })),
        pointsAwarded: totalPoints,
    };
}
