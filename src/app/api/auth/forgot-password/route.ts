import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validators";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const validation = forgotPasswordSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.errors[0].message },
                { status: 400 }
            );
        }

        const { email } = validation.data;

        // Always return success to avoid revealing if email exists
        const successResponse = NextResponse.json({
            message: "If an account exists with that email, we've sent a reset link.",
        });

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return successResponse;
        }

        // Delete any existing tokens for this user
        await prisma.passwordResetToken.deleteMany({
            where: { userId: user.id },
        });

        // Generate a secure token
        const rawToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto
            .createHash("sha256")
            .update(rawToken)
            .digest("hex");

        // Store hashed token in DB with 1-hour expiry
        await prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                token: hashedToken,
                expiresAt: new Date(Date.now() + 60 * 60 * 1000),
            },
        });

        // Send email with the raw token
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000";
        const resetUrl = `${appUrl}/reset-password?token=${rawToken}`;

        await sendPasswordResetEmail(email, user.username, resetUrl);

        return successResponse;
    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
