import { SignupsChart } from "@/components/admin/signups-chart";
import { getAdminStats } from "@/lib/admin-stats";
import {
  adminCard,
  adminHeading,
  adminMuted,
  adminSubheading,
  adminText,
} from "@/lib/admin-styles";
import { cn } from "@/lib/utils";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className={cn(adminCard, "p-5")}>
      <p className={cn("text-sm", adminMuted)}>{label}</p>
      <p className={cn("mt-2 text-3xl font-semibold tabular-nums", adminText)}>
        {value.toLocaleString()}
      </p>
    </div>
  );
}

export default async function AdminOverviewPage() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className={adminHeading}>Overview</h1>
        <p className={adminSubheading}>Platform metrics at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total users" value={stats.totalUsers} />
        <StatCard label="Musicians" value={stats.musiciansCount} />
        <StatCard label="Artists" value={stats.artistsCount} />
        <StatCard label="New this week" value={stats.newSignupsThisWeek} />
        <StatCard label="Active (30 days)" value={stats.activeUsers} />
        <StatCard label="Total shows" value={stats.totalShows} />
        <StatCard label="Total setlists" value={stats.totalSetlists} />
      </div>

      <SignupsChart data={stats.signupChart} />
    </div>
  );
}
