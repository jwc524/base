import { Instrument, type Instrument as InstrumentType } from "@/generated/prisma/enums";

export const INSTRUMENTS = Object.values(Instrument) as InstrumentType[];

export const INSTRUMENT_LABELS: Record<InstrumentType, string> = {
  KEYS: "Keys",
  BASS: "Bass",
  DRUMS: "Drums",
  GUITAR: "Guitar",
  VOCALS: "Vocals",
  HORNS: "Horns",
  STRINGS: "Strings",
  PERCUSSION: "Percussion",
  OTHER: "Other",
};
