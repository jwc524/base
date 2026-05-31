import { currentUser } from "@clerk/nextjs/server";
import { AppShell } from "@/components/app/app-shell";
import { isAdmin } from "@/lib/admin";
import { requireUser } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const clerkUser = await currentUser();
  const admin = await isAdmin();

  return (
    <AppShell
      user={{
        name: user.name,
        imageUrl: clerkUser?.imageUrl ?? user.photoUrl ?? null,
      }}
      isAdmin={admin}
    >
      {children}
    </AppShell>
  );
}
