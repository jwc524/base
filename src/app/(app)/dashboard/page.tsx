import { AccountTypeBadge } from "@/components/app/account-type-badge";
import { requireUser } from "@/lib/auth";
import { glassCard } from "@/lib/styles";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <div className="p-6 md:p-8">
      <div className={cn(glassCard, "max-w-2xl p-8")}>
        <p className="text-sm text-white/60">Dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
          Welcome back, {user.name}
        </h1>
        <div className="mt-4">
          <AccountTypeBadge accountType={user.accountType} />
        </div>
        {user.location ? (
          <p className="mt-4 text-sm text-white/60">{user.location}</p>
        ) : null}
      </div>
    </div>
  );
}
