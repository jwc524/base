import { AdminFlagsPanel } from "@/components/admin/admin-flags-panel";
import { adminHeading, adminSubheading } from "@/lib/admin-styles";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminFlagsPage() {
  const flags = await prisma.featureFlag.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className={adminHeading}>Feature Flags</h1>
        <p className={adminSubheading}>
          Control rollout by user, account type, or globally.
        </p>
      </div>

      <AdminFlagsPanel initialFlags={flags} />
    </div>
  );
}
