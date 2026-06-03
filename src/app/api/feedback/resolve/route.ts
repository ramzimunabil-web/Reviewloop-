import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/session";

const schema = z.object({ id: z.string(), resolved: z.boolean().default(true) });

export async function POST(req: Request) {
  const { org } = await requireOrg();
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const fb = await prisma.feedback.findFirst({ where: { id: parsed.data.id, orgId: org.id } });
  if (!fb) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.feedback.update({ where: { id: fb.id }, data: { resolved: parsed.data.resolved } });
  return NextResponse.json({ ok: true });
}
