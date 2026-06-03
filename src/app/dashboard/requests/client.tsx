"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

type Req = { id: string; name: string; status: string; rating: number | null; createdAt: string };
type FB = { id: string; name: string; rating: number; message: string; resolved: boolean; createdAt: string };

const statusMap: Record<string, { tone: any; label: string }> = {
  PENDING: { tone: "gray", label: "Queued" },
  SENT: { tone: "gray", label: "Sent" },
  OPENED: { tone: "ember", label: "Opened" },
  RATED: { tone: "ember", label: "Rated" },
  REVIEWED: { tone: "moss", label: "Public review ⭐" },
  FEEDBACK: { tone: "red", label: "Private feedback" },
};

export default function RequestsClient({ requests, feedback }: { requests: Req[]; feedback: FB[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<"all" | "feedback">("all");

  async function resolve(id: string, resolved: boolean) {
    await fetch("/api/feedback/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, resolved }),
    });
    router.refresh();
  }

  return (
    <div>
      <h1 className="font-display text-3xl">Requests</h1>
      <p className="mb-6 text-ink/60">Track every request and respond to private feedback.</p>

      <div className="mb-5 inline-flex rounded-xl border border-line bg-white/50 p-1">
        {(["all", "feedback"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold capitalize transition ${
              tab === t ? "bg-moss text-cream" : "text-ink/60"
            }`}
          >
            {t === "all" ? "All requests" : `Feedback (${feedback.filter((f) => !f.resolved).length})`}
          </button>
        ))}
      </div>

      {tab === "all" ? (
        <Card>
          <CardBody>
            {requests.length === 0 ? (
              <p className="py-10 text-center text-ink/50">No requests yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-ink/50">
                    <tr className="border-b border-line">
                      <th className="pb-2 font-medium">Customer</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 font-medium">Sent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {requests.map((r) => {
                      const m = statusMap[r.status] ?? statusMap.SENT;
                      return (
                        <tr key={r.id}>
                          <td className="py-3 font-medium">{r.name}</td>
                          <td className="py-3">
                            <Badge tone={m.tone}>{m.label}{r.rating ? ` · ${r.rating}★` : ""}</Badge>
                          </td>
                          <td className="py-3 text-ink/50">{formatDate(r.createdAt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4">
          {feedback.length === 0 ? (
            <Card><CardBody><p className="py-8 text-center text-ink/50">No private feedback yet.</p></CardBody></Card>
          ) : (
            feedback.map((f) => (
              <Card key={f.id} className={f.resolved ? "opacity-60" : ""}>
                <CardBody className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Badge tone="red">{f.rating} ★</Badge>
                      <span className="font-medium">{f.name}</span>
                      <span className="text-xs text-ink/40">{formatDate(f.createdAt)}</span>
                    </div>
                    <p className="mt-2 text-ink/80">{f.message}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={f.resolved ? "secondary" : "primary"}
                    onClick={() => resolve(f.id, !f.resolved)}
                  >
                    {f.resolved ? "Reopen" : <><Check size={14} /> Mark resolved</>}
                  </Button>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
