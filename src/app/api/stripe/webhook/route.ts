import { NextRequest, NextResponse } from "next/server";
import { getCloudflareEnv } from "@/lib/d1-types";
import { getStripe } from "@/lib/stripe";
import type Stripe from "stripe";

export const runtime = "edge";

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

        const userId =
          session.metadata?.userId ||
          (
            await db
              .prepare("SELECT id FROM users WHERE stripe_customer_id = ?")
              .bind(customerId)
              .first<{ id: string }>()
          )?.id;

        if (!userId) {
          console.error("No user found for checkout session:", session.id);
          break;
        }

        // Fetch the full subscription to get price and period info
        const sub = await stripe.subscriptions.retrieve(subscriptionId);

        // Upsert subscription record
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
              sub.items.data[0]?.price.id ?? "",
              sub.status,
              new Date((sub.items.data[0]?.current_period_end ?? 0) * 1000).toISOString(),
              sub.cancel_at_period_end ? 1 : 0,
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
              sub.items.data[0]?.price.id ?? "",
              sub.status,
              new Date((sub.items.data[0]?.current_period_end ?? 0) * 1000).toISOString(),
              sub.cancel_at_period_end ? 1 : 0
            )
            .run();
        }

        await db
          .prepare(
            "UPDATE users SET tier = 'premium', stripe_customer_id = ?, updated_at = datetime('now') WHERE id = ?"
          )
          .bind(customerId, userId)
          .run();

        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer.id;

        await db
          .prepare(
            `UPDATE subscriptions SET status = ?, current_period_end = ?, cancel_at_period_end = ?, stripe_price_id = ?, updated_at = datetime('now')
             WHERE id = ?`
          )
          .bind(
            sub.status,
            new Date((sub.items.data[0]?.current_period_end ?? 0) * 1000).toISOString(),
            sub.cancel_at_period_end ? 1 : 0,
            sub.items.data[0]?.price.id ?? "",
            sub.id
          )
          .run();

        if (sub.status === "active") {
          await db
            .prepare(
              "UPDATE users SET tier = 'premium', updated_at = datetime('now') WHERE stripe_customer_id = ?"
            )
            .bind(customerId)
            .run();
        }

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

        await db
          .prepare(
            "UPDATE users SET tier = 'free', updated_at = datetime('now') WHERE stripe_customer_id = ?"
          )
          .bind(customerId)
          .run();

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription?.id;
        if (subId) {
          await db
            .prepare(
              "UPDATE subscriptions SET status = 'past_due', updated_at = datetime('now') WHERE id = ?"
            )
            .bind(subId)
            .run();
        }
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
