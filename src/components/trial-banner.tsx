import Link from "next/link";
import type { Organization } from "@prisma/client";

export function TrialBanner({ org }: { org: Organization }) {
  if (org.subscriptionStatus === "ACTIVE") return null;

  if (org.subscriptionStatus === "TRIALING" && org.trialEndsAt) {
    const days = Math.max(0, Math.ceil((org.trialEndsAt.getTime() - Date.now()) / 86400000));
    return (
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ember/30 bg-ember/10 px-4 py-3 text-sm">
        <span>
          <strong>{days} day{days === 1 ? "" : "s"} left</strong> in your free trial. Add a plan to keep your reviews
          flowing.
        </span>
        <Link href="/dashboard/settings#billing" className="font-semibold text-ember underline-offset-2 hover:underline">
          Choose a plan →
        </Link>
      </div>
    );
  }

  if (org.subscriptionStatus === "PAST_DUE" || org.subscriptionStatus === "CANCELED") {
    return (
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        <span>Your subscription is inactive. Reactivate to keep sending review requests.</span>
        <Link href="/dashboard/settings#billing" className="font-semibold underline">Reactivate →</Link>
      </div>
    );
  }
  return null;
}
