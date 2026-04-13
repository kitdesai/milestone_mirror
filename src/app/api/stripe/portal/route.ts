import { NextRequest, NextResponse } from "next/server";
import { initializeLucia } from "@/lib/auth";
import { getCloudflareEnv, D1Database } from "@/lib/d1-types";
import { getStripe } from "@/lib/stripe";

export const runtime = "edge";

async function getAuthUser(request: NextRequest, db: D1Database) {
  const sessionCookie = request.cookies.get("auth_session");
  if (!sessionCookie) return null;

  const lucia = initializeLucia(db);
  const { session, user } = await lucia.validateSession(sessionCookie.value);

  if (!session || !user) return null;
  return user;
}

export async function POST(request: NextRequest) {
  const env = getCloudflareEnv(request);
  const db = env?.DB;

  if (!db || !env?.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Service not configured" },
      { status: 500 }
    );
  }

  const user = await getAuthUser(request, db);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRow = await db
    .prepare("SELECT stripe_customer_id FROM users WHERE id = ?")
    .bind(user.id)
    .first<{ stripe_customer_id: string | null }>();

  if (!userRow?.stripe_customer_id) {
    return NextResponse.json(
      { error: "No subscription found" },
      { status: 404 }
    );
  }

  const stripe = getStripe(env.STRIPE_SECRET_KEY);
  const origin = new URL(request.url).origin;

  const session = await stripe.billingPortal.sessions.create({
    customer: userRow.stripe_customer_id,
    return_url: `${origin}/app`,
  });

  return NextResponse.json({ url: session.url });
}
