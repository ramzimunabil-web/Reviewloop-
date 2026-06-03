// Single source of truth for pricing/plan limits. Mirror these in Stripe.
export type PlanId = "STARTER" | "PRO" | "GROWTH";

export interface PlanDef {
  id: PlanId;
  name: string;
  priceMonthly: number;
  blurb: string;
  requestLimit: number; // monthly review requests
  locations: number;
  features: string[];
  popular?: boolean;
  envPriceKey: "STRIPE_PRICE_STARTER" | "STRIPE_PRICE_PRO" | "STRIPE_PRICE_GROWTH";
}

export const PLANS: Record<PlanId, PlanDef> = {
  STARTER: {
    id: "STARTER",
    name: "Starter",
    priceMonthly: 29,
    blurb: "For solo operators getting started.",
    requestLimit: 100,
    locations: 1,
    envPriceKey: "STRIPE_PRICE_STARTER",
    features: ["1 location", "100 review requests / mo", "Email requests", "Basic dashboard"],
  },
  PRO: {
    id: "PRO",
    name: "Pro",
    priceMonthly: 79,
    blurb: "Everything a busy small shop needs.",
    requestLimit: 1000,
    locations: 1,
    popular: true,
    envPriceKey: "STRIPE_PRICE_PRO",
    features: [
      "1 location",
      "1,000 review requests / mo",
      "Email + SMS (SMS coming soon)",
      "Automated reminders",
      "Custom branding & QR code",
      "Full analytics",
    ],
  },
  GROWTH: {
    id: "GROWTH",
    name: "Growth",
    priceMonthly: 149,
    blurb: "For multi-location businesses.",
    requestLimit: 1000000,
    locations: 5,
    envPriceKey: "STRIPE_PRICE_GROWTH",
    features: ["Up to 5 locations", "Unlimited requests", "Team seats", "Google + Facebook", "API & webhooks"],
  },
};

export function priceIdFor(plan: PlanId): string {
  const key = PLANS[plan].envPriceKey;
  const id = process.env[key];
  if (!id) throw new Error(`Missing Stripe price env var: ${key}`);
  return id;
}

export function planFromPriceId(priceId: string): PlanId | null {
  if (priceId === process.env.STRIPE_PRICE_STARTER) return "STARTER";
  if (priceId === process.env.STRIPE_PRICE_PRO) return "PRO";
  if (priceId === process.env.STRIPE_PRICE_GROWTH) return "GROWTH";
  return null;
}
