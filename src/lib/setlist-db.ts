import { prisma } from "@/lib/prisma";
import type { ArrangementSummary, SetlistDetail } from "@/lib/setlist-types";

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

export function serializeArrangement(
  arrangement: {
    id: string;
    name: string;
    isDefault: boolean;
    rootNote: ArrangementSummary["rootNote"];
    accidental: ArrangementSummary["accidental"];
    tonality: ArrangementSummary["tonality"];
    bpm: number | null;
    timeSignature: string | null;
  } | null,
): ArrangementSummary | null {
  if (!arrangement) return null;
  return arrangement;
}

export async function getOwnedSetlist(setlistId: string, ownerId: string) {
  return prisma.setlist.findFirst({
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
                select: arrangementSelect,
                orderBy: [{ isDefault: "desc" }, { name: "asc" }],
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
}

export function serializeSetlist(
  setlist: NonNullable<Awaited<ReturnType<typeof getOwnedSetlist>>>,
): SetlistDetail {
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
      arrangement: serializeArrangement(cue.arrangement),
    })),
  };
}

export async function verifyShowOwner(showId: string, ownerId: string) {
  return prisma.show.findFirst({
    where: { id: showId, ownerId },
    select: { id: true },
  });
}

export async function verifyCueOwner(cueId: string, ownerId: string) {
  return prisma.cue.findFirst({
    where: {
      id: cueId,
      setlist: { ownerId },
    },
    include: {
      setlist: { select: { id: true } },
    },
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
