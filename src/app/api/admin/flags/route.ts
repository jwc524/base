import { NextResponse } from "next/server";
import { AccountType } from "@/generated/prisma/enums";
import { requireAdminApi } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

type CreateFlagBody = {
  name?: string;
  description?: string;
};

type UpdateFlagBody = {
  name?: string;
  description?: string;
  enabledForAll?: boolean;
  enabledUserIds?: string[];
  enabledAccountTypes?: AccountType[];
};

function isAccountType(value: unknown): value is AccountType {
  return value === AccountType.ARTIST || value === AccountType.MUSICIAN;
}

export async function GET() {
  const forbidden = await requireAdminApi();
  if (forbidden) return forbidden;

  const flags = await prisma.featureFlag.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ flags });
}

export async function POST(request: Request) {
  const forbidden = await requireAdminApi();
  if (forbidden) return forbidden;

  let body: CreateFlagBody;
  try {
    body = (await request.json()) as CreateFlagBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  try {
    const flag = await prisma.featureFlag.create({
      data: {
        name,
        description: body.description?.trim() || null,
      },
    });
    return NextResponse.json({ flag }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Flag with this name already exists" },
      { status: 409 },
    );
  }
}

export async function PATCH(request: Request) {
  const forbidden = await requireAdminApi();
  if (forbidden) return forbidden;

  let body: UpdateFlagBody & { id?: string };
  try {
    body = (await request.json()) as UpdateFlagBody & { id?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const id = body.id;
  if (!id) {
    return NextResponse.json({ error: "Flag id is required" }, { status: 400 });
  }

  if (
    body.enabledAccountTypes !== undefined &&
    (!Array.isArray(body.enabledAccountTypes) ||
      !body.enabledAccountTypes.every(isAccountType))
  ) {
    return NextResponse.json(
      { error: "Invalid enabledAccountTypes" },
      { status: 400 },
    );
  }

  if (
    body.enabledUserIds !== undefined &&
    !Array.isArray(body.enabledUserIds)
  ) {
    return NextResponse.json(
      { error: "enabledUserIds must be an array" },
      { status: 400 },
    );
  }

  try {
    const flag = await prisma.featureFlag.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name.trim() } : {}),
        ...(body.description !== undefined
          ? { description: body.description.trim() || null }
          : {}),
        ...(body.enabledForAll !== undefined
          ? { enabledForAll: body.enabledForAll }
          : {}),
        ...(body.enabledUserIds !== undefined
          ? { enabledUserIds: body.enabledUserIds }
          : {}),
        ...(body.enabledAccountTypes !== undefined
          ? { enabledAccountTypes: body.enabledAccountTypes }
          : {}),
      },
    });
    return NextResponse.json({ flag });
  } catch {
    return NextResponse.json({ error: "Flag not found" }, { status: 404 });
  }
}

export async function DELETE(request: Request) {
  const forbidden = await requireAdminApi();
  if (forbidden) return forbidden;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Flag id is required" }, { status: 400 });
  }

  try {
    await prisma.featureFlag.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Flag not found" }, { status: 404 });
  }
}
