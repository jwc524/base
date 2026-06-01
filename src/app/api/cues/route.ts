import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import {
  getNextCuePosition,
  getSetlistDetail,
  verifySetlistOwner,
} from "@/lib/setlist-queries";

export const dynamic = "force-dynamic";

type CreateCueBody = {
  setlistId?: string;
  songId?: string;
  arrangementId?: string;
};

export async function POST(request: Request) {
  const owner = await getApiUser();
  if (!owner) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CreateCueBody;
  try {
    body = (await request.json()) as CreateCueBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.setlistId || !body.songId) {
    return NextResponse.json(
      { error: "Setlist ID and song ID are required" },
      { status: 400 },
    );
  }

  const setlist = await verifySetlistOwner(body.setlistId, owner.id);
  if (!setlist) {
    return NextResponse.json({ error: "Setlist not found" }, { status: 404 });
  }

  const song = await prisma.song.findFirst({
    where: { id: body.songId, ownerId: owner.id },
    include: {
      arrangements: {
        orderBy: [{ isDefault: "desc" }, { name: "asc" }],
      },
    },
  });

  if (!song) {
    return NextResponse.json({ error: "Song not found" }, { status: 404 });
  }

  let arrangementId = body.arrangementId ?? null;
  if (arrangementId) {
    const valid = song.arrangements.some((a) => a.id === arrangementId);
    if (!valid) {
      return NextResponse.json({ error: "Invalid arrangement" }, { status: 400 });
    }
  } else {
    arrangementId =
      song.arrangements.find((a) => a.isDefault)?.id ??
      song.arrangements[0]?.id ??
      null;
  }

  try {
    const position = await getNextCuePosition(body.setlistId);

    await prisma.cue.create({
      data: {
        setlistId: body.setlistId,
        songId: body.songId,
        arrangementId,
        position,
      },
    });

    const setlistDetail = await getSetlistDetail(body.setlistId, owner.id);
    return NextResponse.json({ setlist: setlistDetail }, { status: 201 });
  } catch (error) {
    console.error("Create cue failed:", error);
    return NextResponse.json({ error: "Failed to add cue" }, { status: 500 });
  }
}
