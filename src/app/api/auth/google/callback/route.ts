import { NextRequest, NextResponse } from "next/server";
import { initializeLucia } from "@/lib/auth";
import { getCloudflareEnv } from "@/lib/d1-types";
import {
  isGoogleConfigured,
  exchangeGoogleCode,
  verifyGoogleIdToken,
} from "@/lib/google-auth";
import { generateId } from "@/lib/utils";

export const runtime = "edge";

// Google uses standard OAuth 2.0 redirect (GET)
export async function GET(request: NextRequest) {
  try {
    const env = getCloudflareEnv(request);
    const db = env?.DB;

    if (!db || !env || !isGoogleConfigured(env)) {
      return NextResponse.redirect(
        new URL("/auth?error=google_not_configured", request.url),
        303
      );
    }

    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const errorParam = url.searchParams.get("error");

    // User cancelled or Google returned an error
    if (errorParam) {
      return NextResponse.redirect(new URL("/auth", request.url), 303);
    }

    // Validate CSRF state
    const storedState = request.cookies.get("google_oauth_state")?.value;
    if (!state || state !== storedState) {
      return NextResponse.redirect(
        new URL("/auth?error=invalid_state", request.url),
        303
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL("/auth?error=missing_code", request.url),
        303
      );
    }

    const origin = new URL(request.url).origin;
    const redirectUri = `${origin}/api/auth/google/callback`;

    // Exchange code for tokens
    const { idToken } = await exchangeGoogleCode(
      code,
      {
        GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID!,
        GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET!,
      },
      redirectUri
    );

    // Verify the id token
    const claims = await verifyGoogleIdToken(idToken, env.GOOGLE_CLIENT_ID!);

    // Look up existing OAuth account
    const existingOAuth = await db
      .prepare(
        "SELECT user_id FROM oauth_accounts WHERE provider = 'google' AND provider_user_id = ?"
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

      // Link Google account
      await db
        .prepare(
          "INSERT INTO oauth_accounts (provider, provider_user_id, user_id) VALUES ('google', ?, ?)"
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

    const response = NextResponse.redirect(new URL("/app", request.url), 303);
    response.cookies.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
    // Clear the state cookie
    response.cookies.set("google_oauth_state", "", {
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Google callback error:", error);
    return NextResponse.redirect(
      new URL("/auth?error=google_auth_failed", request.url),
      303
    );
  }
}
