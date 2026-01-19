import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { updateUserSchema } from "@/lib/validators";
import { startOfYear } from "date-fns";
import { calculateStreak } from "@/lib/calculations";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getCurrentUser();
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const userId = parseInt(id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        yearlyGoal: true,
        points: true,
        level: true,
        currentTitle: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const yearStart = startOfYear(new Date());

    // Get stats
    const yearEntries = await prisma.pushupEntry.findMany({
      where: {
        userId,
        isDeleted: false,
        createdAt: { gte: yearStart },
      },
      select: { amount: true, createdAt: true },
    });

    const yearTotal = yearEntries.reduce((sum, e) => sum + e.amount, 0);
    const { current: currentStreak, longest: longestStreak } = calculateStreak(
      yearEntries.map((e) => e.createdAt)
    );

    // Get total pushups (all time)
    const totalResult = await prisma.pushupEntry.aggregate({
      where: { userId, isDeleted: false },
      _sum: { amount: true },
    });
    const totalPushups = totalResult._sum.amount || 0;

    // Get achievements count
    const achievementsCount = await prisma.achievement.count({
      where: { userId },
    });

    // Check friendship status if not viewing own profile
    let friendshipStatus = null;
    if (userId !== payload.userId) {
      const friendship = await prisma.friendship.findFirst({
        where: {
          OR: [
            { userId: payload.userId, friendId: userId },
            { userId: userId, friendId: payload.userId },
          ],
        },
      });
      if (friendship) {
        friendshipStatus = {
          id: friendship.id,
          status: friendship.status,
          isInitiator: friendship.userId === payload.userId,
        };
      }
    }

    return NextResponse.json({
      user,
      stats: {
        totalPushups,
        yearTotal,
        currentStreak,
        longestStreak,
        achievementsCount,
      },
      friendshipStatus,
      isOwnProfile: userId === payload.userId,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getCurrentUser();
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const userId = parseInt(id);

    // Can only update own profile
    if (userId !== payload.userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const body = await request.json();
    const validation = updateUserSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: validation.data,
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        bio: true,
        yearlyGoal: true,
        timezone: true,
        points: true,
        level: true,
        currentTitle: true,
        theme: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
