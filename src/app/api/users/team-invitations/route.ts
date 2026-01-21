import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET - List pending invitations for current user
export async function GET() {
    try {
        const payload = await getCurrentUser();
        if (!payload) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const invitations = await prisma.teamInvitation.findMany({
            where: {
                inviteeId: payload.userId,
                status: "pending",
            },
            include: {
                team: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        teamGoal: true,
                        _count: {
                            select: { members: true },
                        },
                    },
                },
                inviter: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        profilePicture: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ invitations });
    } catch (error) {
        console.error("Get user team invitations error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
