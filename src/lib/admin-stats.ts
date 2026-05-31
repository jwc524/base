import "server-only";

import { AccountType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export async function getAdminStats() {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const ninetyDaysAgo = new Date(now);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const [
    totalUsers,
    musiciansCount,
    artistsCount,
    newSignupsThisWeek,
    activeUsers,
    totalShows,
    totalSetlists,
    signupRows,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { accountType: AccountType.MUSICIAN } }),
    prisma.user.count({ where: { accountType: AccountType.ARTIST } }),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.user.count({ where: { updatedAt: { gte: thirtyDaysAgo } } }),
    prisma.show.count(),
    prisma.setlist.count(),
    prisma.user.findMany({
      where: { createdAt: { gte: ninetyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const signupsByDay = new Map<string, number>();
  for (let i = 89; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    signupsByDay.set(d.toISOString().slice(0, 10), 0);
  }
  for (const row of signupRows) {
    const key = row.createdAt.toISOString().slice(0, 10);
    if (signupsByDay.has(key)) {
      signupsByDay.set(key, (signupsByDay.get(key) ?? 0) + 1);
    }
  }

  const signupChart = Array.from(signupsByDay.entries()).map(
    ([date, count]) => ({
      date,
      signups: count,
    }),
  );

  return {
    totalUsers,
    musiciansCount,
    artistsCount,
    newSignupsThisWeek,
    activeUsers,
    totalShows,
    totalSetlists,
    signupChart,
  };
}
