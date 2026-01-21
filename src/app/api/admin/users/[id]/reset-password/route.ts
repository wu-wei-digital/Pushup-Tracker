import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, isAdminCheckError } from "@/lib/admin";
import { hashPassword } from "@/lib/password";
import { z } from "zod";

const resetPasswordSchema = z.object({
    newPassword: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
});

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const adminCheck = await requireAdmin();
    if (isAdminCheckError(adminCheck)) {
        return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    try {
        const { id } = await params;
        const userId = parseInt(id);

        if (isNaN(userId)) {
            return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
        }

        const body = await request.json();
        const validation = resetPasswordSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.errors[0].message },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, username: true },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const passwordHash = await hashPassword(validation.data.newPassword);

        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash },
        });

        return NextResponse.json({
            success: true,
            message: `Password reset for ${user.username}`,
        });
    } catch (error) {
        console.error("Admin reset password error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
