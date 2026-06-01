import { NextResponse } from "next/server";
import { Accidental, Tonality } from "@/generated/prisma/enums";
import { getApiUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

type CreateSongBody = {
  title?: string;
  artist?: string;
};

export async function GET(request: Request) {
  const owner = await getApiUser();
  if (!owner) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (!q) {
    return NextResponse.json({ songs: [] });
  }

  const songs = await prisma.song.findMany({
    where: {
      ownerId: owner.id,
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { artist: { contains: q, mode: "insensitive" } },
      ],
    },
    orderBy: { title: "asc" },
    take: 12,
    include: {
      arrangements: {
        where: { isDefault: true },
        select: { id: true },
        take: 1,
      },
    },
  });

  return NextResponse.json({
    songs: songs.map((song) => ({
      id: song.id,
      title: song.title,
      artist: song.artist,
      defaultArrangementId: song.arrangements[0]?.id ?? null,
    })),
  });
}

export async function POST(request: Request) {
  const owner = await getApiUser();
  if (!owner) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CreateSongBody;
  try {
    body = (await request.json()) as CreateSongBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const title = body.title?.trim();
  if (!title) {
    return NextResponse.json({ error: "Song title is required" }, { status: 400 });
  }

  try {
    const song = await prisma.song.create({
      data: {
        title,
        artist: body.artist?.trim() || null,
        ownerId: owner.id,
        arrangements: {
          create: {
            name: "Main",
            isDefault: true,
            accidental: Accidental.NATURAL,
            tonality: Tonality.MAJOR,
          },
        },
      },
      include: {
        arrangements: {
          where: { isDefault: true },
          select: { id: true },
          take: 1,
        },
      },
    });

    return NextResponse.json(
      {
        song: {
          id: song.id,
          title: song.title,
          artist: song.artist,
          defaultArrangementId: song.arrangements[0]?.id ?? null,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create song failed:", error);
    return NextResponse.json({ error: "Failed to create song" }, { status: 500 });
  }
}
