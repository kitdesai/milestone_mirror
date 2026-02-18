import { NextRequest, NextResponse } from "next/server";
import { initializeLucia } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { generateId } from "@/lib/utils";
import { getCloudflareEnv } from "@/lib/d1-types";

interface AuthRequest {
  email: string;
  password: string;
}

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const { email, password }: AuthRequest = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Get D1 database from Cloudflare context
    const env = getCloudflareEnv(request);
    const db = env?.DB;

    if (!db) {
      // For local development without D1, return error
      return NextResponse.json(
        { error: "Database not available. Please configure D1." },
        { status: 500 }
      );
    }

    // Check if user exists
    const existingUser = await db
      .prepare("SELECT id FROM users WHERE email = ?")
      .bind(email.toLowerCase())
      .first();

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Create user
    const userId = generateId();
    const passwordHash = await hashPassword(password);

    await db
      .prepare(
        "INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)"
      )
      .bind(userId, email.toLowerCase(), passwordHash)
      .run();

    // Create session
    const lucia = initializeLucia(db);
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    const response = NextResponse.json({ success: true });
    response.cookies.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
