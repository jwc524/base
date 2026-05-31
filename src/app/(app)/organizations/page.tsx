import { OrganizationsTest } from "./organizations-test";

export default function OrganizationsPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Organizations
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Test Clerk Organizations synced to Postgres via{" "}
          <code className="text-white/40">clerkOrgId</code>.
        </p>
      </div>
      <OrganizationsTest />
    </div>
  );
}
