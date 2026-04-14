// Google Sign In utilities
// Uses jose library for JWT/JWKS operations (Web Crypto compatible)

import { jwtVerify, createRemoteJWKSet } from "jose";

interface GoogleEnv {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
}

interface GoogleTokenClaims {
  sub: string;
  email: string;
  email_verified: boolean;
}

const GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

export function isGoogleConfigured(env: Partial<GoogleEnv>): boolean {
  return !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
}

export function getGoogleAuthorizationURL(
  clientId: string,
  redirectUri: string,
  state: string
): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "openid email",
    state,
    access_type: "online",
    prompt: "select_account",
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export async function exchangeGoogleCode(
  code: string,
  env: GoogleEnv,
  redirectUri: string
): Promise<{ idToken: string }> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Google token exchange error:", error);
    throw new Error("Failed to exchange Google authorization code");
  }

  const data = (await response.json()) as { id_token: string };
  return { idToken: data.id_token };
}

export async function verifyGoogleIdToken(
  idToken: string,
  clientId: string
): Promise<GoogleTokenClaims> {
  const JWKS = createRemoteJWKSet(new URL(GOOGLE_JWKS_URL));

  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer: ["https://accounts.google.com", "accounts.google.com"],
    audience: clientId,
  });

  return {
    sub: payload.sub as string,
    email: payload.email as string,
    email_verified: payload.email_verified as boolean,
  };
}
