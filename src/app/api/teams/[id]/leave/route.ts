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
    const teamId = parseInt(id);

    const membership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: payload.userId } },
    });

    if (!membership) {
      return NextResponse.json({ error: "Not a member" }, { status: 400 });
    }

    // Check if user is the only admin
    if (membership.role === "admin") {
      const adminCount = await prisma.teamMember.count({
        where: { teamId, role: "admin" },
      });

      if (adminCount === 1) {
        const memberCount = await prisma.teamMember.count({ where: { teamId } });
        if (memberCount > 1) {
          return NextResponse.json(
            { error: "Promote another member to admin before leaving" },
            { status: 400 }
          );
        }
        // If only member, delete the team
        await prisma.team.delete({ where: { id: teamId } });
        return NextResponse.json({ success: true, teamDeleted: true });
      }
    }

    await prisma.teamMember.delete({
      where: { teamId_userId: { teamId, userId: payload.userId } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Leave team error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
