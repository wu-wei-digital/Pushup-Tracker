import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const updateProfilePictureSchema = z.object({
    profilePicture: z.string().url("Invalid URL").or(z.string().startsWith("data:image/")),
});

// POST - Update profile picture
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const payload = await getCurrentUser();
        if (!payload) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const { id } = await params;
        const userId = parseInt(id);

        // Only allow users to update their own profile picture
        if (payload.userId !== userId) {
            return NextResponse.json({ error: "Not authorized" }, { status: 403 });
        }

        const body = await request.json();
        const validation = updateProfilePictureSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.errors[0].message },
                { status: 400 }
            );
        }

        const { profilePicture } = validation.data;

        await prisma.user.update({
            where: { id: userId },
            data: { profilePicture },
        });

        return NextResponse.json({ success: true, profilePicture });
    } catch (error) {
        console.error("Update profile picture error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE - Remove profile picture
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
        const userId = parseInt(id);

        // Only allow users to remove their own profile picture
        if (payload.userId !== userId) {
            return NextResponse.json({ error: "Not authorized" }, { status: 403 });
        }

        await prisma.user.update({
            where: { id: userId },
            data: { profilePicture: null },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete profile picture error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
