import { prisma } from "@/lib/prisma";
import type { Organization } from "@prisma/client";

/** Has this org got an active paid or trialing subscription? */
export function hasAccess(org: Organization): boolean {
  if (org.subscriptionStatus === "ACTIVE") return true;
  if (org.subscriptionStatus === "TRIALING") {
    return !org.trialEndsAt || org.trialEndsAt.getTime() > Date.now();
  }
  return false;
}

/** Count review requests sent this calendar month (for plan limits). */
export async function requestsThisMonth(orgId: string): Promise<number> {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  return prisma.reviewRequest.count({ where: { orgId, createdAt: { gte: start } } });
}
