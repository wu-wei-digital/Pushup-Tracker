import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_OPTIONS } from "@/lib/auth";

export async function POST() {
    try {
        const cookieStore = await cookies();
        cookieStore.set(AUTH_COOKIE_OPTIONS.name, "", {
            ...AUTH_COOKIE_OPTIONS,
            maxAge: 0,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
