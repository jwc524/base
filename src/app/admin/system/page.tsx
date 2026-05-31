import { adminCard, adminHeading, adminMuted } from "@/lib/admin-styles";
import { cn } from "@/lib/utils";

export default function AdminSystemPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className={adminHeading}>System</h1>
      </div>

      <div className={cn(adminCard, "p-12 text-center")}>
        <p className={cn("text-lg", adminMuted)}>System monitoring coming soon</p>
        <p className="mx-auto mt-3 max-w-md text-sm text-zinc-600">
          This will show error logs once Sentry is integrated.
        </p>
      </div>
    </div>
  );
}
