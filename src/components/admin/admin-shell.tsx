"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Database,
  Flag,
  LayoutDashboard,
  Lock,
  Server,
  Tag,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  adminBadge,
  adminCard,
  adminMuted,
  adminNavActive,
  adminNavInactive,
  adminShell,
  adminSidebar,
  adminSubheading,
  adminHeading,
} from "@/lib/admin-styles";
import { cn } from "@/lib/utils";

const navItems: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Feature Flags", href: "/admin/flags", icon: Flag },
  { label: "Discount Codes", href: "/admin/codes", icon: Tag },
  { label: "Storage", href: "/admin/storage", icon: Database },
  { label: "System", href: "/admin/system", icon: Server },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className={cn("flex", adminShell)}>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden w-56 flex-col md:flex",
          adminSidebar,
        )}
      >
        <div className="flex h-14 items-center gap-2 border-b border-zinc-800 px-4">
          <div className="flex size-7 items-center justify-center rounded-md border border-zinc-700 bg-zinc-800">
            <Lock className="size-3.5 text-zinc-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-100">Base Admin</p>
            <p className="text-[10px] uppercase tracking-widest text-zinc-600">
              Restricted
            </p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 p-2">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                  isActive ? adminNavActive : adminNavInactive,
                )}
              >
                <Icon className="size-4 shrink-0 opacity-70" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-800 p-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-zinc-500 transition-colors hover:bg-zinc-800/60 hover:text-zinc-300"
          >
            ← Exit admin
          </Link>
        </div>
      </aside>

      <div className="min-h-screen flex-1 md:pl-56">
        <header className="hidden border-b border-zinc-800 bg-zinc-900/50 px-6 py-3 md:block">
          <div className="flex items-center justify-between">
            <span className={adminBadge}>Authorized session</span>
            <span className={cn("text-xs", adminMuted)}>
              Internal use only
            </span>
          </div>
        </header>
        <main className="p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}

export { adminHeading, adminSubheading, adminCard, adminMuted };
