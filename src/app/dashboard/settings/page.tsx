import { requireOrg } from "@/lib/session";
import { appUrl } from "@/lib/utils";
import SettingsClient from "./client";

export default async function SettingsPage() {
  const { org } = await requireOrg();
  return (
    <SettingsClient
      org={{
        name: org.name,
        slug: org.slug,
        googleReviewUrl: org.googleReviewUrl ?? "",
        brandColor: org.brandColor,
        messageTemplate: org.messageTemplate,
        plan: org.plan,
        subscriptionStatus: org.subscriptionStatus,
        hasStripeCustomer: !!org.stripeCustomerId,
        trialEndsAt: org.trialEndsAt ? org.trialEndsAt.toISOString() : null,
      }}
      sampleLink={appUrl(`/r/${org.slug}/preview`)}
    />
  );
}
