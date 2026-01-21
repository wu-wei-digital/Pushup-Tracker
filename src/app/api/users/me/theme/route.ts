import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(request: NextRequest) {
    try {
        const payload = await getCurrentUser();
        if (!payload) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const body = await request.json();
        const { theme } = body;

        if (!["light", "dark", "system"].includes(theme)) {
            return NextResponse.json({ error: "Invalid theme" }, { status: 400 });
        }

        await prisma.user.update({
            where: { id: payload.userId },
            data: { theme },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Update theme error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
