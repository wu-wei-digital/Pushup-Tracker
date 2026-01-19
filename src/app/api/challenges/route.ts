import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createChallengeSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  try {
    const payload = await getCurrentUser();
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "active"; // active, joined, past

    const now = new Date();

    const where: Record<string, unknown> = { isPublic: true };

    if (filter === "active") {
      where.endDate = { gte: now };
      where.startDate = { lte: now };
    } else if (filter === "joined") {
      where.participants = {
        some: { userId: payload.userId },
      };
    } else if (filter === "past") {
      where.endDate = { lt: now };
    } else if (filter === "upcoming") {
      where.startDate = { gt: now };
    }

    const challenges = await prisma.challenge.findMany({
      where,
      include: {
        creator: {
          select: { id: true, username: true, displayName: true },
        },
        _count: {
          select: { participants: true },
        },
        participants: {
          where: { userId: payload.userId },
          select: { id: true },
        },
      },
      orderBy: { startDate: "desc" },
    });

    const formattedChallenges = challenges.map((c) => ({
      ...c,
      isJoined: c.participants.length > 0,
      participantCount: c._count.participants,
    }));

    return NextResponse.json({ challenges: formattedChallenges });
  } catch (error) {
    console.error("Get challenges error:", error);
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
    const validation = createChallengeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, description, challengeType, startDate, endDate, targetAmount, isPublic } = validation.data;

    const challenge = await prisma.challenge.create({
      data: {
        creatorId: payload.userId,
        name,
        description,
        challengeType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        targetAmount,
        isPublic,
      },
    });

    // Auto-join creator
    await prisma.challengeParticipant.create({
      data: {
        challengeId: challenge.id,
        userId: payload.userId,
      },
    });

    return NextResponse.json({ challenge }, { status: 201 });
  } catch (error) {
    console.error("Create challenge error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
