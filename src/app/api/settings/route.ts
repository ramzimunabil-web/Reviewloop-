import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/session";

const schema = z.object({
  name: z.string().min(1).max(80),
  googleReviewUrl: z.string().url().optional().or(z.literal("")),
  brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  messageTemplate: z.string().max(400).optional(),
});

export async function POST(req: Request) {
  const { org } = await requireOrg();
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { name, googleReviewUrl, brandColor, messageTemplate } = parsed.data;
  await prisma.organization.update({
    where: { id: org.id },
    data: {
      name,
      googleReviewUrl: googleReviewUrl || null,
      brandColor: brandColor || undefined,
      messageTemplate: messageTemplate || undefined,
    },
  });
  return NextResponse.json({ ok: true });
}
