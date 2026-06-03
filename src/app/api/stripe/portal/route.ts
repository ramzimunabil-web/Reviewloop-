import { NextResponse } from "next/server";
import { requireOrg } from "@/lib/session";
import { stripe } from "@/lib/stripe";
import { appUrl } from "@/lib/utils";

export async function POST() {
  const { org } = await requireOrg();
  if (!org.stripeCustomerId) {
    return NextResponse.json({ error: "No billing account yet." }, { status: 400 });
  }
  const session = await stripe.billingPortal.sessions.create({
    customer: org.stripeCustomerId,
    return_url: appUrl("/dashboard/settings"),
  });
  return NextResponse.json({ url: session.url });
}
