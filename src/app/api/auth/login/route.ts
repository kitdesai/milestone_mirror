import { NextRequest, NextResponse } from "next/server";
import { initializeLucia } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { getCloudflareEnv } from "@/lib/d1-types";

interface AuthRequest {
  email: string;
  password: string;
}

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const { email, password }: AuthRequest = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Get D1 database from Cloudflare context
    const env = getCloudflareEnv(request);
    const db = env?.DB;

    if (!db) {
      return NextResponse.json(
        { error: "Database not available. Please configure D1." },
        { status: 500 }
      );
    }

    const user = await db
      .prepare("SELECT id, password_hash FROM users WHERE email = ?")
      .bind(email.toLowerCase())
      .first<{ id: string; password_hash: string }>();

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const validPassword = await verifyPassword(password, user.password_hash);
    if (!validPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const lucia = initializeLucia(db);
    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    const response = NextResponse.json({ success: true });
    response.cookies.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
