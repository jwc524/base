import { currentUser } from "@clerk/nextjs/server";
import { ProfileForm } from "./profile-form";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireUser();
  const clerkUser = await currentUser();

  return (
    <div className="p-6 md:p-8">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight text-white">
        Profile
      </h1>
      <ProfileForm
        user={{
          name: user.name,
          bio: user.bio,
          location: user.location,
          accountType: user.accountType,
          instruments: user.instruments,
          genres: user.genres,
        }}
        clerkImageUrl={clerkUser?.imageUrl ?? null}
      />
    </div>
  );
}
