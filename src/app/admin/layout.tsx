import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { Shield, ArrowLeft } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 font-display text-2xl">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-ember text-cream"><Shield size={18} /></span>
          Admin
        </div>
        <Link href="/dashboard" className="flex items-center gap-1 text-sm text-ink/60 hover:underline">
          <ArrowLeft size={16} /> Back to app
        </Link>
      </div>
      {children}
    </div>
  );
}
