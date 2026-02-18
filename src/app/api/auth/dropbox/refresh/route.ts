import { NextRequest, NextResponse } from "next/server";

interface RefreshRequest {
  refresh_token: string;
}

interface DropboxTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

const DROPBOX_TOKEN_URL = "https://api.dropboxapi.com/oauth2/token";
export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const { refresh_token }: RefreshRequest = await request.json();

    if (!refresh_token) {
      return NextResponse.json(
        { error: "No refresh token provided" },
        { status: 400 }
      );
    }

    const clientId = process.env.DROPBOX_CLIENT_ID;
    const clientSecret = process.env.DROPBOX_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: "Server not configured" },
        { status: 500 }
      );
    }

    const tokenResponse = await fetch(DROPBOX_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        refresh_token,
        grant_type: "refresh_token",
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Token refresh failed:", errorData);
      return NextResponse.json(
        { error: "Token refresh failed" },
        { status: 401 }
      );
    }

    const tokens: DropboxTokenResponse = await tokenResponse.json();
    const expiresAt = Date.now() + (tokens.expires_in || 14400) * 1000;

    return NextResponse.json({
      access_token: tokens.access_token,
      refresh_token: refresh_token, // Dropbox doesn't return new refresh token
      expires_at: expiresAt,
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
