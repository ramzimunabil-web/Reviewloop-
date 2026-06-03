import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/session";
import { hasAccess, requestsThisMonth } from "@/lib/billing";
import { PLANS } from "@/lib/plans";
import { sendEmail, reviewRequestEmail } from "@/lib/email";
import { appUrl } from "@/lib/utils";

const schema = z.object({ customerId: z.string() });

export async function POST(req: Request) {
  const { org } = await requireOrg();
  if (!hasAccess(org)) {
    return NextResponse.json({ error: "Your trial/subscription is inactive. Please choose a plan." }, { status: 402 });
  }

  // Enforce monthly plan limit
  const planKey = org.plan === "TRIAL" ? "PRO" : org.plan;
  const limit = PLANS[planKey as keyof typeof PLANS]?.requestLimit ?? 100;
  const used = await requestsThisMonth(org.id);
  if (used >= limit) {
    return NextResponse.json({ error: "Monthly request limit reached. Upgrade your plan." }, { status: 402 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const customer = await prisma.customer.findFirst({
    where: { id: parsed.data.customerId, orgId: org.id },
  });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  if (!customer.email) return NextResponse.json({ error: "This customer has no email (SMS coming soon)." }, { status: 400 });

  const request = await prisma.reviewRequest.create({
    data: { orgId: org.id, customerId: customer.id, channel: "EMAIL", status: "SENT", sentAt: new Date() },
  });

  const link = appUrl(`/r/${org.slug}/${request.token}`);
  const message = (org.messageTemplate || "Hi {{name}}, thanks for choosing {{business}}!")
    .replaceAll("{{name}}", customer.name)
    .replaceAll("{{business}}", org.name);

  try {
    await sendEmail({
      to: customer.email,
      subject: `${org.name}: how did we do?`,
      html: reviewRequestEmail({
        businessName: org.name,
        customerName: customer.name,
        link,
        brandColor: org.brandColor,
        message,
      }),
    });
  } catch (e) {
    console.error("email failed", e);
    // Keep the request row; surface a soft error.
    return NextResponse.json({ ok: true, warning: "Saved, but email delivery failed (check RESEND_API_KEY)." });
  }

  return NextResponse.json({ ok: true });
}
