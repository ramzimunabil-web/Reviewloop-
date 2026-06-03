import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/session";

const schema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),
});

export async function POST(req: Request) {
  const { org } = await requireOrg();
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Name and a valid email are required." }, { status: 400 });
  const { name, email, phone } = parsed.data;
  if (!email && !phone) return NextResponse.json({ error: "Add an email or phone." }, { status: 400 });

  const customer = await prisma.customer.create({
    data: { orgId: org.id, name, email: email || null, phone: phone || null },
  });
  return NextResponse.json({ ok: true, customer });
}
