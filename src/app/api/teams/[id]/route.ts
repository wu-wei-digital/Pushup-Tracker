import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { startOfYear } from "date-fns";

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
        const teamId = parseInt(id);

        const team = await prisma.team.findUnique({
            where: { id: teamId },
            include: {
                creator: {
                    select: { id: true, username: true, displayName: true },
                },
                members: {
                    include: {
                        user: {
                            select: { id: true, username: true, displayName: true, level: true },
                        },
                    },
                },
            },
        });

        if (!team) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 });
        }

        const yearStart = startOfYear(new Date());

        // Calculate totals for each member
        const membersWithTotals = await Promise.all(
            team.members.map(async (m) => {
                const total = await prisma.pushupEntry.aggregate({
                    where: {
                        userId: m.userId,
                        isDeleted: false,
                        createdAt: { gte: yearStart },
                    },
                    _sum: { amount: true },
                });
                return {
                    ...m,
                    totalPushups: total._sum.amount || 0,
                };
            })
        );

        // Sort by total
        membersWithTotals.sort((a, b) => b.totalPushups - a.totalPushups);

        const totalPushups = membersWithTotals.reduce((sum, m) => sum + m.totalPushups, 0);
        const isJoined = team.members.some((m) => m.userId === payload.userId);
        const userRole = team.members.find((m) => m.userId === payload.userId)?.role || null;

        return NextResponse.json({
            team: {
                ...team,
                members: membersWithTotals,
                totalPushups,
                isJoined,
                userRole,
            },
        });
    } catch (error) {
        console.error("Get team error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
