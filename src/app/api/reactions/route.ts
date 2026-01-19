import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { reactionSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const payload = await getCurrentUser();
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const validation = reactionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { entryId, reactionType } = validation.data;

    // Check if entry exists
    const entry = await prisma.pushupEntry.findUnique({
      where: { id: entryId },
      select: { userId: true, isDeleted: true },
    });

    if (!entry || entry.isDeleted) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    // Check if reaction already exists
    const existingReaction = await prisma.reaction.findUnique({
      where: {
        userId_entryId_reactionType: {
          userId: payload.userId,
          entryId,
          reactionType,
        },
      },
    });

    if (existingReaction) {
      // Toggle off - delete the reaction
      await prisma.reaction.delete({
        where: { id: existingReaction.id },
      });
      return NextResponse.json({ removed: true });
    }

    // Create new reaction
    const reaction = await prisma.reaction.create({
      data: {
        userId: payload.userId,
        entryId,
        reactionType,
      },
    });

    // Create notification for entry owner (if not self)
    if (entry.userId !== payload.userId) {
      const reactionEmojis: Record<string, string> = {
        strong: "💪",
        fire: "🔥",
        applause: "👏",
        party: "🎉",
        wow: "😮",
      };
      await prisma.notification.create({
        data: {
          userId: entry.userId,
          type: "reaction",
          title: "New Reaction",
          content: `${payload.username} reacted ${reactionEmojis[reactionType]} to your entry`,
          link: `/feed`,
        },
      });
    }

    return NextResponse.json({ reaction }, { status: 201 });
  } catch (error) {
    console.error("Create reaction error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
