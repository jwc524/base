import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId, orgId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!orgId) {
    return NextResponse.json({ organization: null });
  }

  const organization = await prisma.organization.findUnique({
    where: { clerkOrgId: orgId },
    include: { bands: { orderBy: { name: "asc" } } },
  });

  return NextResponse.json({ organization });
}
