import { NextResponse } from "next/server";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const SCOPES = [
  "https://www.googleapis.com/auth/photoslibrary.readonly",
].join(" ");

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      { error: "Google Client ID not configured" },
      { status: 500 }
    );
  }

  const redirectUri = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/callback`;

  const authUrl = new URL(GOOGLE_AUTH_URL);
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", SCOPES);
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent"); // Force consent to get refresh token

  return NextResponse.redirect(authUrl.toString());
}
