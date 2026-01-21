import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

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
        const challengeId = parseInt(id);

        const challenge = await prisma.challenge.findUnique({
            where: { id: challengeId },
            include: {
                creator: {
                    select: { id: true, username: true, displayName: true },
                },
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                displayName: true,
                                level: true,
                            },
                        },
                    },
                },
            },
        });

        if (!challenge) {
            return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
        }

        // Calculate totals for each participant during challenge period
        const participantsWithTotals = await Promise.all(
            challenge.participants.map(async (p) => {
                const total = await prisma.pushupEntry.aggregate({
                    where: {
                        userId: p.userId,
                        isDeleted: false,
                        createdAt: {
                            gte: challenge.startDate,
                            lte: challenge.endDate,
                        },
                    },
                    _sum: { amount: true },
                });
                return {
                    ...p,
                    totalPushups: total._sum.amount || 0,
                };
            })
        );

        // Sort by total
        participantsWithTotals.sort((a, b) => b.totalPushups - a.totalPushups);

        const isJoined = challenge.participants.some((p) => p.userId === payload.userId);

        return NextResponse.json({
            challenge: {
                ...challenge,
                participants: participantsWithTotals,
                isJoined,
            },
        });
    } catch (error) {
        console.error("Get challenge error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
