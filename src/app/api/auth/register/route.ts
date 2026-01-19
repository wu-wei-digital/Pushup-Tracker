import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { signToken, AUTH_COOKIE_OPTIONS } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { username, email, password } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 }
      );
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        displayName: username,
      },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        bio: true,
        yearlyGoal: true,
        timezone: true,
        points: true,
        level: true,
        currentTitle: true,
        theme: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Create JWT token
    const token = signToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_OPTIONS.name, token, AUTH_COOKIE_OPTIONS);

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
