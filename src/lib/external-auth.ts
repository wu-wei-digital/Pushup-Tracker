import { NextRequest, NextResponse } from "next/server";

/**
 * Validates the X-API-Key header against EXTERNAL_API_KEY env var.
 * Returns a NextResponse error if invalid, or null if valid.
 */
export function validateExternalApiKey(request: NextRequest): NextResponse | null {
    const apiKey = request.headers.get("X-API-Key");
    const expected = process.env.EXTERNAL_API_KEY;

    if (!expected) {
        return NextResponse.json(
            { error: "External API not configured" },
            { status: 503 }
        );
    }

    if (!apiKey || apiKey !== expected) {
        return NextResponse.json(
            { error: "Invalid API key" },
            { status: 401 }
        );
    }

    return null;
}
