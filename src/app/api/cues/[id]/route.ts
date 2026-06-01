import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { getSetlistDetail, verifyCueOwner } from "@/lib/setlist-queries";

type RouteParams = { params: Promise<{ id: string }> };

type PatchCueBody = {
  notes?: string | null;
  arrangementId?: string | null;
};

export async function PATCH(request: Request, { params }: RouteParams) {
  const owner = await getApiUser();
  if (!owner) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const cue = await verifyCueOwner(id, owner.id);
  if (!cue) {
    return NextResponse.json({ error: "Cue not found" }, { status: 404 });
  }

  let body: PatchCueBody;
  try {
    body = (await request.json()) as PatchCueBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.arrangementId) {
    const cueWithSong = await prisma.cue.findFirst({
      where: { id, setlist: { ownerId: owner.id } },
      select: { songId: true },
    });
    if (!cueWithSong) {
      return NextResponse.json({ error: "Cue not found" }, { status: 404 });
    }
    const arrangement = await prisma.arrangement.findFirst({
      where: { id: body.arrangementId, songId: cueWithSong.songId },
      select: { id: true },
    });
    if (!arrangement) {
      return NextResponse.json({ error: "Invalid arrangement" }, { status: 400 });
    }
  }

  try {
    await prisma.cue.update({
      where: { id },
      data: {
        ...(body.notes !== undefined ? { notes: body.notes?.trim() || null } : {}),
        ...(body.arrangementId !== undefined
          ? { arrangementId: body.arrangementId }
          : {}),
      },
    });

    const setlist = await getSetlistDetail(cue.setlistId, owner.id);
    return NextResponse.json({ setlist });
  } catch (error) {
    console.error("Update cue failed:", error);
    return NextResponse.json({ error: "Failed to update cue" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const owner = await getApiUser();
  if (!owner) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const cue = await verifyCueOwner(id, owner.id);
  if (!cue) {
    return NextResponse.json({ error: "Cue not found" }, { status: 404 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.cue.delete({ where: { id } });

      const remaining = await tx.cue.findMany({
        where: { setlistId: cue.setlistId },
        orderBy: { position: "asc" },
        select: { id: true },
      });

      for (let i = 0; i < remaining.length; i++) {
        await tx.cue.update({
          where: { id: remaining[i].id },
          data: { position: 10000 + i },
        });
      }

      for (let i = 0; i < remaining.length; i++) {
        await tx.cue.update({
          where: { id: remaining[i].id },
          data: { position: i + 1 },
        });
      }
    });

    const setlist = await getSetlistDetail(cue.setlistId, owner.id);
    return NextResponse.json({ setlist });
  } catch (error) {
    console.error("Delete cue failed:", error);
    return NextResponse.json({ error: "Failed to delete cue" }, { status: 500 });
  }
}
