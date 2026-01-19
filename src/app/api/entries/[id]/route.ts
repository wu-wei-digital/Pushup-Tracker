import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { updateEntrySchema } from "@/lib/validators";

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
    const entryId = parseInt(id);

    const entry = await prisma.pushupEntry.findUnique({
      where: { id: entryId },
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
              select: {
                id: true,
                username: true,
                displayName: true,
              },
            },
          },
        },
        comments: {
          where: { isDeleted: false },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!entry || entry.isDeleted) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json({ entry });
  } catch (error) {
    console.error("Get entry error:", error);
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
    const entryId = parseInt(id);
    const body = await request.json();

    const validation = updateEntrySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    // Check ownership
    const existingEntry = await prisma.pushupEntry.findUnique({
      where: { id: entryId },
    });

    if (!existingEntry || existingEntry.isDeleted) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    if (existingEntry.userId !== payload.userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const entry = await prisma.pushupEntry.update({
      where: { id: entryId },
      data: validation.data,
    });

    return NextResponse.json({ entry });
  } catch (error) {
    console.error("Update entry error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getCurrentUser();
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const entryId = parseInt(id);

    // Check ownership
    const existingEntry = await prisma.pushupEntry.findUnique({
      where: { id: entryId },
    });

    if (!existingEntry || existingEntry.isDeleted) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    if (existingEntry.userId !== payload.userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Soft delete
    await prisma.pushupEntry.update({
      where: { id: entryId },
      data: { isDeleted: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete entry error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
