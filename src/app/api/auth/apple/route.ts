import { NextRequest, NextResponse } from "next/server";
import { getCloudflareEnv } from "@/lib/d1-types";
import { isAppleConfigured, getAppleAuthorizationURL } from "@/lib/apple-auth";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const env = getCloudflareEnv(request);

  if (!env || !isAppleConfigured(env)) {
    return NextResponse.json(
      { error: "Apple Sign In not configured" },
      { status: 404 }
    );
  }

  const state = crypto.randomUUID();
  const origin = new URL(request.url).origin;
  const redirectUri = `${origin}/api/auth/apple/callback`;

  const authURL = getAppleAuthorizationURL(
    env.APPLE_CLIENT_ID!,
    redirectUri,
    state
  );

  const response = NextResponse.redirect(authURL);
  response.cookies.set("apple_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "none", // Must be "none" for Apple's cross-site form_post callback
    maxAge: 600,
    path: "/",
  });

  return response;
}
