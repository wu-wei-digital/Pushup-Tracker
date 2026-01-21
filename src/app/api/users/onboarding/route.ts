import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export interface OnboardingProgress {
    hasLoggedPushup: boolean;
    hasAddedFriend: boolean;
    hasJoinedChallenge: boolean;
    hasJoinedTeam: boolean;
    isComplete: boolean;
    completedAt: string | null;
    showGuide: boolean;
}

export async function GET() {
    try {
        const payload = await getCurrentUser();
        if (!payload) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                onboardingCompletedAt: true,
                createdAt: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if account is less than 30 days old
        const accountAgeInDays = (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        const isNewAccount = accountAgeInDays < 30;

        // If onboarding is already completed or account is too old, don't show guide
        if (user.onboardingCompletedAt || !isNewAccount) {
            return NextResponse.json({
                hasLoggedPushup: true,
                hasAddedFriend: true,
                hasJoinedChallenge: true,
                hasJoinedTeam: true,
                isComplete: true,
                completedAt: user.onboardingCompletedAt?.toISOString() || null,
                showGuide: false,
            });
        }

        // Check progress for each step
        const [pushupCount, friendCount, challengeCount, teamCount] = await Promise.all([
            prisma.pushupEntry.count({
                where: { userId: payload.userId, isDeleted: false },
            }),
            prisma.friendship.count({
                where: {
                    OR: [
                        { userId: payload.userId, status: "accepted" },
                        { friendId: payload.userId, status: "accepted" },
                    ],
                },
            }),
            prisma.challengeParticipant.count({
                where: { userId: payload.userId },
            }),
            prisma.teamMember.count({
                where: { userId: payload.userId },
            }),
        ]);

        const progress: OnboardingProgress = {
            hasLoggedPushup: pushupCount > 0,
            hasAddedFriend: friendCount > 0,
            hasJoinedChallenge: challengeCount > 0,
            hasJoinedTeam: teamCount > 0,
            isComplete: false,
            completedAt: null,
            showGuide: true,
        };

        // Check if all steps are complete
        if (progress.hasLoggedPushup && progress.hasAddedFriend && progress.hasJoinedChallenge && progress.hasJoinedTeam) {
            progress.isComplete = true;
        }

        return NextResponse.json(progress);
    } catch (error) {
        console.error("Get onboarding progress error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH() {
    try {
        const payload = await getCurrentUser();
        if (!payload) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        // Dismiss the onboarding guide
        await prisma.user.update({
            where: { id: payload.userId },
            data: { onboardingCompletedAt: new Date() },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Update onboarding error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
