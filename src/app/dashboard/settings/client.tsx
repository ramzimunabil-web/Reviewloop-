"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/lib/plans";

type Org = {
  name: string; slug: string; googleReviewUrl: string; brandColor: string; messageTemplate: string;
  plan: string; subscriptionStatus: string; hasStripeCustomer: boolean; trialEndsAt: string | null;
};

export default function SettingsClient({ org, sampleLink }: { org: Org; sampleLink: string }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: org.name,
    googleReviewUrl: org.googleReviewUrl,
    brandColor: org.brandColor,
    messageTemplate: org.messageTemplate,
  });
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setSaved(false);
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    if (res.ok) { setSaved(true); router.refresh(); }
  }

  async function checkout(plan: string) {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  async function manageBilling() {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  const active = org.subscriptionStatus === "ACTIVE";

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl">Settings</h1>
      <p className="mb-6 text-ink/60">Configure your business and manage billing.</p>

      {/* Business settings */}
      <Card className="mb-6">
        <CardBody>
          <h2 className="mb-4 font-display text-xl">Business</h2>
          <form onSubmit={save} className="space-y-4">
            <div>
              <Label>Business name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Google review URL</Label>
              <Input
                value={form.googleReviewUrl}
                onChange={(e) => setForm({ ...form, googleReviewUrl: e.target.value })}
                placeholder="https://g.page/r/..."
              />
              <p className="mt-1 text-xs text-ink/50">Where 4–5 star customers are sent.</p>
            </div>
            <div className="flex items-center gap-3">
              <div>
                <Label>Brand color</Label>
                <input
                  type="color"
                  value={form.brandColor}
                  onChange={(e) => setForm({ ...form, brandColor: e.target.value })}
                  className="h-11 w-16 cursor-pointer rounded-xl border border-line bg-white"
                />
              </div>
            </div>
            <div>
              <Label>Request message</Label>
              <textarea
                rows={3}
                value={form.messageTemplate}
                onChange={(e) => setForm({ ...form, messageTemplate: e.target.value })}
                className="w-full rounded-xl border border-line bg-white/70 p-4 text-[15px] focus:border-moss focus:outline-none focus:ring-2 focus:ring-moss/20"
              />
              <p className="mt-1 text-xs text-ink/50">Placeholders: {"{{name}}"}, {"{{business}}"}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save changes"}</Button>
              {saved && <span className="text-sm text-moss-dark">Saved ✓</span>}
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Billing */}
      <Card id="billing">
        <CardBody>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl">Billing</h2>
            <Badge tone={active ? "moss" : org.subscriptionStatus === "TRIALING" ? "ember" : "red"}>
              {org.plan} · {org.subscriptionStatus}
            </Badge>
          </div>

          {active || org.hasStripeCustomer ? (
            <div className="rounded-xl bg-clay/40 p-5">
              <p className="text-sm text-ink/70">
                {active ? "Your subscription is active." : "Manage your plan, payment method, and invoices."}
              </p>
              <Button className="mt-3" onClick={manageBilling}>Manage subscription</Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              {Object.values(PLANS).map((p) => (
                <div key={p.id} className={`rounded-xl border p-4 ${p.popular ? "border-moss" : "border-line"}`}>
                  <p className="font-display text-lg">{p.name}</p>
                  <p className="font-display text-2xl font-semibold">${p.priceMonthly}<span className="text-sm font-normal text-ink/50">/mo</span></p>
                  <Button
                    className="mt-3 w-full"
                    size="sm"
                    variant={p.popular ? "primary" : "secondary"}
                    onClick={() => checkout(p.id)}
                  >
                    Choose {p.name}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
