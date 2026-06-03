import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/session";
import { stripe } from "@/lib/stripe";
import { priceIdFor } from "@/lib/plans";
import { appUrl } from "@/lib/utils";

const schema = z.object({ plan: z.enum(["STARTER", "PRO", "GROWTH"]) });

export async function POST(req: Request) {
  const { org, user } = await requireOrg();
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  // Reuse or create a Stripe customer
  let customerId = org.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: org.name,
      metadata: { orgId: org.id },
    });
    customerId = customer.id;
    await prisma.organization.update({ where: { id: org.id }, data: { stripeCustomerId: customerId } });
  }

  // Remaining trial days carry over into the subscription
  const trialDays =
    org.trialEndsAt && org.trialEndsAt.getTime() > Date.now()
      ? Math.ceil((org.trialEndsAt.getTime() - Date.now()) / 86400000)
      : undefined;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceIdFor(parsed.data.plan), quantity: 1 }],
    subscription_data: trialDays ? { trial_period_days: trialDays } : undefined,
    allow_promotion_codes: true,
    success_url: appUrl("/dashboard/settings?billing=success"),
    cancel_url: appUrl("/dashboard/settings?billing=cancel"),
    metadata: { orgId: org.id, plan: parsed.data.plan },
  });

  return NextResponse.json({ url: session.url });
}
