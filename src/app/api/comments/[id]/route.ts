import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

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
        const commentId = parseInt(id);

        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
        });

        if (!comment || comment.isDeleted) {
            return NextResponse.json({ error: "Comment not found" }, { status: 404 });
        }

        if (comment.userId !== payload.userId) {
            return NextResponse.json({ error: "Not authorized" }, { status: 403 });
        }

        await prisma.comment.update({
            where: { id: commentId },
            data: { isDeleted: true },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete comment error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
