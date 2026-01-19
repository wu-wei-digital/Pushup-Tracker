import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { BADGE_DEFINITIONS } from "@/lib/achievements";

export async function GET() {
  try {
    const payload = await getCurrentUser();
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Return all available badge definitions
    const badges = BADGE_DEFINITIONS.map((badge) => ({
      type: badge.type,
      name: badge.name,
      description: badge.description,
      rarity: badge.rarity,
      icon: badge.icon,
    }));

    return NextResponse.json({ badges });
  } catch (error) {
    console.error("Get achievements error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
