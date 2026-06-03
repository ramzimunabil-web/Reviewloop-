import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { slugify } from "@/lib/utils";

const schema = z.object({
  businessName: z.string().min(1).max(80),
  googleReviewUrl: z.string().url().optional().or(z.literal("")),
  messageTemplate: z.string().max(400).optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { businessName, googleReviewUrl, messageTemplate } = parsed.data;

  // If the user already has an org, just update it.
  const existing = await prisma.membership.findFirst({
    where: { userId: user.id },
    include: { organization: true },
  });

  // Ensure a unique slug.
  let base = slugify(businessName) || "biz";
  let slug = base;
  let n = 1;
  while (await prisma.organization.findUnique({ where: { slug } })) {
    slug = `${base}-${n++}`;
  }

  const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  if (existing) {
    const org = await prisma.organization.update({
      where: { id: existing.orgId },
      data: {
        name: businessName,
        googleReviewUrl: googleReviewUrl || null,
        messageTemplate: messageTemplate || undefined,
        onboardingComplete: true,
      },
    });
    return NextResponse.json({ ok: true, slug: org.slug });
  }

  const org = await prisma.organization.create({
    data: {
      name: businessName,
      slug,
      googleReviewUrl: googleReviewUrl || null,
      messageTemplate: messageTemplate || undefined,
      onboardingComplete: true,
      plan: "TRIAL",
      subscriptionStatus: "TRIALING",
      trialEndsAt,
      memberships: { create: { userId: user.id, role: "OWNER" } },
    },
  });

  return NextResponse.json({ ok: true, slug: org.slug });
}
