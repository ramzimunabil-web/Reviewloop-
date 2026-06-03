import { requireOrg } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import RequestsClient from "./client";

export default async function RequestsPage() {
  const { org } = await requireOrg();
  const [requests, feedback] = await Promise.all([
    prisma.reviewRequest.findMany({
      where: { orgId: org.id },
      include: { customer: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.feedback.findMany({
      where: { orgId: org.id },
      include: { request: { include: { customer: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <RequestsClient
      requests={requests.map((r) => ({
        id: r.id,
        name: r.customer.name,
        status: r.status,
        rating: r.rating,
        createdAt: r.createdAt.toISOString(),
      }))}
      feedback={feedback.map((f) => ({
        id: f.id,
        name: f.request.customer.name,
        rating: f.rating,
        message: f.message,
        resolved: f.resolved,
        createdAt: f.createdAt.toISOString(),
      }))}
    />
  );
}
