import { prisma } from "@/lib/prisma";
import type { SetlistDetail } from "@/lib/setlist-types";

const arrangementSelect = {
  id: true,
  name: true,
  isDefault: true,
  rootNote: true,
  accidental: true,
  tonality: true,
  bpm: true,
  timeSignature: true,
} as const;

export async function getSetlistDetail(
  setlistId: string,
  ownerId: string,
): Promise<SetlistDetail | null> {
  const setlist = await prisma.setlist.findFirst({
    where: { id: setlistId, ownerId },
    include: {
      show: {
        select: { id: true, name: true, date: true },
      },
      cues: {
        orderBy: { position: "asc" },
        include: {
          song: {
            include: {
              arrangements: {
                orderBy: [{ isDefault: "desc" }, { name: "asc" }],
                select: arrangementSelect,
              },
            },
          },
          arrangement: {
            select: arrangementSelect,
          },
        },
      },
    },
  });

  if (!setlist) return null;

  return {
    id: setlist.id,
    name: setlist.name,
    isPublic: setlist.isPublic,
    shareToken: setlist.shareToken,
    showId: setlist.showId,
    show: setlist.show
      ? {
          id: setlist.show.id,
          name: setlist.show.name,
          date: setlist.show.date.toISOString(),
        }
      : null,
    cues: setlist.cues.map((cue) => ({
      id: cue.id,
      position: cue.position,
      notes: cue.notes,
      song: {
        id: cue.song.id,
        title: cue.song.title,
        artist: cue.song.artist,
        arrangements: cue.song.arrangements,
      },
      arrangement: cue.arrangement,
    })),
  };
}

export async function verifySetlistOwner(setlistId: string, ownerId: string) {
  return prisma.setlist.findFirst({
    where: { id: setlistId, ownerId },
    select: { id: true, showId: true },
  });
}

export async function verifyCueOwner(cueId: string, ownerId: string) {
  return prisma.cue.findFirst({
    where: { id: cueId, setlist: { ownerId } },
    select: { id: true, setlistId: true },
  });
}

export async function verifyShowOwner(showId: string, ownerId: string) {
  return prisma.show.findFirst({
    where: { id: showId, ownerId },
    select: { id: true },
  });
}

export async function getNextCuePosition(setlistId: string) {
  const last = await prisma.cue.findFirst({
    where: { setlistId },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  return (last?.position ?? 0) + 1;
}
