import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
    try {
        const payload = await getCurrentUser();
        if (!payload) {
            return NextResponse.json({ count: 0 });
        }

        const count = await prisma.notification.count({
            where: {
                userId: payload.userId,
                isRead: false,
            },
        });

        return NextResponse.json({ count });
    } catch (error) {
        console.error("Get notification count error:", error);
        return NextResponse.json({ count: 0 });
    }
}
