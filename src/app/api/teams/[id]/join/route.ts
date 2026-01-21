import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

// Direct joining is no longer supported - teams are invitation-only
export async function POST() {
    const payload = await getCurrentUser();
    if (!payload) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Teams are now invitation-only
    return NextResponse.json(
        { error: "Teams are invitation-only. Please contact a team admin to request an invitation." },
        { status: 400 }
    );
}
