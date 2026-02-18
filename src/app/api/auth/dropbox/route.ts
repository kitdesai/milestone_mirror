import { NextResponse } from "next/server";

const DROPBOX_AUTH_URL = "https://www.dropbox.com/oauth2/authorize";
export const runtime = "edge";

export async function GET() {
  const clientId = process.env.DROPBOX_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      { error: "Dropbox Client ID not configured" },
      { status: 500 }
    );
  }

  const redirectUri = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/dropbox/callback`;

  const authUrl = new URL(DROPBOX_AUTH_URL);
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("token_access_type", "offline"); // Get refresh token

  return NextResponse.redirect(authUrl.toString());
}
