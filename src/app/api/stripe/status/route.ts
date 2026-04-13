import { NextRequest, NextResponse } from "next/server";
import { initializeLucia } from "@/lib/auth";
import { getCloudflareEnv, D1Database } from "@/lib/d1-types";

export const runtime = "edge";

async function getAuthUser(request: NextRequest, db: D1Database) {
  const sessionCookie = request.cookies.get("auth_session");
  if (!sessionCookie) return null;

  const lucia = initializeLucia(db);
  const { session, user } = await lucia.validateSession(sessionCookie.value);

  if (!session || !user) return null;
  return user;
}

export async function GET(request: NextRequest) {
  const env = getCloudflareEnv(request);
  const db = env?.DB;

  if (!db) {
    return NextResponse.json(
      { error: "Database not available" },
      { status: 500 }
    );
  }

  const user = await getAuthUser(request, db);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await db
    .prepare(
      `SELECT id, stripe_price_id as priceId, status, current_period_end as currentPeriodEnd, cancel_at_period_end as cancelAtPeriodEnd
       FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`
    )
    .bind(user.id)
    .first<{
      id: string;
      priceId: string;
      status: string;
      currentPeriodEnd: string;
      cancelAtPeriodEnd: number;
    }>();

  return NextResponse.json({
    tier: user.tier,
    subscription: subscription
      ? {
          id: subscription.id,
          priceId: subscription.priceId,
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd,
          cancelAtPeriodEnd: Boolean(subscription.cancelAtPeriodEnd),
        }
      : null,
  });
}
