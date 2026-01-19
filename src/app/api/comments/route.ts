import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { commentSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const payload = await getCurrentUser();
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const validation = commentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { entryId, content } = validation.data;

    // Check if entry exists
    const entry = await prisma.pushupEntry.findUnique({
      where: { id: entryId },
      select: { userId: true, isDeleted: true },
    });

    if (!entry || entry.isDeleted) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        userId: payload.userId,
        entryId,
        content,
      },
      include: {
        user: {
          select: { id: true, username: true, displayName: true },
        },
      },
    });

    // Create notification for entry owner (if not self)
    if (entry.userId !== payload.userId) {
      await prisma.notification.create({
        data: {
          userId: entry.userId,
          type: "comment",
          title: "New Comment",
          content: `${payload.username} commented on your entry: "${content.substring(0, 50)}${content.length > 50 ? "..." : ""}"`,
          link: `/feed`,
        },
      });
    }

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("Create comment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
