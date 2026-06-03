import { prisma } from "@/lib/prisma";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/lib/plans";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [orgs, totalCustomers, totalRequests, totalReviews] = await Promise.all([
    prisma.organization.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { customers: true, requests: true, memberships: true } } },
    }),
    prisma.customer.count(),
    prisma.reviewRequest.count(),
    prisma.reviewRequest.count({ where: { status: "REVIEWED" } }),
  ]);

  const priceOf: Record<string, number> = {
    STARTER: PLANS.STARTER.priceMonthly,
    PRO: PLANS.PRO.priceMonthly,
    GROWTH: PLANS.GROWTH.priceMonthly,
    TRIAL: 0,
  };
  const active = orgs.filter((o) => o.subscriptionStatus === "ACTIVE");
  const trialing = orgs.filter((o) => o.subscriptionStatus === "TRIALING");
  const mrr = active.reduce((sum, o) => sum + (priceOf[o.plan] ?? 0), 0);

  const kpis = [
    { label: "MRR", value: `$${mrr.toLocaleString()}` },
    { label: "Paying customers", value: active.length },
    { label: "Active trials", value: trialing.length },
    { label: "Total reviews driven", value: totalReviews },
  ];

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardBody className="p-5">
              <p className="font-display text-3xl font-semibold">{k.value}</p>
              <p className="text-sm text-ink/60">{k.label}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardBody>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl">All organizations ({orgs.length})</h2>
            <p className="text-sm text-ink/50">{totalCustomers} customers · {totalRequests} requests sent</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-ink/50">
                <tr className="border-b border-line">
                  <th className="pb-2 font-medium">Business</th>
                  <th className="pb-2 font-medium">Plan</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Customers</th>
                  <th className="pb-2 font-medium">Requests</th>
                  <th className="pb-2 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {orgs.map((o) => (
                  <tr key={o.id}>
                    <td className="py-3 font-medium">{o.name}<div className="text-xs text-ink/40">/{o.slug}</div></td>
                    <td className="py-3">{o.plan}</td>
                    <td className="py-3">
                      <Badge tone={o.subscriptionStatus === "ACTIVE" ? "moss" : o.subscriptionStatus === "TRIALING" ? "ember" : "red"}>
                        {o.subscriptionStatus}
                      </Badge>
                    </td>
                    <td className="py-3 text-ink/60">{o._count.customers}</td>
                    <td className="py-3 text-ink/60">{o._count.requests}</td>
                    <td className="py-3 text-ink/50">{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
