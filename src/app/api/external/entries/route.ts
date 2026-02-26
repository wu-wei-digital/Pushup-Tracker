import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateExternalApiKey } from "@/lib/external-auth";
import { calculatePushupPoints, calculateLevel, getTitle } from "@/lib/points";
import { getTodayBounds, calculateStreak } from "@/lib/calculations";
import { checkAndAwardAchievements } from "@/lib/checkAchievements";
import { startOfYear } from "date-fns";

export async function POST(request: NextRequest) {
    const authError = validateExternalApiKey(request);
    if (authError) return authError;

    try {
        const body = await request.json();
        const { username, amount, note } = body;

        if (!username || typeof username !== "string") {
            return NextResponse.json({ error: "username is required" }, { status: 400 });
        }

        if (!amount || typeof amount !== "number" || amount < 1 || amount > 10000) {
            return NextResponse.json({ error: "amount must be between 1 and 10000" }, { status: 400 });
        }

        // Look up user by username
        const user = await prisma.user.findUnique({
            where: { username },
            select: { id: true, timezone: true },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const userTimezone = user.timezone || "Australia/Brisbane";

        // Check if first entry of the day
        const { start: todayStart, end: todayEnd } = getTodayBounds(userTimezone);
        const todayEntry = await prisma.pushupEntry.findFirst({
            where: {
                userId: user.id,
                isDeleted: false,
                createdAt: { gte: todayStart, lte: todayEnd },
            },
        });
        const isFirstOfDay = !todayEntry;

        // Calculate streak
        const yearStart = startOfYear(new Date());
        const allEntryDates = await prisma.pushupEntry.findMany({
            where: {
                userId: user.id,
                isDeleted: false,
                createdAt: { gte: yearStart },
            },
            select: { createdAt: true },
        });
        const { current: currentStreak } = calculateStreak(
            allEntryDates.map(e => e.createdAt),
            userTimezone
        );

        // Calculate points
        const pointsEarned = calculatePushupPoints(amount, isFirstOfDay, currentStreak);

        // Build the note
        const entryNote = note
            ? `${note} (via Yggdrasil)`
            : "Logged via Yggdrasil";

        // Create entry and update user in a transaction
        const [entry] = await prisma.$transaction(async (tx) => {
            const newEntry = await tx.pushupEntry.create({
                data: {
                    userId: user.id,
                    amount,
                    note: entryNote,
                    source: "manual",
                },
            });

            const updatedUser = await tx.user.update({
                where: { id: user.id },
                data: { points: { increment: pointsEarned } },
            });

            // Update level
            const newLevel = calculateLevel(updatedUser.points);
            if (newLevel !== updatedUser.level) {
                await tx.user.update({
                    where: { id: user.id },
                    data: { level: newLevel },
                });
            }

            // Calculate total pushups for title
            const totalPushups = await tx.pushupEntry.aggregate({
                where: { userId: user.id, isDeleted: false },
                _sum: { amount: true },
            });

            const newTitle = getTitle(totalPushups._sum.amount || 0);
            await tx.user.update({
                where: { id: user.id },
                data: { currentTitle: newTitle },
            });

            return [newEntry, updatedUser];
        });

        // Check achievements
        await checkAndAwardAchievements(user.id);

        // Get updated today total
        const todayEntries = await prisma.pushupEntry.findMany({
            where: {
                userId: user.id,
                isDeleted: false,
                createdAt: { gte: todayStart, lte: todayEnd },
            },
            select: { amount: true },
        });
        const todayTotal = todayEntries.reduce((sum, e) => sum + e.amount, 0);

        // Get updated user info
        const updatedUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { level: true, currentTitle: true },
        });

        return NextResponse.json({
            entry: {
                id: entry.id,
                amount: entry.amount,
                points: pointsEarned,
                createdAt: entry.createdAt,
            },
            user: {
                todayTotal,
                currentStreak: isFirstOfDay ? currentStreak + 1 : currentStreak,
                level: updatedUser?.level ?? 1,
                currentTitle: updatedUser?.currentTitle ?? "Beginner",
            },
        }, { status: 201 });
    } catch (error) {
        console.error("External entry creation error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
