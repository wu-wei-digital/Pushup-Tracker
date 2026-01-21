import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, isAdminCheckError } from "@/lib/admin";
import { subDays, startOfDay } from "date-fns";

export async function GET() {
  const adminCheck = await requireAdmin();
  if (isAdminCheckError(adminCheck)) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  try {
    const today = startOfDay(new Date());
    const last7Days = subDays(today, 7);
    const last30Days = subDays(today, 30);

    const [
      totalUsers,
      activeUsers,
      disabledUsers,
      adminUsers,
      newUsersLast7Days,
      newUsersLast30Days,
      totalPushups,
      pushupsLast7Days,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isDisabled: false } }),
      prisma.user.count({ where: { isDisabled: true } }),
      prisma.user.count({ where: { isAdmin: true } }),
      prisma.user.count({ where: { createdAt: { gte: last7Days } } }),
      prisma.user.count({ where: { createdAt: { gte: last30Days } } }),
      prisma.pushupEntry.aggregate({ where: { isDeleted: false }, _sum: { amount: true } }),
      prisma.pushupEntry.aggregate({
        where: { isDeleted: false, createdAt: { gte: last7Days } },
        _sum: { amount: true },
      }),
    ]);

    return NextResponse.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        disabled: disabledUsers,
        admins: adminUsers,
        newLast7Days: newUsersLast7Days,
        newLast30Days: newUsersLast30Days,
      },
      pushups: {
        total: totalPushups._sum.amount || 0,
        last7Days: pushupsLast7Days._sum.amount || 0,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
