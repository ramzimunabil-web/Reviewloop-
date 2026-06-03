import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  // Don't crash builds in environments without keys; fail loudly at call time instead.
  console.warn("[stripe] STRIPE_SECRET_KEY is not set.");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2024-10-28.acacia",
  typescript: true,
  appInfo: { name: "ReviewLoop", version: "1.0.0" },
});
