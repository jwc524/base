import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { AccountType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });

  if (!user) {
    redirect("/onboarding");
  }

  const accountLabel =
    user.accountType === AccountType.ARTIST ? "Artist" : "Musician";

  return (
    <div className="relative min-h-[calc(100vh-4rem)] px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-600/15 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-2xl">
        <div className="rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-md ring-1 ring-indigo-500/15">
          <p className="text-sm text-white/60">Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Welcome back, {user.name}
          </h1>
          <div className="mt-4">
            <Badge
              variant="outline"
              className="border-amber-500/30 bg-amber-500/10 text-amber-200"
            >
              {accountLabel}
            </Badge>
          </div>
          {user.location ? (
            <p className="mt-4 text-sm text-white/60">{user.location}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
