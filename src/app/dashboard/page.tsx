import Link from "next/link";
import { Send, MousePointerClick, Star, MessageSquareWarning, ArrowRight } from "lucide-react";
import { requireOrg } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrialBanner } from "@/components/trial-banner";
import { formatDate } from "@/lib/utils";

export default async function DashboardOverview() {
  const { org } = await requireOrg();

  const [sent, opened, reviewed, feedbackCount, recent, openFeedback] = await Promise.all([
    prisma.reviewRequest.count({ where: { orgId: org.id, status: { in: ["SENT", "OPENED", "RATED", "REVIEWED", "FEEDBACK"] } } }),
    prisma.reviewRequest.count({ where: { orgId: org.id, status: { in: ["OPENED", "RATED", "REVIEWED", "FEEDBACK"] } } }),
    prisma.reviewRequest.count({ where: { orgId: org.id, status: "REVIEWED" } }),
    prisma.reviewRequest.count({ where: { orgId: org.id, status: "FEEDBACK" } }),
    prisma.reviewRequest.findMany({
      where: { orgId: org.id },
      include: { customer: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.feedback.findMany({
      where: { orgId: org.id, resolved: false },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  const openRate = sent ? Math.round((opened / sent) * 100) : 0;
  const conversion = sent ? Math.round((reviewed / sent) * 100) : 0;

  const stats = [
    { label: "Requests sent", value: sent, icon: Send, tone: "moss" as const },
    { label: "Open rate", value: `${openRate}%`, icon: MousePointerClick, tone: "ember" as const },
    { label: "New reviews", value: reviewed, icon: Star, tone: "moss" as const },
    { label: "Private feedback", value: feedbackCount, icon: MessageSquareWarning, tone: "gray" as const },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Welcome back 👋</h1>
          <p className="text-ink/60">Here&apos;s how {org.name} is doing.</p>
        </div>
        <Link href="/dashboard/customers">
          <Button>Send a review request <ArrowRight size={16} /></Button>
        </Link>
      </div>

      <TrialBanner org={org} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardBody className="p-5">
              <div className="mb-3 inline-grid h-10 w-10 place-items-center rounded-xl bg-moss/10 text-moss-dark">
                <s.icon size={20} />
              </div>
              <p className="font-display text-3xl font-semibold">{s.value}</p>
              <p className="text-sm text-ink/60">{s.label}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Funnel */}
        <Card className="lg:col-span-2">
          <CardBody>
            <h2 className="font-display text-xl">Your review funnel</h2>
            <p className="mb-5 text-sm text-ink/60">{conversion}% of requests turn into a public review.</p>
            <FunnelBar label="Sent" value={sent} max={sent} tone="bg-moss" />
            <FunnelBar label="Opened" value={opened} max={sent} tone="bg-moss-light" />
            <FunnelBar label="Public reviews" value={reviewed} max={sent} tone="bg-ember" />
            <FunnelBar label="Private feedback" value={feedbackCount} max={sent} tone="bg-clay" />
          </CardBody>
        </Card>

        {/* Feedback inbox */}
        <Card>
          <CardBody>
            <h2 className="font-display text-xl">Needs attention</h2>
            <p className="mb-4 text-sm text-ink/60">Unhappy customers caught before going public.</p>
            {openFeedback.length === 0 ? (
              <p className="rounded-xl bg-clay/40 px-4 py-6 text-center text-sm text-ink/50">
                Nothing to resolve. Nice work. 🎉
              </p>
            ) : (
              <ul className="space-y-3">
                {openFeedback.map((f) => (
                  <li key={f.id} className="rounded-xl border border-line bg-white/60 p-3">
                    <div className="flex items-center justify-between">
                      <Badge tone="red">{f.rating} ★</Badge>
                      <span className="text-xs text-ink/40">{formatDate(f.createdAt)}</span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-ink/70">{f.message}</p>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/dashboard/requests" className="mt-4 block text-sm font-semibold text-moss-dark hover:underline">
              View all feedback →
            </Link>
          </CardBody>
        </Card>
      </div>

      {/* Recent activity */}
      <Card className="mt-6">
        <CardBody>
          <h2 className="mb-4 font-display text-xl">Recent requests</h2>
          {recent.length === 0 ? (
            <div className="rounded-xl bg-clay/40 px-4 py-10 text-center">
              <p className="text-ink/60">No requests yet.</p>
              <Link href="/dashboard/customers" className="mt-3 inline-block">
                <Button size="sm">Add your first customer</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-line">
              {recent.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{r.customer.name}</p>
                    <p className="text-xs text-ink/50">{formatDate(r.createdAt)}</p>
                  </div>
                  <StatusBadge status={r.status} rating={r.rating} />
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function FunnelBar({ label, value, max, tone }: { label: string; value: number; max: number; tone: string }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="mb-3">
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-ink/70">{label}</span>
        <span className="font-semibold">{value}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-clay/60">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.max(pct, value ? 4 : 0)}%` }} />
      </div>
    </div>
  );
}

function StatusBadge({ status, rating }: { status: string; rating: number | null }) {
  const map: Record<string, { tone: any; label: string }> = {
    PENDING: { tone: "gray", label: "Queued" },
    SENT: { tone: "gray", label: "Sent" },
    OPENED: { tone: "ember", label: "Opened" },
    RATED: { tone: "ember", label: `Rated ${rating ?? ""}★` },
    REVIEWED: { tone: "moss", label: "Reviewed ⭐" },
    FEEDBACK: { tone: "red", label: `Feedback ${rating ?? ""}★` },
  };
  const m = map[status] ?? map.SENT;
  return <Badge tone={m.tone}>{m.label}</Badge>;
}
