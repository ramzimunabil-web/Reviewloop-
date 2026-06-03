import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({ token: z.string(), rating: z.number().int().min(1).max(5), message: z.string().min(1).max(2000) });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { token, rating, message } = parsed.data;

  const request = await prisma.reviewRequest.findUnique({ where: { token } });
  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.$transaction([
    prisma.feedback.upsert({
      where: { requestId: request.id },
      create: { orgId: request.orgId, requestId: request.id, rating, message },
      update: { rating, message },
    }),
    prisma.reviewRequest.update({ where: { token }, data: { status: "FEEDBACK", rating } }),
  ]);

  return NextResponse.json({ ok: true });
}
