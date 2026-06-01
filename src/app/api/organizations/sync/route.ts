import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncOrganization } from "@/lib/syncOrganization";

export const dynamic = "force-dynamic";

type SyncBody = {
  id?: string;
  name?: string;
};

export async function POST(request: Request) {
  const { userId, orgId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: SyncBody;
  try {
    body = (await request.json()) as SyncBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const clerkOrgId = body.id?.trim();
  const name = body.name?.trim();

  if (!clerkOrgId || !name) {
    return NextResponse.json(
      { error: "Organization id and name are required" },
      { status: 400 },
    );
  }

  if (orgId && orgId !== clerkOrgId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const synced = await syncOrganization({ id: clerkOrgId, name });

    const organization = await prisma.organization.findUnique({
      where: { id: synced.id },
      include: { bands: { orderBy: { name: "asc" } } },
    });

    return NextResponse.json({ organization });
  } catch (error) {
    console.error("Organization sync failed:", error);
    return NextResponse.json(
      { error: "Failed to sync organization" },
      { status: 500 },
    );
  }
}
