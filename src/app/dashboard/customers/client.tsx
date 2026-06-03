"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Upload, Send, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardBody } from "@/components/ui/card";

type Row = { id: string; name: string; email: string | null; phone: string | null; _count: { requests: number } };

export default function CustomersClient({ customers }: { customers: Row[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  async function addCustomer(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setMsg({ type: "err", text: data.error || "Could not add customer." });
    setForm({ name: "", email: "", phone: "" });
    setMsg({ type: "ok", text: "Customer added." });
    router.refresh();
  }

  async function importCsv(file: File) {
    const text = await file.text();
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/customers/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv: text }),
    });
    setBusy(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setMsg({ type: "err", text: data.error || "Import failed." });
    setMsg({ type: "ok", text: `Imported ${data.imported} customers.` });
    router.refresh();
  }

  async function sendRequest(id: string) {
    setMsg(null);
    const res = await fetch("/api/requests/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId: id }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setMsg({ type: "err", text: data.error || "Could not send." });
    setSentIds((s) => new Set(s).add(id));
    setMsg({ type: "ok", text: data.warning || "Review request sent!" });
    router.refresh();
  }

  return (
    <div>
      <h1 className="font-display text-3xl">Customers</h1>
      <p className="mb-6 text-ink/60">Add customers and send them a review request.</p>

      {msg && (
        <div
          className={`mb-5 rounded-xl px-4 py-3 text-sm ${
            msg.type === "ok" ? "bg-moss/10 text-moss-dark" : "bg-red-50 text-red-700"
          }`}
        >
          {msg.text}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardBody>
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg">
              <UserPlus size={18} /> Add a customer
            </h2>
            <form onSubmit={addCustomer} className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@email.com" />
              </div>
              <div>
                <Label>Phone (optional)</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 555 123 4567" />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>Add customer</Button>
            </form>

            <div className="mt-5 border-t border-line pt-5">
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-white/50 px-4 py-3 text-sm text-ink/70 hover:bg-clay/40">
                <Upload size={16} /> Import CSV (name, email, phone)
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && importCsv(e.target.files[0])}
                />
              </label>
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardBody>
            <h2 className="mb-4 font-display text-lg">Your customers ({customers.length})</h2>
            {customers.length === 0 ? (
              <p className="rounded-xl bg-clay/40 px-4 py-10 text-center text-ink/60">
                No customers yet. Add one to get started.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-ink/50">
                    <tr className="border-b border-line">
                      <th className="pb-2 font-medium">Name</th>
                      <th className="pb-2 font-medium">Contact</th>
                      <th className="pb-2 font-medium">Requests</th>
                      <th className="pb-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {customers.map((c) => (
                      <tr key={c.id}>
                        <td className="py-3 font-medium">{c.name}</td>
                        <td className="py-3 text-ink/60">{c.email || c.phone || "—"}</td>
                        <td className="py-3 text-ink/60">{c._count.requests}</td>
                        <td className="py-3 text-right">
                          <Button
                            size="sm"
                            variant={sentIds.has(c.id) ? "secondary" : "primary"}
                            onClick={() => sendRequest(c.id)}
                            disabled={!c.email || sentIds.has(c.id)}
                          >
                            {sentIds.has(c.id) ? <><Check size={14} /> Sent</> : <><Send size={14} /> Request</>}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
