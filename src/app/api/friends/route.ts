import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const payload = await getCurrentUser();
        if (!payload) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status") || "accepted";
        const search = searchParams.get("search") || "";

        // Get all friendships for this user
        const friendships = await prisma.friendship.findMany({
            where: {
                OR: [
                    { userId: payload.userId },
                    { friendId: payload.userId },
                ],
                status: status === "all" ? undefined : status,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        level: true,
                        currentTitle: true,
                        points: true,
                    },
                },
                friend: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        level: true,
                        currentTitle: true,
                        points: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // Transform to show the other user
        const friends = friendships.map((f) => {
            const otherUser = f.userId === payload.userId ? f.friend : f.user;
            const isInitiator = f.userId === payload.userId;
            return {
                id: f.id,
                user: otherUser,
                status: f.status,
                isInitiator,
                createdAt: f.createdAt,
                acceptedAt: f.acceptedAt,
            };
        }).filter((f) => {
            if (!search) return true;
            const searchLower = search.toLowerCase();
            return (
                f.user.username.toLowerCase().includes(searchLower) ||
        f.user.displayName?.toLowerCase().includes(searchLower)
            );
        });

        return NextResponse.json({ friends });
    } catch (error) {
        console.error("Get friends error:", error);
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
        const { friendId } = body;

        if (!friendId || friendId === payload.userId) {
            return NextResponse.json({ error: "Invalid friend ID" }, { status: 400 });
        }

        // Check if friend exists
        const friend = await prisma.user.findUnique({
            where: { id: friendId },
        });

        if (!friend) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if friendship already exists
        const existingFriendship = await prisma.friendship.findFirst({
            where: {
                OR: [
                    { userId: payload.userId, friendId },
                    { userId: friendId, friendId: payload.userId },
                ],
            },
        });

        if (existingFriendship) {
            return NextResponse.json({ error: "Friendship already exists" }, { status: 400 });
        }

        // Create friendship
        const friendship = await prisma.friendship.create({
            data: {
                userId: payload.userId,
                friendId,
                status: "pending",
            },
        });

        // Create notification for the recipient
        await prisma.notification.create({
            data: {
                userId: friendId,
                type: "friend_request",
                title: "New Friend Request",
                content: `${payload.username} sent you a friend request`,
                link: "/friends",
            },
        });

        return NextResponse.json({ friendship }, { status: 201 });
    } catch (error) {
        console.error("Create friendship error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
