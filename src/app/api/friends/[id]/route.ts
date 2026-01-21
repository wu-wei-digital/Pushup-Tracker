import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { checkAndAwardAchievements } from "@/lib/checkAchievements";

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
        const friendshipId = parseInt(id);
        const body = await request.json();
        const { action } = body;

        if (!["accept", "reject"].includes(action)) {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        // Get friendship
        const friendship = await prisma.friendship.findUnique({
            where: { id: friendshipId },
        });

        if (!friendship) {
            return NextResponse.json({ error: "Friendship not found" }, { status: 404 });
        }

        // Only the recipient can accept/reject
        if (friendship.friendId !== payload.userId) {
            return NextResponse.json({ error: "Not authorized" }, { status: 403 });
        }

        if (friendship.status !== "pending") {
            return NextResponse.json({ error: "Request already processed" }, { status: 400 });
        }

        if (action === "accept") {
            const updatedFriendship = await prisma.friendship.update({
                where: { id: friendshipId },
                data: {
                    status: "accepted",
                    acceptedAt: new Date(),
                },
            });

            // Notify the original requester
            await prisma.notification.create({
                data: {
                    userId: friendship.userId,
                    type: "friend_accepted",
                    title: "Friend Request Accepted",
                    content: `${payload.username} accepted your friend request`,
                    link: `/profile/${payload.userId}`,
                },
            });

            // Check achievements for both users (friend-related badges)
            await Promise.all([
                checkAndAwardAchievements(payload.userId),
                checkAndAwardAchievements(friendship.userId),
            ]);

            return NextResponse.json({ friendship: updatedFriendship });
        } else {
            // Reject - delete the friendship
            await prisma.friendship.delete({
                where: { id: friendshipId },
            });

            return NextResponse.json({ success: true });
        }
    } catch (error) {
        console.error("Update friendship error:", error);
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
        const friendshipId = parseInt(id);

        // Get friendship
        const friendship = await prisma.friendship.findUnique({
            where: { id: friendshipId },
        });

        if (!friendship) {
            return NextResponse.json({ error: "Friendship not found" }, { status: 404 });
        }

        // Both parties can delete the friendship
        if (friendship.userId !== payload.userId && friendship.friendId !== payload.userId) {
            return NextResponse.json({ error: "Not authorized" }, { status: 403 });
        }

        await prisma.friendship.delete({
            where: { id: friendshipId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete friendship error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
