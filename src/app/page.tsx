import Link from "next/link";
import { Star, ArrowRight, Check, MessageSquareHeart, Send, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLANS } from "@/lib/plans";

function Stars() {
  return (
    <div className="flex gap-0.5 text-ember-light">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={16} fill="currentColor" strokeWidth={0} />
      ))}
    </div>
  );
}

export default function Landing() {
  return (
    <main className="mx-auto max-w-6xl px-5">
      {/* Nav */}
      <nav className="flex items-center justify-between py-6">
        <Link href="/" className="flex items-center gap-2 font-display text-2xl font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-moss text-cream">
            <Star size={18} fill="currentColor" strokeWidth={0} />
          </span>
          ReviewLoop
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Start free trial</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="grid gap-10 py-12 md:grid-cols-2 md:py-20">
        <div className="animate-fade-up">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-white/60 px-3 py-1 text-sm text-ink/70">
            <Stars /> Loved by local businesses
          </div>
          <h1 className="font-display text-5xl font-semibold leading-[1.05] md:text-6xl">
            More 5-star reviews, <span className="text-moss">on autopilot.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-ink/70">
            ReviewLoop asks your happy customers for a Google review at exactly the right moment — so your rating
            climbs and the phone keeps ringing. Set up in 5 minutes. No demo required.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/register">
              <Button size="lg">
                Start your 14-day free trial <ArrowRight size={18} />
              </Button>
            </Link>
            <span className="text-sm text-ink/50">No credit card needed</span>
          </div>
        </div>

        {/* Visual: phone review card */}
        <div className="relative animate-fade-up [animation-delay:120ms]">
          <div className="absolute -inset-4 -rotate-3 rounded-3xl bg-moss/10" />
          <div className="relative mx-auto max-w-sm rounded-3xl border border-line bg-cream p-6 shadow-pop">
            <p className="font-display text-xl">How was your visit to <strong>Maple Auto?</strong></p>
            <div className="my-5 flex justify-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={34} className="text-ember-light" fill="currentColor" strokeWidth={0} />
              ))}
            </div>
            <div className="rounded-xl bg-moss px-4 py-3 text-center font-semibold text-cream">
              Leave a Google review →
            </div>
            <p className="mt-4 text-center text-xs text-ink/50">+1 review · rating now 4.9 ★</p>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="rounded-3xl border border-line bg-white/50 p-8 md:p-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-ember">The problem</p>
        <h2 className="mt-2 max-w-3xl font-display text-3xl font-semibold md:text-4xl">
          Your happiest customers leave without ever being asked.
        </h2>
        <p className="mt-4 max-w-2xl text-ink/70">
          90% of people read reviews before choosing a local business, and Google ranks the shops with more recent
          reviews higher. But asking is awkward, easy to forget, and rarely happens at the moment it matters most —
          right after a great job. ReviewLoop makes the ask automatic.
        </p>
      </section>

      {/* How it works */}
      <section className="py-16">
        <h2 className="text-center font-display text-3xl font-semibold md:text-4xl">Three steps. That&apos;s it.</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { icon: Send, title: "Add a customer", body: "Type a name + email, or upload a CSV after a job is done." },
            { icon: MessageSquareHeart, title: "We ask for them", body: "A branded request routes happy customers straight to Google, and catches unhappy ones privately first." },
            { icon: TrendingUp, title: "Watch it climb", body: "Track requests, clicks, and new reviews from one simple dashboard." },
          ].map((s, i) => (
            <div key={s.title} className="rounded-2xl border border-line bg-cream p-6 animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-moss/12 text-moss-dark">
                <s.icon size={22} />
              </div>
              <h3 className="mt-4 font-display text-xl">{s.title}</h3>
              <p className="mt-2 text-sm text-ink/70">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-12">
        <h2 className="text-center font-display text-3xl font-semibold md:text-4xl">Simple, honest pricing</h2>
        <p className="mt-2 text-center text-ink/60">14 days free. Cancel anytime.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {Object.values(PLANS).map((p) => (
            <div
              key={p.id}
              className={`relative rounded-2xl border bg-cream p-7 ${
                p.popular ? "border-moss shadow-pop" : "border-line"
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-moss px-3 py-1 text-xs font-bold text-cream">
                  Most popular
                </span>
              )}
              <h3 className="font-display text-2xl">{p.name}</h3>
              <p className="mt-1 text-sm text-ink/60">{p.blurb}</p>
              <p className="mt-4 font-display text-4xl font-semibold">
                ${p.priceMonthly}
                <span className="text-base font-normal text-ink/50">/mo</span>
              </p>
              <ul className="mt-5 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check size={16} className="mt-0.5 shrink-0 text-moss" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="mt-6 block">
                <Button variant={p.popular ? "primary" : "secondary"} className="w-full">
                  Start free trial
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="my-12 rounded-3xl bg-moss px-8 py-14 text-center text-cream">
        <h2 className="font-display text-3xl font-semibold md:text-4xl">Start collecting reviews today.</h2>
        <p className="mx-auto mt-3 max-w-md text-cream/80">Five minutes to set up. Your competitors are already asking.</p>
        <Link href="/register" className="mt-7 inline-block">
          <Button variant="secondary" size="lg">Get started free <ArrowRight size={18} /></Button>
        </Link>
      </section>

      <footer className="flex flex-col items-center justify-between gap-3 border-t border-line py-8 text-sm text-ink/50 md:flex-row">
        <span>© {new Date().getFullYear()} ReviewLoop</span>
        <span>Built for local businesses that deserve more 5-star reviews.</span>
      </footer>
    </main>
  );
}
