import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { verifyShowOwner } from "@/lib/setlist-queries";

export const dynamic = "force-dynamic";

type CreateSetlistBody = {
  name?: string;
  showId?: string;
};

export async function POST(request: Request) {
  const owner = await getApiUser();
  if (!owner) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CreateSetlistBody;
  try {
    body = (await request.json()) as CreateSetlistBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "Setlist name is required" }, { status: 400 });
  }

  if (!body.showId) {
    return NextResponse.json({ error: "Show ID is required" }, { status: 400 });
  }

  const show = await verifyShowOwner(body.showId, owner.id);
  if (!show) {
    return NextResponse.json({ error: "Show not found" }, { status: 404 });
  }

  try {
    const setlist = await prisma.setlist.create({
      data: {
        name,
        showId: body.showId,
        ownerId: owner.id,
      },
      select: { id: true, name: true, showId: true },
    });

    return NextResponse.json({ setlist }, { status: 201 });
  } catch (error) {
    console.error("Create setlist failed:", error);
    return NextResponse.json({ error: "Failed to create setlist" }, { status: 500 });
  }
}
