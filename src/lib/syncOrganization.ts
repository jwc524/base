import "server-only";

import type { Organization } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type ClerkOrganizationInput = {
  id: string;
  name: string;
};

export async function syncOrganization(
  clerkOrg: ClerkOrganizationInput,
): Promise<Organization> {
  const clerkOrgId = clerkOrg.id.trim();
  const name = clerkOrg.name.trim();

  if (!clerkOrgId) {
    throw new Error("Clerk organization id is required");
  }

  if (!name) {
    throw new Error("Clerk organization name is required");
  }

  return prisma.organization.upsert({
    where: { clerkOrgId },
    create: { clerkOrgId, name },
    update: { name },
  });
}
