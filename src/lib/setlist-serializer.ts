import { prisma } from "@/lib/prisma";
import type { ArrangementSummary, CueWithRelations, SetlistDetail } from "@/lib/setlist-types";

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

function serializeArrangement(
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

export function serializeCue(
  cue: {
    id: string;
    position: number;
    notes: string | null;
    song: {
      id: string;
      title: string;
      artist: string | null;
      arrangements: Array<{
        id: string;
        name: string;
        isDefault: boolean;
        rootNote: ArrangementSummary["rootNote"];
        accidental: ArrangementSummary["accidental"];
        tonality: ArrangementSummary["tonality"];
        bpm: number | null;
        timeSignature: string | null;
      }>;
    };
    arrangement: {
      id: string;
      name: string;
      isDefault: boolean;
      rootNote: ArrangementSummary["rootNote"];
      accidental: ArrangementSummary["accidental"];
      tonality: ArrangementSummary["tonality"];
      bpm: number | null;
      timeSignature: string | null;
    } | null;
  },
): CueWithRelations {
  return {
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
  };
}

export function serializeSetlist(
  setlist: {
    id: string;
    name: string;
    isPublic: boolean;
    shareToken: string;
    showId: string | null;
    show: { id: string; name: string; date: Date } | null;
    cues: Array<Parameters<typeof serializeCue>[0]>;
  },
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
    cues: setlist.cues.map(serializeCue),
  };
}

export const setlistInclude = {
  show: {
    select: { id: true, name: true, date: true },
  },
  cues: {
    orderBy: { position: "asc" as const },
    include: {
      song: {
        include: {
          arrangements: {
            select: arrangementSelect,
            orderBy: [{ isDefault: "desc" as const }, { name: "asc" as const }],
          },
        },
      },
      arrangement: {
        select: arrangementSelect,
      },
    },
  },
};

export async function getOwnedSetlist(setlistId: string, ownerId: string) {
  return prisma.setlist.findFirst({
    where: { id: setlistId, ownerId },
    include: setlistInclude,
  });
}

export async function getOwnedCue(cueId: string, ownerId: string) {
  return prisma.cue.findFirst({
    where: {
      id: cueId,
      setlist: { ownerId },
    },
    include: {
      setlist: { select: { id: true, ownerId: true } },
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
