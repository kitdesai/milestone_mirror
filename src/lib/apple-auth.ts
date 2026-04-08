// Apple Sign In utilities
// Uses jose library for JWT operations (Web Crypto compatible)

import { SignJWT, importPKCS8, jwtVerify, createRemoteJWKSet } from "jose";

interface AppleEnv {
  APPLE_CLIENT_ID: string;
  APPLE_TEAM_ID: string;
  APPLE_KEY_ID: string;
  APPLE_PRIVATE_KEY: string;
}

interface AppleTokenClaims {
  sub: string; // Apple user ID
  email: string;
  email_verified: boolean;
}

const APPLE_JWKS_URL = "https://appleid.apple.com/auth/keys";
const APPLE_TOKEN_URL = "https://appleid.apple.com/auth/token";
const APPLE_AUTH_URL = "https://appleid.apple.com/auth/authorize";

export function isAppleConfigured(env: Partial<AppleEnv>): boolean {
  return !!(
    env.APPLE_CLIENT_ID &&
    env.APPLE_TEAM_ID &&
    env.APPLE_KEY_ID &&
    env.APPLE_PRIVATE_KEY
  );
}

export async function generateAppleClientSecret(
  env: AppleEnv
): Promise<string> {
  const privateKey = await importPKCS8(env.APPLE_PRIVATE_KEY, "ES256");

  return new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: env.APPLE_KEY_ID })
    .setIssuer(env.APPLE_TEAM_ID)
    .setSubject(env.APPLE_CLIENT_ID)
    .setAudience("https://appleid.apple.com")
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(privateKey);
}

export function getAppleAuthorizationURL(
  clientId: string,
  redirectUri: string,
  state: string
): string {
  const params = new URLSearchParams({
    response_type: "code id_token",
    response_mode: "form_post",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "name email",
    state,
  });

  return `${APPLE_AUTH_URL}?${params.toString()}`;
}

export async function exchangeAppleCode(
  code: string,
  env: AppleEnv,
  redirectUri: string
): Promise<{ idToken: string }> {
  const clientSecret = await generateAppleClientSecret(env);

  const response = await fetch(APPLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: env.APPLE_CLIENT_ID,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Apple token exchange error:", error);
    throw new Error("Failed to exchange Apple authorization code");
  }

  const data = (await response.json()) as { id_token: string };
  return { idToken: data.id_token };
}

export async function verifyAppleIdToken(
  idToken: string,
  clientId: string
): Promise<AppleTokenClaims> {
  const JWKS = createRemoteJWKSet(new URL(APPLE_JWKS_URL));

  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer: "https://appleid.apple.com",
    audience: clientId,
  });

  return {
    sub: payload.sub as string,
    email: payload.email as string,
    email_verified: payload.email_verified as boolean,
  };
}
