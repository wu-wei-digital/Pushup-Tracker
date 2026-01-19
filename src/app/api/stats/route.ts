import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  calculateDailyTarget,
  calculateYearProgress,
  calculateStreak,
  getTodayBounds,
  getWeekBounds,
  getMonthBounds,
} from "@/lib/calculations";
import { startOfYear } from "date-fns";

export async function GET() {
  try {
    const payload = await getCurrentUser();
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { yearlyGoal: true, timezone: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const yearStart = startOfYear(new Date());
    const { start: todayStart, end: todayEnd } = getTodayBounds();
    const { start: weekStart, end: weekEnd } = getWeekBounds();
    const { start: monthStart, end: monthEnd } = getMonthBounds();

    // Get all entries for the year
    const yearEntries = await prisma.pushupEntry.findMany({
      where: {
        userId: payload.userId,
        isDeleted: false,
        createdAt: { gte: yearStart },
      },
      select: {
        amount: true,
        createdAt: true,
      },
    });

    // Calculate totals
    const yearTotal = yearEntries.reduce((sum, e) => sum + e.amount, 0);

    const todayTotal = yearEntries
      .filter((e) => e.createdAt >= todayStart && e.createdAt <= todayEnd)
      .reduce((sum, e) => sum + e.amount, 0);

    const weekTotal = yearEntries
      .filter((e) => e.createdAt >= weekStart && e.createdAt <= weekEnd)
      .reduce((sum, e) => sum + e.amount, 0);

    const monthTotal = yearEntries
      .filter((e) => e.createdAt >= monthStart && e.createdAt <= monthEnd)
      .reduce((sum, e) => sum + e.amount, 0);

    // Calculate streak
    const entryDates = yearEntries.map((e) => e.createdAt);
    const { current: currentStreak, longest: longestStreak } = calculateStreak(entryDates);

    // Calculate daily target
    const dailyTarget = calculateDailyTarget(user.yearlyGoal, yearTotal, user.timezone);

    // Calculate progress
    const yearProgress = calculateYearProgress(yearTotal, user.yearlyGoal);

    // Get total pushups (all time)
    const totalResult = await prisma.pushupEntry.aggregate({
      where: {
        userId: payload.userId,
        isDeleted: false,
      },
      _sum: { amount: true },
      _count: true,
      _max: { amount: true },
    });

    const totalPushups = totalResult._sum.amount || 0;
    const totalEntries = totalResult._count || 0;
    const singleEntryMax = totalResult._max.amount || 0;

    // Calculate average per day
    const uniqueDays = new Set(
      yearEntries.map((e) => e.createdAt.toISOString().split("T")[0])
    ).size;
    const averagePerDay = uniqueDays > 0 ? Math.round(yearTotal / uniqueDays) : 0;

    return NextResponse.json({
      totalPushups,
      todayTotal,
      weekTotal,
      monthTotal,
      yearTotal,
      currentStreak,
      longestStreak,
      dailyTarget,
      yearProgress,
      totalEntries,
      averagePerDay,
      singleEntryMax,
      yearlyGoal: user.yearlyGoal,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
