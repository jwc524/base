import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type CreateBandBody = {
  name?: string;
};

export async function POST(request: Request) {
  const { userId, orgId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!orgId) {
    return NextResponse.json(
      { error: "Select an organization first" },
      { status: 400 },
    );
  }

  let body: CreateBandBody;
  try {
    body = (await request.json()) as CreateBandBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "Band name is required" }, { status: 400 });
  }

  const organization = await prisma.organization.findUnique({
    where: { clerkOrgId: orgId },
  });

  if (!organization) {
    return NextResponse.json(
      { error: "Organization not synced yet" },
      { status: 404 },
    );
  }

  try {
    const band = await prisma.band.create({
      data: {
        name,
        organizationId: organization.id,
      },
    });

    return NextResponse.json({ band }, { status: 201 });
  } catch (error) {
    console.error("Create band failed:", error);
    return NextResponse.json(
      { error: "Failed to create band" },
      { status: 500 },
    );
  }
}
