import type { Accidental, RootNote, Tonality } from "@/generated/prisma/enums";

type KeyFields = {
  rootNote: RootNote | null;
  accidental: Accidental | null;
  tonality: Tonality | null;
};

const TONALITY_LABELS: Record<Tonality, string> = {
  MAJOR: "Major",
  MINOR: "Minor",
  DORIAN: "Dorian",
  MIXOLYDIAN: "Mixolydian",
  LYDIAN: "Lydian",
  PHRYGIAN: "Phrygian",
  LOCRIAN: "Locrian",
};

export function formatKey({ rootNote, accidental, tonality }: KeyFields): string {
  if (!rootNote) return "—";

  const suffix =
    accidental === "SHARP" ? "#" : accidental === "FLAT" ? "b" : "";
  const note = `${rootNote}${suffix}`;
  const mode = tonality ? TONALITY_LABELS[tonality] : "";

  return mode ? `${note} ${mode}` : note;
}
