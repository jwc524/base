import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function requireUser() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });

  if (!user) {
    redirect("/onboarding");
  }

  return user;
}

export async function getAuthUser() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  return prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });
}
