"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setLoading(false);
      return setError(data.error || "Could not create account.");
    }
    // Auto sign-in, then go to onboarding wizard
    await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    router.push("/onboarding");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center px-5 py-10">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 font-display text-2xl">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-moss text-cream">
            <Star size={18} fill="currentColor" strokeWidth={0} />
          </span>
          ReviewLoop
        </Link>
        <div className="rounded-2xl border border-line bg-cream/80 p-7 shadow-card">
          <h1 className="font-display text-2xl">Start your free trial</h1>
          <p className="mb-6 mt-1 text-sm text-ink/60">14 days free. No card required.</p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label>Your name</Label>
              <Input required value={form.name} onChange={set("name")} placeholder="Jordan Smith" />
            </div>
            <div>
              <Label>Work email</Label>
              <Input type="email" required value={form.email} onChange={set("email")} placeholder="you@business.com" />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" required value={form.password} onChange={set("password")} placeholder="At least 8 characters" />
            </div>
            {error && <p className="text-sm text-red-700">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>
        </div>
        <p className="mt-5 text-center text-sm text-ink/60">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-moss-dark underline-offset-2 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
