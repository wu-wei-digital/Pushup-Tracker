import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, isAdminCheckError } from "@/lib/admin";
import { z } from "zod";

const adminUpdateUserSchema = z.object({
  displayName: z.string().max(100).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  yearlyGoal: z.number().int().min(100).max(1000000).optional(),
  timezone: z.string().optional(),
  isAdmin: z.boolean().optional(),
  isDisabled: z.boolean().optional(),
  email: z.string().email().optional(),
  username: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/)
    .optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (isAdminCheckError(adminCheck)) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  try {
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
        isAdmin: true,
        isDisabled: true,
        disabledAt: true,
        disabledBy: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            entries: { where: { isDeleted: false } },
            achievements: true,
            friendships: true,
            teamMemberships: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get pushup stats
    const stats = await prisma.pushupEntry.aggregate({
      where: { userId, isDeleted: false },
      _sum: { amount: true },
      _count: true,
    });

    return NextResponse.json({
      user,
      stats: {
        totalPushups: stats._sum.amount || 0,
        totalEntries: stats._count || 0,
      },
    });
  } catch (error) {
    console.error("Admin get user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = await requireAdmin();
  if (isAdminCheckError(adminCheck)) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  try {
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const body = await request.json();
    const validation = adminUpdateUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isAdmin: true },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check for unique constraints if email or username is being changed
    if (validation.data.email || validation.data.username) {
      const conflictUser = await prisma.user.findFirst({
        where: {
          id: { not: userId },
          OR: [
            validation.data.email ? { email: validation.data.email } : {},
            validation.data.username ? { username: validation.data.username } : {},
          ].filter((o) => Object.keys(o).length > 0),
        },
      });

      if (conflictUser) {
        if (validation.data.email && conflictUser.email === validation.data.email) {
          return NextResponse.json({ error: "Email already in use" }, { status: 400 });
        }
        if (validation.data.username && conflictUser.username === validation.data.username) {
          return NextResponse.json({ error: "Username already taken" }, { status: 400 });
        }
      }
    }

    // Build update data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = { ...validation.data };

    // Handle disable/enable with metadata
    if (validation.data.isDisabled === true && !existingUser.isAdmin) {
      updateData.disabledAt = new Date();
      updateData.disabledBy = adminCheck.user.userId;
    } else if (validation.data.isDisabled === false) {
      updateData.disabledAt = null;
      updateData.disabledBy = null;
    }

    // Prevent self-demotion from admin
    if (userId === adminCheck.user.userId && validation.data.isAdmin === false) {
      return NextResponse.json(
        { error: "Cannot remove your own admin status" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        bio: true,
        yearlyGoal: true,
        timezone: true,
        isAdmin: true,
        isDisabled: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Admin update user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
