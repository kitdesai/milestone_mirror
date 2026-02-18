import { NextRequest, NextResponse } from "next/server";

interface DropboxTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

const DROPBOX_TOKEN_URL = "https://api.dropboxapi.com/oauth2/token";
export const runtime = "edge";

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
    return NextResponse.redirect(new URL("/?error=no_code", request.url));
  }

  const clientId = process.env.DROPBOX_CLIENT_ID;
  const clientSecret = process.env.DROPBOX_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/?error=server_config", request.url));
  }

  const redirectUri = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/dropbox/callback`;

  try {
    // Exchange authorization code for tokens
    const tokenResponse = await fetch(DROPBOX_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Token exchange failed:", errorData);
      return NextResponse.redirect(
        new URL("/?error=token_exchange", request.url)
      );
    }

    const tokens: DropboxTokenResponse = await tokenResponse.json();

    // Calculate expiration timestamp (Dropbox tokens expire in 4 hours by default)
    const expiresAt = Date.now() + (tokens.expires_in || 14400) * 1000;

    // Create the response with redirect
    const response = NextResponse.redirect(
      new URL("/?connected=true", request.url)
    );

    // Set tokens in a cookie (will be read by client and stored in localStorage)
    const tokenData = JSON.stringify({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: expiresAt,
    });

    response.cookies.set("dropbox_tokens", tokenData, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
  }
}
