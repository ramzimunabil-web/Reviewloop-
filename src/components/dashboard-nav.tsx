"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Star, LayoutDashboard, Users, Send, Settings, LogOut, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/requests", label: "Requests", icon: Send },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardNav({ isAdmin }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  return (
    <aside className="flex flex-col gap-1 md:h-screen md:w-60 md:border-r md:border-line md:p-4">
      <Link href="/dashboard" className="mb-4 hidden items-center gap-2 px-2 font-display text-xl md:flex">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-moss text-cream">
          <Star size={16} fill="currentColor" strokeWidth={0} />
        </span>
        ReviewLoop
      </Link>

      <nav className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active ? "bg-moss text-cream" : "text-ink/70 hover:bg-clay/70"
              )}
            >
              <l.icon size={18} /> {l.label}
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition",
              pathname.startsWith("/admin") ? "bg-ember text-cream" : "text-ember hover:bg-ember/10"
            )}
          >
            <Shield size={18} /> Admin
          </Link>
        )}
      </nav>

      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="mt-auto hidden items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink/60 hover:bg-clay/70 md:flex"
      >
        <LogOut size={18} /> Sign out
      </button>
    </aside>
  );
}
