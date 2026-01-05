import { NextRequest, NextResponse } from "next/server";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

export async function POST(request: NextRequest) {
  try {
    const { refresh_token } = await request.json();

    if (!refresh_token) {
      return NextResponse.json(
        { error: "No refresh token provided" },
        { status: 400 }
      );
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: "Server not configured" },
        { status: 500 }
      );
    }

    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        refresh_token,
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "refresh_token",
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

    const tokens = await tokenResponse.json();
    const expiresAt = Date.now() + tokens.expires_in * 1000;

    return NextResponse.json({
      access_token: tokens.access_token,
      refresh_token: refresh_token, // Google doesn't always return a new refresh token
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
