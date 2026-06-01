import { adminCard, adminHeading, adminMuted } from "@/lib/admin-styles";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function AdminStoragePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className={adminHeading}>Storage</h1>
      </div>

      <div className={cn(adminCard, "p-12 text-center")}>
        <p className={cn("text-lg", adminMuted)}>Storage analytics coming soon</p>
        <p className="mx-auto mt-3 max-w-md text-sm text-zinc-600">
          This will track S3 usage once file uploads are built.
        </p>
      </div>
    </div>
  );
}
