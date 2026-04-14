import { NextRequest, NextResponse } from "next/server";
import { getCloudflareEnv } from "@/lib/d1-types";
import { isGoogleConfigured, getGoogleAuthorizationURL } from "@/lib/google-auth";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const env = getCloudflareEnv(request);

  if (!env || !isGoogleConfigured(env)) {
    return NextResponse.json(
      { error: "Google Sign In not configured" },
      { status: 404 }
    );
  }

  const state = crypto.randomUUID();
  const origin = new URL(request.url).origin;
  const redirectUri = `${origin}/api/auth/google/callback`;

  const authURL = getGoogleAuthorizationURL(
    env.GOOGLE_CLIENT_ID!,
    redirectUri,
    state
  );

  const response = NextResponse.redirect(authURL);
  response.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return response;
}
