import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateExternalApiKey } from "@/lib/external-auth";
import { getTodayBounds, calculateStreak, calculateDailyTarget, calculateYearProgress } from "@/lib/calculations";
import { startOfYear } from "date-fns";

export async function GET(request: NextRequest) {
    const authError = validateExternalApiKey(request);
    if (authError) return authError;

    try {
        const { searchParams } = new URL(request.url);
        const usernamesParam = searchParams.get("usernames");

        if (!usernamesParam) {
            return NextResponse.json({ error: "usernames parameter required" }, { status: 400 });
        }

        const usernames = usernamesParam.split(",").map(u => u.trim()).filter(Boolean);

        if (usernames.length === 0) {
            return NextResponse.json({ users: [] });
        }

        const users = await prisma.user.findMany({
            where: {
                username: { in: usernames },
                isDisabled: false,
            },
            select: {
                id: true,
                username: true,
                displayName: true,
                level: true,
                currentTitle: true,
                yearlyGoal: true,
                timezone: true,
                profilePicture: true,
            },
        });

        const yearStart = startOfYear(new Date());

        const results = await Promise.all(
            users.map(async (user) => {
                const timezone = user.timezone || "Australia/Brisbane";

                // Get all entries for this year
                const entries = await prisma.pushupEntry.findMany({
                    where: {
                        userId: user.id,
                        isDeleted: false,
                        createdAt: { gte: yearStart },
                    },
                    select: { amount: true, createdAt: true },
                });

                const yearTotal = entries.reduce((sum, e) => sum + e.amount, 0);

                // Today's total
                const { start: todayStart, end: todayEnd } = getTodayBounds(timezone);
                const todayTotal = entries
                    .filter(e => e.createdAt >= todayStart && e.createdAt <= todayEnd)
                    .reduce((sum, e) => sum + e.amount, 0);

                // Streak
                const { current: currentStreak } = calculateStreak(
                    entries.map(e => e.createdAt),
                    timezone
                );

                // Daily target & year progress
                const dailyTarget = calculateDailyTarget(user.yearlyGoal, yearTotal, timezone);
                const yearProgress = calculateYearProgress(yearTotal, user.yearlyGoal);

                return {
                    username: user.username,
                    displayName: user.displayName || user.username,
                    level: user.level,
                    currentTitle: user.currentTitle || "Beginner",
                    todayTotal,
                    currentStreak,
                    dailyTarget: Math.ceil(dailyTarget),
                    yearlyGoal: user.yearlyGoal,
                    yearTotal,
                    yearProgress: Math.round(yearProgress * 10) / 10,
                    profilePicture: user.profilePicture,
                };
            })
        );

        return NextResponse.json({ users: results });
    } catch (error) {
        console.error("External household stats error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
