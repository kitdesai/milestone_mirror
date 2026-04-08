import { NextRequest, NextResponse } from "next/server";
import { initializeLucia } from "@/lib/auth";
import { getCloudflareEnv } from "@/lib/d1-types";
import {
  isAppleConfigured,
  exchangeAppleCode,
  verifyAppleIdToken,
} from "@/lib/apple-auth";
import { generateId } from "@/lib/utils";

export const runtime = "edge";

// Apple uses form_post response mode
export async function POST(request: NextRequest) {
  try {
    const env = getCloudflareEnv(request);
    const db = env?.DB;

    if (!db || !env || !isAppleConfigured(env)) {
      return NextResponse.redirect(
        new URL("/auth?error=apple_not_configured", request.url)
      );
    }

    const formData = await request.formData();
    const code = formData.get("code") as string;
    const state = formData.get("state") as string;
    const errorParam = formData.get("error") as string | null;

    // User cancelled or Apple returned an error
    if (errorParam) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    // Validate CSRF state
    const storedState = request.cookies.get("apple_oauth_state")?.value;
    if (!state || state !== storedState) {
      return NextResponse.redirect(
        new URL("/auth?error=invalid_state", request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL("/auth?error=missing_code", request.url)
      );
    }

    const origin = new URL(request.url).origin;
    const redirectUri = `${origin}/api/auth/apple/callback`;

    // Exchange code for tokens
    const { idToken } = await exchangeAppleCode(
      code,
      {
        APPLE_CLIENT_ID: env.APPLE_CLIENT_ID!,
        APPLE_TEAM_ID: env.APPLE_TEAM_ID!,
        APPLE_KEY_ID: env.APPLE_KEY_ID!,
        APPLE_PRIVATE_KEY: env.APPLE_PRIVATE_KEY!,
      },
      redirectUri
    );

    // Verify the id token
    const claims = await verifyAppleIdToken(idToken, env.APPLE_CLIENT_ID!);

    // Look up existing OAuth account
    const existingOAuth = await db
      .prepare(
        "SELECT user_id FROM oauth_accounts WHERE provider = 'apple' AND provider_user_id = ?"
      )
      .bind(claims.sub)
      .first<{ user_id: string }>();

    let userId: string;

    if (existingOAuth) {
      userId = existingOAuth.user_id;
    } else {
      // Check if user with this email already exists
      const existingUser = await db
        .prepare("SELECT id FROM users WHERE email = ?")
        .bind(claims.email.toLowerCase())
        .first<{ id: string }>();

      if (existingUser) {
        userId = existingUser.id;
      } else {
        // Create new user
        userId = generateId();
        await db
          .prepare(
            "INSERT INTO users (id, email, email_verified, password_hash) VALUES (?, ?, 1, '')"
          )
          .bind(userId, claims.email.toLowerCase())
          .run();
      }

      // Link Apple account
      await db
        .prepare(
          "INSERT INTO oauth_accounts (provider, provider_user_id, user_id) VALUES ('apple', ?, ?)"
        )
        .bind(claims.sub, userId)
        .run();

      // Ensure email is verified
      await db
        .prepare(
          "UPDATE users SET email_verified = 1, updated_at = datetime('now') WHERE id = ?"
        )
        .bind(userId)
        .run();
    }

    // Create session
    const lucia = initializeLucia(db);
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    const response = NextResponse.redirect(new URL("/app", request.url));
    response.cookies.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
    // Clear the state cookie
    response.cookies.set("apple_oauth_state", "", {
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Apple callback error:", error);
    return NextResponse.redirect(
      new URL("/auth?error=apple_auth_failed", request.url)
    );
  }
}
