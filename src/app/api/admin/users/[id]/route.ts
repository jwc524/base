import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

type UpdateUserBody = {
  pricingTier?: string;
  betaFeatures?: string[];
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const forbidden = await requireAdminApi();
  if (forbidden) return forbidden;

  const { id } = await params;

  let body: UpdateUserBody;
  try {
    body = (await request.json()) as UpdateUserBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const data: UpdateUserBody = {};
  if (body.pricingTier !== undefined) {
    data.pricingTier = body.pricingTier;
  }
  if (body.betaFeatures !== undefined) {
    if (!Array.isArray(body.betaFeatures)) {
      return NextResponse.json(
        { error: "betaFeatures must be an array" },
        { status: 400 },
      );
    }
    data.betaFeatures = body.betaFeatures;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        accountType: true,
        pricingTier: true,
        betaFeatures: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
}
