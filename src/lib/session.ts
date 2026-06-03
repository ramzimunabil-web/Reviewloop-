import { redirect } from "next/navigation";
import { auth, isAdminEmail } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Returns the signed-in user record, or null. */
export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.email) return null;
  return prisma.user.findUnique({ where: { email: session.user.email } });
}

/** Returns the user's primary organization (membership), or null. */
export async function getCurrentOrg() {
  const user = await getCurrentUser();
  if (!user) return null;
  const membership = await prisma.membership.findFirst({
    where: { userId: user.id },
    include: { organization: true },
    orderBy: { createdAt: "asc" },
  });
  return membership?.organization ?? null;
}

/** Guard for app pages: ensures auth + org exist, otherwise redirects. */
export async function requireOrg() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const org = await getCurrentOrg();
  if (!org) redirect("/onboarding");
  return { user, org };
}

/** Guard for the platform admin area. */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  if (!isAdminEmail(session.user.email)) redirect("/dashboard");
  return session.user;
}
