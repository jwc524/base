import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { getSetlistDetail } from "@/lib/setlist-queries";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

type PatchSetlistBody = {
  name?: string;
  isPublic?: boolean;
};

export async function GET(_request: Request, { params }: RouteParams) {
  const owner = await getApiUser();
  if (!owner) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const setlist = await getSetlistDetail(id, owner.id);

  if (!setlist) {
    return NextResponse.json({ error: "Setlist not found" }, { status: 404 });
  }

  return NextResponse.json({ setlist });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const owner = await getApiUser();
  if (!owner) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: PatchSetlistBody;
  try {
    body = (await request.json()) as PatchSetlistBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const existing = await prisma.setlist.findFirst({
    where: { id, ownerId: owner.id },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Setlist not found" }, { status: 404 });
  }

  const name = body.name?.trim();
  if (body.name !== undefined && !name) {
    return NextResponse.json({ error: "Setlist name is required" }, { status: 400 });
  }

  try {
    const setlist = await prisma.setlist.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(body.isPublic !== undefined ? { isPublic: body.isPublic } : {}),
      },
      select: { id: true, name: true, isPublic: true, shareToken: true },
    });

    return NextResponse.json({ setlist });
  } catch (error) {
    console.error("Update setlist failed:", error);
    return NextResponse.json({ error: "Failed to update setlist" }, { status: 500 });
  }
}
