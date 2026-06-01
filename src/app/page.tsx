import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    const user = await getAuthUser();
    redirect(user ? "/dashboard" : "/onboarding");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      <div className="relative text-center">
        <h1 className="flex items-center justify-center gap-1 text-4xl font-bold text-white">
          Base
          <span className="size-2 rounded-full bg-indigo-500" />
        </h1>
        <p className="mt-4 max-w-md text-white/60">
          Setlists, charts, and gigs for working musicians.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Show when="signed-out">
            <SignInButton>
              <button className="rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton>
              <button className="rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-400">
                Get started
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Link
              href="/dashboard"
              className="rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-400"
            >
              Go to dashboard
            </Link>
          </Show>
        </div>
      </div>
    </div>
  );
}
