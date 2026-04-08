import { NextRequest, NextResponse } from "next/server";
import { initializeLucia } from "@/lib/auth";
import { getCloudflareEnv } from "@/lib/d1-types";
import { verifyCode } from "@/lib/verification-code";
import { generateId } from "@/lib/utils";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const { email, code }: { email: string; code: string } =
      await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and code are required" },
        { status: 400 }
      );
    }

    const env = getCloudflareEnv(request);
    const db = env?.DB;

    if (!db) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 500 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const valid = await verifyCode(db, normalizedEmail, code.trim());
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid or expired code" },
        { status: 401 }
      );
    }

    // Find or create user
    let user = await db
      .prepare("SELECT id FROM users WHERE email = ?")
      .bind(normalizedEmail)
      .first<{ id: string }>();

    if (!user) {
      const userId = generateId();
      await db
        .prepare(
          "INSERT INTO users (id, email, email_verified, password_hash) VALUES (?, ?, 1, '')"
        )
        .bind(userId, normalizedEmail)
        .run();
      user = { id: userId };
    } else {
      // Mark email as verified
      await db
        .prepare(
          "UPDATE users SET email_verified = 1, updated_at = datetime('now') WHERE id = ?"
        )
        .bind(user.id)
        .run();
    }

    // Create session
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
    console.error("Verify code error:", error);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
