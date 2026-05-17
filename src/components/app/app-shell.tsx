"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";
import {
  Calendar,
  LayoutDashboard,
  LogOut,
  Ticket,
  User,
  type LucideIcon,
} from "lucide-react";
import { AccountType } from "@/generated/prisma/enums";
import { AccountTypeBadge } from "@/components/app/account-type-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Shows", href: "/shows", icon: Ticket },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Profile", href: "/profile", icon: User },
];

type AppShellProps = {
  children: React.ReactNode;
  user: {
    name: string;
    accountType: AccountType;
    imageUrl: string | null;
  };
};

export function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname();
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-screen bg-[#080810]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-white/8 bg-white/3 md:flex">
        <div className="flex h-16 items-center px-6">
          <Link href="/dashboard" className="flex items-center gap-1">
            <span className="text-lg font-bold text-white">Base</span>
            <span className="size-1.5 rounded-full bg-indigo-500" />
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-indigo-500/15 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon
                  className={cn(
                    "size-5 shrink-0",
                    isActive ? "text-indigo-400" : "text-white/40",
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/8 p-4">
          <div className="flex items-center gap-3">
            <Avatar className="size-9 border border-white/10">
              {user.imageUrl ? (
                <AvatarImage src={user.imageUrl} alt={user.name} />
              ) : null}
              <AvatarFallback className="bg-indigo-500/30 text-xs text-indigo-100">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {user.name}
              </p>
              <AccountTypeBadge
                accountType={user.accountType}
                className="mt-1"
              />
            </div>
          </div>

          <SignOutButton redirectUrl="/">
            <button
              type="button"
              className="mt-4 flex w-full items-center gap-2 rounded-lg px-1 py-1.5 text-sm text-white/40 transition-colors hover:text-white"
            >
              <LogOut className="size-4 shrink-0" />
              Sign out
            </button>
          </SignOutButton>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col md:pl-60">
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">{children}</main>

        <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-around border-t border-white/8 bg-[#080810]/95 backdrop-blur-md md:hidden">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex size-12 items-center justify-center rounded-lg transition-colors",
                  isActive ? "text-indigo-400" : "text-white/40",
                )}
                aria-label={item.label}
              >
                <Icon className="size-5" />
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
