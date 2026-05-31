import { AdminCodesPanel } from "@/components/admin/admin-codes-panel";
import { adminHeading, adminSubheading } from "@/lib/admin-styles";
import { prisma } from "@/lib/prisma";

export default async function AdminCodesPage() {
  const codes = await prisma.discountCode.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className={adminHeading}>Discount Codes</h1>
        <p className={adminSubheading}>
          Generate and manage promotional codes.
        </p>
      </div>

      <AdminCodesPanel
        initialCodes={codes.map((code) => ({
          ...code,
          expiresAt: code.expiresAt?.toISOString() ?? null,
          createdAt: code.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
