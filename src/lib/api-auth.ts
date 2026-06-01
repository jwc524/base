import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getApiUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  return prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });
}

export async function requireApiUser() {
  const user = await getApiUser();
  return user;
}
