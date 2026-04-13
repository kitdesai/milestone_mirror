import { NextRequest, NextResponse } from "next/server";
import { initializeLucia } from "@/lib/auth";
import { getCloudflareEnv } from "@/lib/d1-types";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get("auth_session");

  if (!sessionCookie) {
    return NextResponse.json({ user: null });
  }

  // Get D1 database from Cloudflare context
  const env = getCloudflareEnv(request);
  const db = env?.DB;

  if (!db) {
    return NextResponse.json({ user: null });
  }

  try {
    const lucia = initializeLucia(db);
    const { session, user } = await lucia.validateSession(sessionCookie.value);

    if (!session || !user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        tier: user.tier,
      },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
