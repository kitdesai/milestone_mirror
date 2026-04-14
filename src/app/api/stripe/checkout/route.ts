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

  const { plan }: { plan: "monthly" | "yearly" } = await request.json();

  const priceId =
    plan === "yearly"
      ? env.STRIPE_YEARLY_PRICE_ID
      : env.STRIPE_MONTHLY_PRICE_ID;

  if (!priceId) {
    return NextResponse.json(
      { error: "Pricing not configured" },
      { status: 500 }
    );
  }

  const stripe = getStripe(env.STRIPE_SECRET_KEY);
  const origin = new URL(request.url).origin;

  // Get or create Stripe customer
  let stripeCustomerId: string | null = null;
  const userRow = await db
    .prepare("SELECT stripe_customer_id FROM users WHERE id = ?")
    .bind(user.id)
    .first<{ stripe_customer_id: string | null }>();

  stripeCustomerId = userRow?.stripe_customer_id ?? null;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id },
    });
    stripeCustomerId = customer.id;
    await db
      .prepare(
        "UPDATE users SET stripe_customer_id = ?, updated_at = datetime('now') WHERE id = ?"
      )
      .bind(stripeCustomerId, user.id)
      .run();
  }

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/app?upgraded=true`,
    cancel_url: `${origin}/app`,
    metadata: { userId: user.id },
    subscription_data: {
      metadata: { userId: user.id },
    },
  });

  return NextResponse.json({ url: session.url });
}
