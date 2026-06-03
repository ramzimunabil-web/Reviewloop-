# ReviewLoop

**Automated Google review collection for local service businesses.**

ReviewLoop helps plumbers, dentists, auto shops, salons, and contractors turn happy
customers into 5-star Google reviews — and catch unhappy ones privately before they
post. You add a customer, we send a branded request, and a one-tap star rating routes
4–5★ intent straight to your Google review page while 1–3★ intent goes to a private
feedback form. More reviews → higher map-pack ranking → more calls.

This repository is a complete, production-ready MVP: marketing site, authentication,
multi-tenant workspaces, onboarding, dashboard with analytics, the public review flow,
Stripe subscriptions with a free trial, transactional email, and a platform admin
dashboard.

---

## Table of contents

1. [Tech stack](#tech-stack)
2. [Project structure](#project-structure)
3. [Local setup](#local-setup)
4. [Environment variables](#environment-variables)
5. [Database](#database)
6. [Stripe setup](#stripe-setup)
7. [Email setup](#email-setup)
8. [Running locally](#running-locally)
9. [Deployment (Vercel)](#deployment-vercel)
10. [Data model](#data-model)
11. [How the review flow works](#how-the-review-flow-works)
12. [Admin dashboard](#admin-dashboard)
13. [Getting your first 10 paying customers](#getting-your-first-10-paying-customers)
14. [Roadmap / fast-follows](#roadmap--fast-follows)

---

## Tech stack

- **Next.js 14** (App Router) + **TypeScript** — one deployable app for marketing,
  product, and API routes.
- **Tailwind CSS** — custom warm editorial theme (cream / moss / ember / clay),
  Fraunces + Hanken Grotesk fonts.
- **Prisma + PostgreSQL** — type-safe data layer; works with Neon, Supabase, Railway.
- **Auth.js (NextAuth v5)** — email/password + magic-link sign-in, JWT sessions.
- **Stripe** — subscription checkout, customer portal, webhooks, 14-day free trial.
- **Resend** — transactional + review-request email (logs to console in dev).

Everything runs on a single Vercel deployment plus a managed Postgres database.

---

## Project structure

```
reviewloop/
├── prisma/
│   ├── schema.prisma         # Data model (users, orgs, customers, requests, feedback)
│   └── seed.ts               # Demo org + sample data
├── src/
│   ├── app/
│   │   ├── page.tsx          # Marketing landing page
│   │   ├── login/ register/  # Auth pages
│   │   ├── onboarding/       # 4-step setup wizard
│   │   ├── dashboard/        # Product: home, customers, requests, settings
│   │   ├── admin/            # Platform admin (all orgs, MRR, trials)
│   │   ├── r/[slug]/[token]/ # Public mobile review page (star router)
│   │   └── api/              # Route handlers (auth, customers, requests,
│   │       │                 #   review, stripe, settings, onboarding)
│   │       └── stripe/       # checkout, portal, webhook
│   ├── components/           # Nav, banners, UI primitives (button/card/input/badge)
│   ├── lib/                  # prisma, auth, stripe, email, plans, billing, session
│   ├── middleware.ts         # Protects /dashboard, /onboarding, /admin
│   └── types.d.ts            # Session type augmentation
├── .env.example
├── tailwind.config.ts
├── next.config.js
└── package.json
```

---

## Local setup

**Prerequisites:** Node.js 18.18+ (Node 20 LTS recommended), a PostgreSQL database,
and accounts at [Stripe](https://stripe.com) and [Resend](https://resend.com) (both
have free tiers). Optionally the [Stripe CLI](https://stripe.com/docs/stripe-cli) for
local webhook testing.

```bash
# 1. Install dependencies
npm install

# 2. Create your env file and fill it in (see next section)
cp .env.example .env

# 3. Push the schema to your database and seed demo data
npm run db:push
npm run db:seed

# 4. Start the dev server
npm run dev
```

Open <http://localhost:3000>. Sign in with the seeded demo account:

- **Email:** `demo@reviewloop.app` (or the first address in `ADMIN_EMAILS`)
- **Password:** `password123`

---

## Environment variables

Copy `.env.example` to `.env` and set each value:

| Variable | What it is |
| --- | --- |
| `DATABASE_URL` | Postgres connection string. |
| `AUTH_SECRET` | Random secret for Auth.js. Generate with `openssl rand -base64 32`. |
| `NEXTAUTH_URL` | Full base URL, no trailing slash (`http://localhost:3000` in dev). |
| `NEXT_PUBLIC_APP_URL` | Same base URL; used to build public review links. |
| `STRIPE_SECRET_KEY` | `sk_test_…` (test) or `sk_live_…` (production). |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` from the Stripe CLI or dashboard webhook. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_…` / `pk_live_…`. |
| `STRIPE_PRICE_STARTER` | Price ID for the $29/mo plan. |
| `STRIPE_PRICE_PRO` | Price ID for the $79/mo plan. |
| `STRIPE_PRICE_GROWTH` | Price ID for the $149/mo plan. |
| `RESEND_API_KEY` | `re_…` API key. |
| `EMAIL_FROM` | Verified sender, e.g. `ReviewLoop <hello@yourdomain.com>`. |
| `ADMIN_EMAILS` | Comma-separated emails allowed into `/admin`. |

> In development, if `RESEND_API_KEY` is unset, emails are printed to the server
> console instead of being sent — so you can grab review links without a mailbox.

---

## Database

The schema lives in `prisma/schema.prisma`. Common commands:

```bash
npm run db:push      # Sync schema to the DB without migrations (fast, for dev)
npm run db:migrate   # Create a versioned migration (use for production history)
npm run db:seed      # Insert the demo org + sample customers/requests
npm run db:studio    # Open Prisma Studio to browse data
```

For production, prefer `prisma migrate deploy` against your committed migrations.
Managed Postgres options that work out of the box: **Neon** (serverless, great with
Vercel), **Supabase**, or **Railway**.

---

## Stripe setup

1. In the Stripe Dashboard, create **three recurring monthly products/prices**:
   Starter ($29), Pro ($79), Growth ($149). Copy each **price ID** (`price_…`) into
   `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_GROWTH`.
2. Grab your **secret** and **publishable** keys into the matching env vars.
3. **Webhooks:**
   - *Local:* run `npm run stripe:listen`. The CLI prints a `whsec_…` — put it in
     `STRIPE_WEBHOOK_SECRET`.
   - *Production:* in Dashboard → Developers → Webhooks, add an endpoint at
     `https://yourdomain.com/api/stripe/webhook` and subscribe to
     `checkout.session.completed`, `customer.subscription.created`,
     `customer.subscription.updated`, `customer.subscription.deleted`, and
     `invoice.payment_failed`. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
4. The trial is 14 days with **no card required up front** — Checkout carries the
   remaining trial days, and the webhook keeps each org's `plan` and
   `subscriptionStatus` in sync.

---

## Email setup

1. Create a [Resend](https://resend.com) account and verify a sending domain.
2. Set `RESEND_API_KEY` and an `EMAIL_FROM` that uses the verified domain.
3. Review-request and magic-link emails send through `src/lib/email.ts`.

---

## Running locally

```bash
npm run dev          # http://localhost:3000
npm run stripe:listen  # in a second terminal, to receive webhooks
```

Typical first run: sign in with the demo account → explore the dashboard → add a
customer → send a request → open the printed `/r/{slug}/{token}` link in your phone
or a new tab to walk the public star-rating flow.

---

## Deployment (Vercel)

1. Push this repo to GitHub/GitLab.
2. In **Vercel**, "Import Project" and select the repo. Framework preset: **Next.js**.
3. Provision Postgres (Neon integration is one click) and copy the connection string.
4. Add **all** environment variables from the table above in Vercel → Settings →
   Environment Variables. Set `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your real
   domain (e.g. `https://reviewloop.app`).
5. The build runs `prisma generate && next build` automatically. After the first
   deploy, run migrations against production:
   ```bash
   # locally, with production DATABASE_URL exported:
   npx prisma migrate deploy
   ```
   (Or use `prisma db push` for the very first schema sync.)
6. Add the **production Stripe webhook** pointing at
   `https://yourdomain.com/api/stripe/webhook` and update `STRIPE_WEBHOOK_SECRET`.
7. Point your domain at Vercel and switch Stripe + Resend to live keys when ready.

That's the whole stack: one Vercel project, one Postgres database, Stripe, Resend.

---

## Data model

- **User / Account / Session / VerificationToken** — Auth.js tables (credentials +
  magic link).
- **Organization** — one per business: slug, `googleReviewUrl`, brand color, message
  template, `plan`, `subscriptionStatus`, Stripe IDs, `trialEndsAt`,
  `currentPeriodEnd`, `onboardingComplete`.
- **Membership** — links users to organizations with a `Role` (owner/admin/member).
- **Customer** — a contact (name, email, phone) belonging to an org.
- **ReviewRequest** — a sent request with a unique `token`, a `status`
  (PENDING → SENT → OPENED → REVIEWED/FEEDBACK), and the captured `rating`.
- **Feedback** — private message captured from a 1–3★ response, with a resolved flag.

Plans and limits are defined in `src/lib/plans.ts`; access/usage checks live in
`src/lib/billing.ts`.

---

## How the review flow works

1. You add a customer and click **Send request** (or import a CSV and send in bulk).
2. ReviewLoop emails a short, branded message with a unique link:
   `/r/{org-slug}/{token}`.
3. The customer taps a star rating on a fast, mobile-first page.
4. **4–5★** → marked `REVIEWED` and redirected straight to your Google review URL,
   where leaving the review is one tap.
5. **1–3★** → routed to a **private feedback form**. You see it in the dashboard
   inbox and can make it right before it ever becomes public.

This is compliant "ask everyone, make public reviewing easy" — you request feedback
from every customer rather than hiding negatives.

---

## Admin dashboard

Users whose email is listed in `ADMIN_EMAILS` get a link to `/admin`, a platform
overview showing **MRR** (active orgs × plan price), paying customers, active trials,
total reviews collected, and a table of every organization with its plan and status.
Protected by `requireAdmin()` in `src/lib/session.ts` and the middleware.

---

## Getting your first 10 paying customers

ReviewLoop sells to local owner-operators, so the first 10 come from **founder-led,
high-touch sales — not ads.** Concrete playbook:

1. **Start with your own network (1–3 customers).** Every founder knows a few local
   business owners — a dentist, a mechanic, a landscaper, a hairdresser. Offer to set
   them up personally for free and ask them to actually pay after the trial if it
   works. Real businesses paying real money beats free pilots.

2. **Win on time-to-value, in person.** Show up (or screen-share), do the 5-minute
   setup *for* them, paste their Google review link, import 20 past customers from
   their phone/CRM, and send the first batch of requests while you're there. Owners
   who watch a 5★ review land during the meeting convert.

3. **Mine "almost-reviewers."** Most local businesses have happy customers who never
   left a review. Pull recent invoices/appointments and send requests to the last
   30–50 customers. A visible jump from, say, 18 to 31 Google reviews in a week is
   your entire sales pitch.

4. **Cold outreach with proof, tightly targeted.** Search Google Maps for businesses
   in one category + city (e.g. "auto repair Austin") that have few or stale reviews.
   Email/DM the owner a 3-line message: their current review count, what one
   competitor has, and "I can get you there in 30 days — 14-day free trial, I'll set
   it up." Personalization (their real numbers) is what gets replies.

5. **Walk in.** For trades and main-street businesses, in-person beats email. Bring a
   one-pager, offer free setup, leave a QR code that opens their review page. Ten
   doors a day in a small radius converts faster than any funnel at this stage.

6. **Partner with people who already serve these owners.** Web designers, local
   marketing agencies, POS/booking-software resellers, and bookkeepers all have books
   of local-business clients. Offer a referral cut or a co-branded setup. One good
   partner can deliver several of your first ten.

7. **Use a no-card 14-day trial as the close.** Lower the barrier to "just try it."
   Then make the value undeniable during the trial by sending real requests and
   surfacing the new reviews — so the paywall conversion is a formality.

8. **Charge from day one and stay hands-on.** Don't over-discount. At $29–$79/mo the
   ROI is one extra job, so price isn't the objection — trust is. Personally onboard
   each of the first ten, ask what's confusing, and fix it the same week. Their
   testimonials and before/after review counts become the case studies that get you
   from 10 to 100.

**Where to focus the energy:** one industry, one metro, ruthless follow-up. Ten
paying local businesses in a single niche/city gives you referenceable proof, word of
mouth, and a repeatable script — far more valuable than ten scattered logos.

---

## Roadmap / fast-follows

The MVP intentionally ships lean. The schema and UI already anticipate:

- **SMS requests** via Twilio (phone field + request channel are modeled).
- **Drip scheduling** and automatic reminders for non-responders.
- **Multi-platform** (Facebook, Yelp) and **multiple locations** per org.
- **Team seats** (membership roles exist) and white-label branding.
- **Zapier / API** for syncing customers from existing tools.

---

Built as a complete, deployable starting point — clone it, set your keys, ship it.
