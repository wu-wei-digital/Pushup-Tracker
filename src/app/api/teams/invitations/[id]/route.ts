import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { respondTeamInvitationSchema } from "@/lib/validators";

// PATCH - Accept or decline invitation
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
        const invitationId = parseInt(id);

        const body = await request.json();
        const validation = respondTeamInvitationSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.errors[0].message },
                { status: 400 }
            );
        }

        const { action } = validation.data;

        // Get invitation
        const invitation = await prisma.teamInvitation.findUnique({
            where: { id: invitationId },
            include: {
                team: { select: { name: true } },
                inviter: { select: { id: true } },
            },
        });

        if (!invitation) {
            return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
        }

        // Only the invitee can respond
        if (invitation.inviteeId !== payload.userId) {
            return NextResponse.json({ error: "Not authorized" }, { status: 403 });
        }

        if (invitation.status !== "pending") {
            return NextResponse.json({ error: "Invitation already processed" }, { status: 400 });
        }

        if (action === "accept") {
            // Accept invitation - add as team member and update invitation
            await prisma.$transaction(async (tx) => {
                await tx.teamInvitation.update({
                    where: { id: invitationId },
                    data: {
                        status: "accepted",
                        respondedAt: new Date(),
                    },
                });

                await tx.teamMember.create({
                    data: {
                        teamId: invitation.teamId,
                        userId: payload.userId,
                        role: "member",
                    },
                });

                // Notify the inviter
                await tx.notification.create({
                    data: {
                        userId: invitation.inviter.id,
                        type: "team_invitation_accepted",
                        title: "Invitation Accepted",
                        content: `${payload.username} accepted your invitation to join ${invitation.team.name}`,
                        link: `/teams/${invitation.teamId}`,
                    },
                });
            });

            return NextResponse.json({ success: true, action: "accepted" });
        } else {
            // Decline invitation
            await prisma.teamInvitation.update({
                where: { id: invitationId },
                data: {
                    status: "declined",
                    respondedAt: new Date(),
                },
            });

            return NextResponse.json({ success: true, action: "declined" });
        }
    } catch (error) {
        console.error("Respond to team invitation error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE - Cancel invitation (admin only)
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
        const invitationId = parseInt(id);

        // Get invitation
        const invitation = await prisma.teamInvitation.findUnique({
            where: { id: invitationId },
        });

        if (!invitation) {
            return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
        }

        // Check if user is a team admin or the invitee
        const membership = await prisma.teamMember.findUnique({
            where: {
                teamId_userId: { teamId: invitation.teamId, userId: payload.userId },
            },
        });

        const isAdmin = membership?.role === "admin";
        const isInvitee = invitation.inviteeId === payload.userId;

        if (!isAdmin && !isInvitee) {
            return NextResponse.json({ error: "Not authorized" }, { status: 403 });
        }

        await prisma.teamInvitation.delete({
            where: { id: invitationId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete team invitation error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
