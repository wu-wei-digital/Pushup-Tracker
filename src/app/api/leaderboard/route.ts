import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { startOfYear } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const payload = await getCurrentUser();
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const skip = (page - 1) * pageSize;

    const yearStart = startOfYear(new Date());

    // Get all users with their year totals
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        displayName: true,
        level: true,
        currentTitle: true,
        yearlyGoal: true,
        points: true,
        entries: {
          where: {
            isDeleted: false,
            createdAt: { gte: yearStart },
          },
          select: { amount: true },
        },
      },
    });

    // Calculate totals and sort
    const leaderboardData = users
      .map((user) => {
        const total = user.entries.reduce((sum, e) => sum + e.amount, 0);
        return {
          user: {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            level: user.level,
            currentTitle: user.currentTitle,
            points: user.points,
          },
          total,
          percentComplete: user.yearlyGoal > 0 ? (total / user.yearlyGoal) * 100 : 0,
        };
      })
      .sort((a, b) => b.total - a.total);

    // Add ranks
    const rankedData = leaderboardData.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

    // Find current user's rank
    const currentUserRank = rankedData.findIndex((item) => item.user.id === payload.userId) + 1;

    // Paginate
    const paginatedData = rankedData.slice(skip, skip + pageSize);
    const total = rankedData.length;

    return NextResponse.json({
      items: paginatedData,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      currentUserRank,
    });
  } catch (error) {
    console.error("Get leaderboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
