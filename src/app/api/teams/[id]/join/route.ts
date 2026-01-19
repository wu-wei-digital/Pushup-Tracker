import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

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
    const teamId = parseInt(id);

    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const existing = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: payload.userId } },
    });

    if (existing) {
      return NextResponse.json({ error: "Already a member" }, { status: 400 });
    }

    const member = await prisma.teamMember.create({
      data: {
        teamId,
        userId: payload.userId,
        role: "member",
      },
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    console.error("Join team error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
