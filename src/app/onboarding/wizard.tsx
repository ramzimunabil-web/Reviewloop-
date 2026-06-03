"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

const STEPS = ["Business", "Google link", "Message", "Done"] as const;

export default function OnboardingWizard({ defaultName }: { defaultName: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState({
    businessName: defaultName,
    googleReviewUrl: "",
    messageTemplate: "Hi {{name}}, thanks for choosing {{business}}! Mind sharing how we did?",
  });

  function next() {
    setError("");
    if (step === 0 && !data.businessName.trim()) return setError("Please enter your business name.");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  const back = () => setStep((s) => Math.max(s - 1, 0));

  async function finish() {
    setSaving(true);
    setError("");
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    if (!res.ok) return setError("Could not save. Please try again.");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center px-5 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex items-center justify-center gap-2 font-display text-2xl">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-moss text-cream">
            <Star size={18} fill="currentColor" strokeWidth={0} />
          </span>
          ReviewLoop
        </div>

        {/* Progress */}
        <div className="mb-6 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-2">
              <div
                className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${
                  i <= step ? "bg-moss text-cream" : "bg-clay text-ink/40"
                }`}
              >
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 ${i < step ? "bg-moss" : "bg-clay"}`} />}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-line bg-cream/80 p-7 shadow-card">
          {step === 0 && (
            <>
              <h1 className="font-display text-2xl">What&apos;s your business called?</h1>
              <p className="mb-5 mt-1 text-sm text-ink/60">This appears on the review request your customers see.</p>
              <Label>Business name</Label>
              <Input
                autoFocus
                value={data.businessName}
                onChange={(e) => setData({ ...data, businessName: e.target.value })}
                placeholder="Maple Auto Repair"
              />
            </>
          )}

          {step === 1 && (
            <>
              <h1 className="font-display text-2xl">Where should happy customers go?</h1>
              <p className="mb-5 mt-1 text-sm text-ink/60">
                Paste your Google review link. (Search your business on Google → &quot;Ask for reviews&quot; → copy the
                short link.) You can add this later.
              </p>
              <Label>Google review URL</Label>
              <Input
                value={data.googleReviewUrl}
                onChange={(e) => setData({ ...data, googleReviewUrl: e.target.value })}
                placeholder="https://g.page/r/..."
              />
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="font-display text-2xl">Your request message</h1>
              <p className="mb-5 mt-1 text-sm text-ink/60">
                Use <code className="rounded bg-clay px-1">{"{{name}}"}</code> and{" "}
                <code className="rounded bg-clay px-1">{"{{business}}"}</code> as placeholders.
              </p>
              <Label>Message</Label>
              <textarea
                rows={4}
                value={data.messageTemplate}
                onChange={(e) => setData({ ...data, messageTemplate: e.target.value })}
                className="w-full rounded-xl border border-line bg-white/70 p-4 text-[15px] focus:border-moss focus:outline-none focus:ring-2 focus:ring-moss/20"
              />
            </>
          )}

          {step === 3 && (
            <div className="text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-moss/15 text-moss-dark">
                <Check size={28} />
              </div>
              <h1 className="mt-4 font-display text-2xl">You&apos;re all set!</h1>
              <p className="mx-auto mt-2 max-w-sm text-sm text-ink/60">
                Your 14-day free trial has started. Next: add your first customer and send a request.
              </p>
            </div>
          )}

          {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

          <div className="mt-7 flex items-center justify-between">
            {step > 0 && step < 3 ? (
              <Button variant="ghost" size="sm" onClick={back}>
                <ArrowLeft size={16} /> Back
              </Button>
            ) : (
              <span />
            )}
            {step < 3 ? (
              <Button onClick={next}>
                Continue <ArrowRight size={16} />
              </Button>
            ) : (
              <Button onClick={finish} disabled={saving} className="w-full">
                {saving ? "Setting up…" : "Go to dashboard"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
