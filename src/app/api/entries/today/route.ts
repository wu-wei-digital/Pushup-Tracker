import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getTodayBounds } from "@/lib/calculations";

export async function GET() {
  try {
    const payload = await getCurrentUser();
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { start, end } = getTodayBounds();

    const entries = await prisma.pushupEntry.findMany({
      where: {
        userId: payload.userId,
        isDeleted: false,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const total = entries.reduce((sum, entry) => sum + entry.amount, 0);

    return NextResponse.json({ entries, total });
  } catch (error) {
    console.error("Get today entries error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
