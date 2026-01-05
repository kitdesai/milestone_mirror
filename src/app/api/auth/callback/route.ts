import { NextRequest, NextResponse } from "next/server";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/?error=no_code", request.url)
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL("/?error=server_config", request.url)
    );
  }

  const redirectUri = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/callback`;

  try {
    // Exchange authorization code for tokens
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Token exchange failed:", errorData);
      return NextResponse.redirect(
        new URL("/?error=token_exchange", request.url)
      );
    }

    const tokens = await tokenResponse.json();

    // Calculate expiration timestamp
    const expiresAt = Date.now() + tokens.expires_in * 1000;

    // Create the response with redirect
    const response = NextResponse.redirect(new URL("/?connected=true", request.url));

    // Set tokens in a cookie (will be read by client and stored in localStorage)
    // In production, consider using httpOnly cookies for better security
    const tokenData = JSON.stringify({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: expiresAt,
    });

    response.cookies.set("google_tokens", tokenData, {
      httpOnly: false, // Allow JavaScript access for localStorage transfer
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60, // Short-lived, just for transfer to localStorage
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/?error=auth_failed", request.url)
    );
  }
}
