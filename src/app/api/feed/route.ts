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
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const filter = searchParams.get("filter") || "all"; // all, friends

    // Get friend IDs if filtering by friends
    let userIds: number[] | undefined;
    if (filter === "friends") {
      const friendships = await prisma.friendship.findMany({
        where: {
          OR: [
            { userId: payload.userId, status: "accepted" },
            { friendId: payload.userId, status: "accepted" },
          ],
        },
      });
      userIds = friendships.map((f) =>
        f.userId === payload.userId ? f.friendId : f.userId
      );
      userIds.push(payload.userId); // Include own entries
    }

    // Get recent entries
    const entries = await prisma.pushupEntry.findMany({
      where: {
        isDeleted: false,
        ...(userIds ? { userId: { in: userIds } } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            level: true,
            currentTitle: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: { id: true, username: true, displayName: true },
            },
          },
        },
        _count: {
          select: { reactions: true, comments: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // Transform to feed items
    const feedItems = entries.map((entry) => ({
      id: `entry-${entry.id}`,
      type: "entry",
      user: entry.user,
      data: {
        entryId: entry.id,
        amount: entry.amount,
        note: entry.note,
        source: entry.source,
        reactions: entry.reactions,
        reactionCount: entry._count.reactions,
        commentCount: entry._count.comments,
      },
      createdAt: entry.createdAt,
    }));

    return NextResponse.json({
      items: feedItems,
      page,
      pageSize,
      hasMore: entries.length === pageSize,
    });
  } catch (error) {
    console.error("Get feed error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
