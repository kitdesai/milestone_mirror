import { NextRequest, NextResponse } from "next/server";
import { initializeLucia } from "@/lib/auth";
import { getCloudflareEnv } from "@/lib/d1-types";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  const sessionCookie = request.cookies.get("auth_session");

  if (!sessionCookie) {
    return NextResponse.json({ success: true });
  }

  // Get D1 database from Cloudflare context
  const env = getCloudflareEnv(request);
  const db = env?.DB;

  if (!db) {
    // Clear cookie even if DB not available
    const response = NextResponse.json({ success: true });
    response.cookies.delete("auth_session");
    return response;
  }

  try {
    const lucia = initializeLucia(db);
    await lucia.invalidateSession(sessionCookie.value);
    const blankCookie = lucia.createBlankSessionCookie();

    const response = NextResponse.json({ success: true });
    response.cookies.set(
      blankCookie.name,
      blankCookie.value,
      blankCookie.attributes
    );

    return response;
  } catch {
    const response = NextResponse.json({ success: true });
    response.cookies.delete("auth_session");
    return response;
  }
}
