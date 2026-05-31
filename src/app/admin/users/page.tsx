import { AdminUsersTable } from "@/components/admin/admin-users-table";
import { adminHeading, adminSubheading } from "@/lib/admin-styles";
import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage() {
  const [users, flags] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        accountType: true,
        pricingTier: true,
        betaFeatures: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.featureFlag.findMany({
      select: { name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className={adminHeading}>Users</h1>
        <p className={adminSubheading}>
          Account metadata only — no user content is shown.
        </p>
      </div>

      <AdminUsersTable
        users={users.map((user) => ({
          ...user,
          createdAt: user.createdAt.toISOString(),
        }))}
        allFlagNames={flags.map((f) => f.name)}
      />
    </div>
  );
}
