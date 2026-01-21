import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createTeamSchema } from "@/lib/validators";
import { startOfYear } from "date-fns";

export async function GET(request: NextRequest) {
    try {
        const payload = await getCurrentUser();
        if (!payload) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const filter = searchParams.get("filter") || "all"; // all, joined

        const where: Record<string, unknown> = { isPublic: true };

        if (filter === "joined") {
            where.members = {
                some: { userId: payload.userId },
            };
        }

        const teams = await prisma.team.findMany({
            where,
            include: {
                creator: {
                    select: { id: true, username: true, displayName: true },
                },
                _count: {
                    select: { members: true },
                },
                members: {
                    where: { userId: payload.userId },
                    select: { id: true, role: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // Calculate team totals
        const yearStart = startOfYear(new Date());
        const teamsWithTotals = await Promise.all(
            teams.map(async (team) => {
                const memberIds = await prisma.teamMember.findMany({
                    where: { teamId: team.id },
                    select: { userId: true },
                });

                const total = await prisma.pushupEntry.aggregate({
                    where: {
                        userId: { in: memberIds.map((m) => m.userId) },
                        isDeleted: false,
                        createdAt: { gte: yearStart },
                    },
                    _sum: { amount: true },
                });

                return {
                    ...team,
                    totalPushups: total._sum.amount || 0,
                    memberCount: team._count.members,
                    isJoined: team.members.length > 0,
                    userRole: team.members[0]?.role || null,
                };
            })
        );

        return NextResponse.json({ teams: teamsWithTotals });
    } catch (error) {
        console.error("Get teams error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const payload = await getCurrentUser();
        if (!payload) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const body = await request.json();
        const validation = createTeamSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.errors[0].message },
                { status: 400 }
            );
        }

        const { name, description, teamGoal, isPublic } = validation.data;

        const team = await prisma.team.create({
            data: {
                name,
                description,
                creatorId: payload.userId,
                teamGoal,
                isPublic,
            },
        });

        // Auto-join creator as admin
        await prisma.teamMember.create({
            data: {
                teamId: team.id,
                userId: payload.userId,
                role: "admin",
            },
        });

        return NextResponse.json({ team }, { status: 201 });
    } catch (error) {
        console.error("Create team error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
