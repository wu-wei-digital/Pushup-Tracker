import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { resetPasswordSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const validation = resetPasswordSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.errors[0].message },
                { status: 400 }
            );
        }

        const { token, newPassword } = validation.data;

        // Hash the provided token to compare with stored hash
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token: hashedToken },
            include: { user: true },
        });

        if (!resetToken) {
            return NextResponse.json(
                { error: "Invalid or expired reset link" },
                { status: 400 }
            );
        }

        if (resetToken.expiresAt < new Date()) {
            // Clean up expired token
            await prisma.passwordResetToken.delete({
                where: { id: resetToken.id },
            });
            return NextResponse.json(
                { error: "Reset link has expired. Please request a new one." },
                { status: 400 }
            );
        }

        // Update password
        const newHash = await hashPassword(newPassword);

        await prisma.user.update({
            where: { id: resetToken.userId },
            data: { passwordHash: newHash },
        });

        // Delete used token
        await prisma.passwordResetToken.delete({
            where: { id: resetToken.id },
        });

        return NextResponse.json({ message: "Password has been reset successfully" });
    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
