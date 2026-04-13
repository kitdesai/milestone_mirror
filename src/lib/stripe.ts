import Stripe from "stripe";

export function getStripe(secretKey: string): Stripe {
  return new Stripe(secretKey, {
    apiVersion: "2026-03-25.dahlia",
    httpClient: Stripe.createFetchHttpClient(),
  });
}
