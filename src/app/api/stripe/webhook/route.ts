import { NextRequest, NextResponse } from "next/server";
import { getCloudflareEnv, D1Database } from "@/lib/d1-types";
import { getStripe } from "@/lib/stripe";
import type Stripe from "stripe";

export const runtime = "edge";

// Subscription statuses that grant premium access. `past_due` is Stripe's
// payment-retry window, so access continues there; once retries are exhausted
// the status becomes `unpaid` or `canceled` and access drops back to free.
const PREMIUM_STATUSES = ["active", "trialing", "past_due"];

function periodEnd(sub: Stripe.Subscription): string {
  return new Date(
    (sub.items.data[0]?.current_period_end ?? 0) * 1000
  ).toISOString();
}

async function resolveUserId(
  db: D1Database,
  metadataUserId: string | undefined,
  customerId: string
): Promise<string | null> {
  if (metadataUserId) return metadataUserId;

  const row = await db
    .prepare("SELECT id FROM users WHERE stripe_customer_id = ?")
    .bind(customerId)
    .first<{ id: string }>();

  return row?.id ?? null;
}

async function upsertSubscription(
  db: D1Database,
  sub: Stripe.Subscription,
  userId: string,
  customerId: string
): Promise<void> {
  const priceId = sub.items.data[0]?.price.id ?? "";
  const cancelAtPeriodEnd = sub.cancel_at_period_end ? 1 : 0;

  const existing = await db
    .prepare("SELECT id FROM subscriptions WHERE id = ?")
    .bind(sub.id)
    .first();

  if (existing) {
    await db
      .prepare(
        `UPDATE subscriptions SET user_id = ?, stripe_customer_id = ?, stripe_price_id = ?, status = ?, current_period_end = ?, cancel_at_period_end = ?, updated_at = datetime('now')
         WHERE id = ?`
      )
      .bind(
        userId,
        customerId,
        priceId,
        sub.status,
        periodEnd(sub),
        cancelAtPeriodEnd,
        sub.id
      )
      .run();
  } else {
    await db
      .prepare(
        `INSERT INTO subscriptions (id, user_id, stripe_customer_id, stripe_price_id, status, current_period_end, cancel_at_period_end)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        sub.id,
        userId,
        customerId,
        priceId,
        sub.status,
        periodEnd(sub),
        cancelAtPeriodEnd
      )
      .run();
  }
}

// Recompute the user's tier from every subscription we have stored for them,
// so a cancelled subscription can't strand them on premium and can't revoke
// access while another subscription of theirs is still live.
async function syncUserTier(db: D1Database, userId: string): Promise<void> {
  const placeholders = PREMIUM_STATUSES.map(() => "?").join(", ");

  const active = await db
    .prepare(
      `SELECT id FROM subscriptions
       WHERE user_id = ? AND status IN (${placeholders})
       LIMIT 1`
    )
    .bind(userId, ...PREMIUM_STATUSES)
    .first();

  await db
    .prepare(
      "UPDATE users SET tier = ?, updated_at = datetime('now') WHERE id = ?"
    )
    .bind(active ? "premium" : "free", userId)
    .run();
}

export async function POST(request: NextRequest) {
  const env = getCloudflareEnv(request);
  const db = env?.DB;

  if (!db || !env?.STRIPE_SECRET_KEY || !env?.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Service not configured" },
      { status: 500 }
    );
  }

  const stripe = getStripe(env.STRIPE_SECRET_KEY);
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      sig,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription" || !session.subscription) break;

        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id;
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id ?? "";

        const userId = await resolveUserId(
          db,
          session.metadata?.userId,
          customerId
        );

        if (!userId) {
          console.error("No user found for checkout session:", session.id);
          break;
        }

        // Fetch the full subscription to get price and period info
        const sub = await stripe.subscriptions.retrieve(subscriptionId);

        await upsertSubscription(db, sub, userId, customerId);

        await db
          .prepare(
            "UPDATE users SET stripe_customer_id = ?, updated_at = datetime('now') WHERE id = ?"
          )
          .bind(customerId, userId)
          .run();

        await syncUserTier(db, userId);

        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer.id;

        const userId = await resolveUserId(db, sub.metadata?.userId, customerId);

        if (!userId) {
          console.error("No user found for subscription:", sub.id);
          break;
        }

        // Upsert rather than update-only: this event can arrive before the
        // checkout event that would have created the row.
        await upsertSubscription(db, sub, userId, customerId);
        await syncUserTier(db, userId);

        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer.id;

        await db
          .prepare(
            "UPDATE subscriptions SET status = 'canceled', updated_at = datetime('now') WHERE id = ?"
          )
          .bind(sub.id)
          .run();

        const userId = await resolveUserId(db, sub.metadata?.userId, customerId);
        if (userId) {
          await syncUserTier(db, userId);
        } else {
          console.error("No user found for deleted subscription:", sub.id);
        }

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const invoiceSub = (
          invoice as unknown as { subscription?: string | { id: string } }
        ).subscription;
        const subId =
          typeof invoiceSub === "string" ? invoiceSub : invoiceSub?.id;

        if (subId) {
          await db
            .prepare(
              "UPDATE subscriptions SET status = 'past_due', updated_at = datetime('now') WHERE id = ?"
            )
            .bind(subId)
            .run();
        }

        // `past_due` still grants access while Stripe retries the payment, but
        // resync so the tier always reflects the stored subscription rows.
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id ?? "";

        const userId = await resolveUserId(db, undefined, customerId);
        if (userId) await syncUserTier(db, userId);

        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
