import type { Accidental, RootNote, Tonality } from "@/generated/prisma/enums";

export type ArrangementSummary = {
  id: string;
  name: string;
  isDefault: boolean;
  rootNote: RootNote | null;
  accidental: Accidental | null;
  tonality: Tonality | null;
  bpm: number | null;
  timeSignature: string | null;
};

export type CueWithRelations = {
  id: string;
  position: number;
  notes: string | null;
  song: {
    id: string;
    title: string;
    artist: string | null;
    arrangements: ArrangementSummary[];
  };
  arrangement: ArrangementSummary | null;
};

export type SetlistDetail = {
  id: string;
  name: string;
  isPublic: boolean;
  shareToken: string;
  showId: string | null;
  show: {
    id: string;
    name: string;
    date: string;
  } | null;
  cues: CueWithRelations[];
};

export type SongSearchResult = {
  id: string;
  title: string;
  artist: string | null;
  defaultArrangementId: string | null;
};
