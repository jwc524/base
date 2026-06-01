import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { getSetlistDetail, verifySetlistOwner } from "@/lib/setlist-queries";

export const dynamic = "force-dynamic";

type ReorderBody = {
  setlistId?: string;
  cueIds?: string[];
};

export async function PATCH(request: Request) {
  const owner = await getApiUser();
  if (!owner) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: ReorderBody;
  try {
    body = (await request.json()) as ReorderBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.setlistId || !body.cueIds?.length) {
    return NextResponse.json(
      { error: "Setlist ID and cue IDs are required" },
      { status: 400 },
    );
  }

  const setlist = await verifySetlistOwner(body.setlistId, owner.id);
  if (!setlist) {
    return NextResponse.json({ error: "Setlist not found" }, { status: 404 });
  }

  const existingCues = await prisma.cue.findMany({
    where: { setlistId: body.setlistId },
    select: { id: true },
  });

  if (existingCues.length !== body.cueIds.length) {
    return NextResponse.json({ error: "Invalid cue order" }, { status: 400 });
  }

  const existingIds = new Set(existingCues.map((c) => c.id));
  if (body.cueIds.some((id) => !existingIds.has(id))) {
    return NextResponse.json({ error: "Invalid cue order" }, { status: 400 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < body.cueIds!.length; i++) {
        await tx.cue.update({
          where: { id: body.cueIds![i] },
          data: { position: 10000 + i },
        });
      }

      for (let i = 0; i < body.cueIds!.length; i++) {
        await tx.cue.update({
          where: { id: body.cueIds![i] },
          data: { position: i + 1 },
        });
      }
    });

    const setlistDetail = await getSetlistDetail(body.setlistId, owner.id);
    return NextResponse.json({ setlist: setlistDetail });
  } catch (error) {
    console.error("Reorder cues failed:", error);
    return NextResponse.json({ error: "Failed to reorder cues" }, { status: 500 });
  }
}
