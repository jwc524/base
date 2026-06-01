import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { OnboardingForm } from "./onboarding-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/");
  }

  const existingUser = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });

  if (existingUser) {
    redirect("/dashboard");
  }

  return <OnboardingForm />;
}
