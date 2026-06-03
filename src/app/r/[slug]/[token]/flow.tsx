"use client";

import { useState } from "react";
import { Star, Check } from "lucide-react";

export default function ReviewFlow({
  token,
  businessName,
  customerName,
  brandColor,
  alreadyReviewed,
}: {
  token: string;
  businessName: string;
  customerName: string;
  brandColor: string;
  hasGoogleUrl: boolean;
  alreadyReviewed: boolean;
}) {
  const [stage, setStage] = useState<"rate" | "feedback" | "thanks" | "redirecting">(
    alreadyReviewed ? "thanks" : "rate"
  );
  const [hover, setHover] = useState(0);
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function choose(stars: number) {
    setRating(stars);
    setBusy(true);
    const res = await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, rating: stars }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (data.redirect) {
      setStage("redirecting");
      window.location.href = data.redirect;
    } else if (data.feedback) {
      setStage("feedback");
    } else {
      // happy but no Google URL configured yet
      setStage("thanks");
    }
  }

  async function submitFeedback(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await fetch("/api/review/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, rating, message }),
    });
    setBusy(false);
    setStage("thanks");
  }

  return (
    <main className="grid min-h-screen place-items-center px-5 py-10">
      <div className="w-full max-w-md rounded-3xl border border-line bg-cream p-8 text-center shadow-pop">
        <p className="font-display text-sm uppercase tracking-wide text-ink/50">{businessName}</p>

        {stage === "rate" && (
          <>
            <h1 className="mt-3 font-display text-3xl">
              Hi {customerName.split(" ")[0]}, how did we do?
            </h1>
            <p className="mt-2 text-ink/60">Tap a star to rate your experience.</p>
            <div className="mt-7 flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  disabled={busy}
                  onMouseEnter={() => setHover(s)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => choose(s)}
                  className="transition-transform hover:scale-110 active:scale-95"
                  aria-label={`${s} stars`}
                >
                  <Star
                    size={44}
                    style={{ color: brandColor }}
                    fill={(hover || rating) >= s ? brandColor : "transparent"}
                    strokeWidth={(hover || rating) >= s ? 0 : 1.5}
                  />
                </button>
              ))}
            </div>
          </>
        )}

        {stage === "feedback" && (
          <>
            <h1 className="mt-3 font-display text-2xl">We&apos;re sorry we missed the mark.</h1>
            <p className="mt-2 text-ink/60">
              Tell us what went wrong — it goes straight to the owner so we can make it right.
            </p>
            <form onSubmit={submitFeedback} className="mt-5 text-left">
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What could we have done better?"
                className="w-full rounded-xl border border-line bg-white/70 p-4 text-[15px] focus:border-moss focus:outline-none focus:ring-2 focus:ring-moss/20"
              />
              <button
                type="submit"
                disabled={busy}
                className="mt-3 w-full rounded-xl px-5 py-3 font-semibold text-white disabled:opacity-50"
                style={{ background: brandColor }}
              >
                {busy ? "Sending…" : "Send feedback"}
              </button>
            </form>
          </>
        )}

        {stage === "redirecting" && (
          <div className="py-8">
            <h1 className="font-display text-2xl">Thank you! ⭐</h1>
            <p className="mt-2 text-ink/60">Taking you to Google to share your review…</p>
          </div>
        )}

        {stage === "thanks" && (
          <div className="py-6">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-moss/15 text-moss-dark">
              <Check size={28} />
            </div>
            <h1 className="mt-4 font-display text-2xl">Thank you!</h1>
            <p className="mt-2 text-ink/60">We appreciate you taking the time.</p>
          </div>
        )}
      </div>
    </main>
  );
}
