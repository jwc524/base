import { prisma } from "@/lib/prisma";
import type { ArrangementSummary, SetlistDetail } from "@/lib/setlist-types";

function toArrangementSummary(arrangement: {
  id: string;
  name: string;
  isDefault: boolean;
  rootNote: ArrangementSummary["rootNote"];
  accidental: ArrangementSummary["accidental"];
  tonality: ArrangementSummary["tonality"];
  bpm: number | null;
  timeSignature: string | null;
}): ArrangementSummary {
  return {
    id: arrangement.id,
    name: arrangement.name,
    isDefault: arrangement.isDefault,
    rootNote: arrangement.rootNote,
    accidental: arrangement.accidental,
    tonality: arrangement.tonality,
    bpm: arrangement.bpm,
    timeSignature: arrangement.timeSignature,
  };
}

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
              },
            },
          },
          arrangement: true,
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
        arrangements: cue.song.arrangements.map(toArrangementSummary),
      },
      arrangement: cue.arrangement
        ? toArrangementSummary(cue.arrangement)
        : null,
    })),
  };
}

export async function getNextCuePosition(setlistId: string) {
  const last = await prisma.cue.findFirst({
    where: { setlistId },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  return (last?.position ?? 0) + 1;
}
