import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({ token: z.string(), rating: z.number().int().min(1).max(5) });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { token, rating } = parsed.data;

  const request = await prisma.reviewRequest.findUnique({
    where: { token },
    include: { organization: true },
  });
  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isHappy = rating >= 4;
  await prisma.reviewRequest.update({
    where: { token },
    data: {
      rating,
      ratedAt: new Date(),
      status: isHappy ? "REVIEWED" : "RATED",
      openedAt: request.openedAt ?? new Date(),
    },
  });

  if (isHappy) {
    return NextResponse.json({ redirect: request.organization.googleReviewUrl || null });
  }
  return NextResponse.json({ feedback: true });
}
