import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createTeamInvitationSchema } from "@/lib/validators";

// GET - List team invitations (admin only)
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

        // Check if user is a team admin
        const membership = await prisma.teamMember.findUnique({
            where: {
                teamId_userId: { teamId, userId: payload.userId },
            },
        });

        if (!membership || membership.role !== "admin") {
            return NextResponse.json({ error: "Not authorized" }, { status: 403 });
        }

        const invitations = await prisma.teamInvitation.findMany({
            where: { teamId },
            include: {
                invitee: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        profilePicture: true,
                    },
                },
                inviter: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ invitations });
    } catch (error) {
        console.error("Get team invitations error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST - Create invitation (admin only)
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
        const teamId = parseInt(id);

        // Check if user is a team admin
        const membership = await prisma.teamMember.findUnique({
            where: {
                teamId_userId: { teamId, userId: payload.userId },
            },
        });

        if (!membership || membership.role !== "admin") {
            return NextResponse.json({ error: "Not authorized" }, { status: 403 });
        }

        const body = await request.json();
        const validation = createTeamInvitationSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.errors[0].message },
                { status: 400 }
            );
        }

        const { inviteeId, message } = validation.data;

        // Check if invitee exists
        const invitee = await prisma.user.findUnique({
            where: { id: inviteeId },
            select: { id: true, username: true },
        });

        if (!invitee) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if user is already a member
        const existingMembership = await prisma.teamMember.findUnique({
            where: {
                teamId_userId: { teamId, userId: inviteeId },
            },
        });

        if (existingMembership) {
            return NextResponse.json({ error: "User is already a team member" }, { status: 400 });
        }

        // Check if there's already a pending invitation
        const existingInvitation = await prisma.teamInvitation.findUnique({
            where: {
                teamId_inviteeId: { teamId, inviteeId },
            },
        });

        if (existingInvitation && existingInvitation.status === "pending") {
            return NextResponse.json({ error: "User already has a pending invitation" }, { status: 400 });
        }

        // Get team name for notification
        const team = await prisma.team.findUnique({
            where: { id: teamId },
            select: { name: true },
        });

        // Create or update invitation
        const invitation = await prisma.teamInvitation.upsert({
            where: {
                teamId_inviteeId: { teamId, inviteeId },
            },
            create: {
                teamId,
                inviterId: payload.userId,
                inviteeId,
                message,
                status: "pending",
            },
            update: {
                inviterId: payload.userId,
                message,
                status: "pending",
                respondedAt: null,
                createdAt: new Date(),
            },
            include: {
                invitee: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                    },
                },
            },
        });

        // Create notification for invitee
        await prisma.notification.create({
            data: {
                userId: inviteeId,
                type: "team_invitation",
                title: "Team Invitation",
                content: `You've been invited to join ${team?.name || "a team"}`,
                link: "/teams",
            },
        });

        return NextResponse.json({ invitation }, { status: 201 });
    } catch (error) {
        console.error("Create team invitation error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
