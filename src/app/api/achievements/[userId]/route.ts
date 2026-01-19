import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const payload = await getCurrentUser();
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { userId } = await params;
    const id = parseInt(userId);

    const achievements = await prisma.achievement.findMany({
      where: { userId: id },
      orderBy: [
        { unlockedAt: "desc" },
      ],
    });

    return NextResponse.json({ achievements });
  } catch (error) {
    console.error("Get user achievements error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
