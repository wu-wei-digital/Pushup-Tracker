import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
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
        });

        if (!challenge) {
            return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
        }

        // Check if already ended
        if (new Date() > challenge.endDate) {
            return NextResponse.json({ error: "Challenge has ended" }, { status: 400 });
        }

        // Check if already joined
        const existing = await prisma.challengeParticipant.findUnique({
            where: {
                challengeId_userId: {
                    challengeId,
                    userId: payload.userId,
                },
            },
        });

        if (existing) {
            return NextResponse.json({ error: "Already joined" }, { status: 400 });
        }

        const participant = await prisma.challengeParticipant.create({
            data: {
                challengeId,
                userId: payload.userId,
            },
        });

        return NextResponse.json({ participant }, { status: 201 });
    } catch (error) {
        console.error("Join challenge error:", error);
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
        const challengeId = parseInt(id);

        await prisma.challengeParticipant.delete({
            where: {
                challengeId_userId: {
                    challengeId,
                    userId: payload.userId,
                },
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Leave challenge error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
