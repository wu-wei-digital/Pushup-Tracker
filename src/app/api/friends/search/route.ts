import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const payload = await getCurrentUser();
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    // Search for users
    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: payload.userId } },
          {
            OR: [
              { username: { contains: query, mode: "insensitive" } },
              { displayName: { contains: query, mode: "insensitive" } },
            ],
          },
        ],
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        level: true,
        currentTitle: true,
        points: true,
      },
      take: 10,
    });

    // Get existing friendships for these users
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId: payload.userId, friendId: { in: users.map((u) => u.id) } },
          { userId: { in: users.map((u) => u.id) }, friendId: payload.userId },
        ],
      },
    });

    // Add friendship status to users
    const usersWithStatus = users.map((user) => {
      const friendship = friendships.find(
        (f) =>
          (f.userId === payload.userId && f.friendId === user.id) ||
          (f.userId === user.id && f.friendId === payload.userId)
      );

      return {
        ...user,
        friendshipStatus: friendship
          ? {
              id: friendship.id,
              status: friendship.status,
              isInitiator: friendship.userId === payload.userId,
            }
          : null,
      };
    });

    return NextResponse.json({ users: usersWithStatus });
  } catch (error) {
    console.error("Search users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
