import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { checkAndAwardAchievements } from "@/lib/checkAchievements";

export async function POST() {
    try {
        const payload = await getCurrentUser();
        if (!payload) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const result = await checkAndAwardAchievements(payload.userId);

        return NextResponse.json({
            newBadges: result.newBadges,
            pointsAwarded: result.pointsAwarded,
        });
    } catch (error) {
        console.error("Check achievements error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
