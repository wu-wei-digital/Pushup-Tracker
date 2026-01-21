import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { pokeSchema } from "@/lib/validators";

export async function GET() {
    try {
        const payload = await getCurrentUser();
        if (!payload) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const pokes = await prisma.poke.findMany({
            where: { pokedId: payload.userId },
            include: {
                poker: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        level: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            take: 20,
        });

        return NextResponse.json({ pokes });
    } catch (error) {
        console.error("Get pokes error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const payload = await getCurrentUser();
        if (!payload) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const body = await request.json();
        const validation = pokeSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.errors[0].message },
                { status: 400 }
            );
        }

        const { pokedId, message } = validation.data;

        if (pokedId === payload.userId) {
            return NextResponse.json({ error: "Cannot poke yourself" }, { status: 400 });
        }

        // Check 24h cooldown
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentPoke = await prisma.poke.findFirst({
            where: {
                pokerId: payload.userId,
                pokedId,
                createdAt: { gte: twentyFourHoursAgo },
            },
        });

        if (recentPoke) {
            const timeLeft = Math.ceil((recentPoke.createdAt.getTime() + 24 * 60 * 60 * 1000 - Date.now()) / (60 * 60 * 1000));
            return NextResponse.json(
                { error: `You can poke this user again in ${timeLeft} hours` },
                { status: 429 }
            );
        }

        const poke = await prisma.poke.create({
            data: {
                pokerId: payload.userId,
                pokedId,
                message,
            },
        });

        // Create notification
        await prisma.notification.create({
            data: {
                userId: pokedId,
                type: "poke",
                title: "You got poked!",
                content: message || `${payload.username} poked you! Time to do some pushups!`,
                link: "/log",
            },
        });

        return NextResponse.json({ poke }, { status: 201 });
    } catch (error) {
        console.error("Create poke error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
