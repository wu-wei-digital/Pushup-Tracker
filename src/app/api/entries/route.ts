import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createEntrySchema } from "@/lib/validators";
import { calculatePushupPoints, calculateLevel, getTitle } from "@/lib/points";
import { getTodayBounds, calculateStreak } from "@/lib/calculations";
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

    const [entries, total] = await Promise.all([
      prisma.pushupEntry.findMany({
        where: {
          userId: payload.userId,
          isDeleted: false,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        include: {
          _count: {
            select: { reactions: true, comments: true },
          },
        },
      }),
      prisma.pushupEntry.count({
        where: {
          userId: payload.userId,
          isDeleted: false,
        },
      }),
    ]);

    return NextResponse.json({
      items: entries,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Get entries error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getCurrentUser();
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const validation = createEntrySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { amount, note } = validation.data;

    // Check if this is the first entry of the day
    const { start: todayStart, end: todayEnd } = getTodayBounds();
    const todayEntries = await prisma.pushupEntry.findFirst({
      where: {
        userId: payload.userId,
        isDeleted: false,
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });
    const isFirstOfDay = !todayEntries;

    // Calculate streak
    const yearStart = startOfYear(new Date());
    const allEntryDates = await prisma.pushupEntry.findMany({
      where: {
        userId: payload.userId,
        isDeleted: false,
        createdAt: { gte: yearStart },
      },
      select: { createdAt: true },
    });
    const { current: currentStreak } = calculateStreak(allEntryDates.map(e => e.createdAt));

    // Calculate points
    const pointsEarned = calculatePushupPoints(amount, isFirstOfDay, currentStreak);

    // Create entry and update user points in a transaction
    const [entry, user] = await prisma.$transaction(async (tx) => {
      const newEntry = await tx.pushupEntry.create({
        data: {
          userId: payload.userId,
          amount,
          note,
        },
      });

      const updatedUser = await tx.user.update({
        where: { id: payload.userId },
        data: {
          points: { increment: pointsEarned },
        },
      });

      // Calculate and update level
      const newLevel = calculateLevel(updatedUser.points);
      if (newLevel !== updatedUser.level) {
        await tx.user.update({
          where: { id: payload.userId },
          data: { level: newLevel },
        });
      }

      // Calculate total pushups for title
      const totalPushups = await tx.pushupEntry.aggregate({
        where: {
          userId: payload.userId,
          isDeleted: false,
        },
        _sum: { amount: true },
      });

      // Update title
      const newTitle = getTitle(totalPushups._sum.amount || 0);
      await tx.user.update({
        where: { id: payload.userId },
        data: { currentTitle: newTitle },
      });

      return [newEntry, updatedUser];
    });

    return NextResponse.json({ entry, pointsEarned }, { status: 201 });
  } catch (error) {
    console.error("Create entry error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
