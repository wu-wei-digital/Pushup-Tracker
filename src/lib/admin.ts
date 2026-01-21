import { getCurrentUser, JWTPayload } from "@/lib/auth";
import prisma from "@/lib/prisma";

type AdminCheckSuccess = { user: JWTPayload; isAdmin: true };
type AdminCheckError = { error: string; status: number };

export async function requireAdmin(): Promise<AdminCheckSuccess | AdminCheckError> {
    const payload = await getCurrentUser();

    if (!payload) {
        return { error: "Not authenticated", status: 401 };
    }

    // Double-check admin status from database (in case token is stale)
    const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { isAdmin: true, isDisabled: true },
    });

    if (!user) {
        return { error: "User not found", status: 404 };
    }

    if (user.isDisabled) {
        return { error: "Account is disabled", status: 403 };
    }

    if (!user.isAdmin) {
        return { error: "Admin access required", status: 403 };
    }

    return { user: payload, isAdmin: true };
}

export function isAdminCheckError(result: AdminCheckSuccess | AdminCheckError): result is AdminCheckError {
    return "error" in result;
}
