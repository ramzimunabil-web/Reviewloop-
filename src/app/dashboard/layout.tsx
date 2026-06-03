import { requireOrg } from "@/lib/session";
import { isAdminEmail } from "@/lib/auth";
import { auth } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard-nav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireOrg();
  const session = await auth();
  const admin = isAdminEmail(session?.user?.email);
  return (
    <div className="md:flex">
      <DashboardNav isAdmin={admin} />
      <main className="min-h-screen flex-1 px-5 py-6 md:px-10 md:py-8">{children}</main>
    </div>
  );
}
