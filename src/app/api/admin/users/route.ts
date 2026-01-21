import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, isAdminCheckError } from "@/lib/admin";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin();
  if (isAdminCheckError(adminCheck)) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status"); // "active" | "disabled" | "all"

    const where: Prisma.UserWhereInput = {
      AND: [
        search
          ? {
              OR: [
                { username: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { displayName: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        status === "active"
          ? { isDisabled: false }
          : status === "disabled"
            ? { isDisabled: true }
            : {},
      ],
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          email: true,
          displayName: true,
          isAdmin: true,
          isDisabled: true,
          points: true,
          level: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { entries: { where: { isDeleted: false } } } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Admin users list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
