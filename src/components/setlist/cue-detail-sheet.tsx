"use client";

import { useRef } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import type { CueWithRelations } from "@/lib/setlist-types";
import { CueDetailPanel, type CueUpdatePatch } from "./cue-detail-panel";

type CueDetailSheetProps = {
  cue: CueWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, data: CueUpdatePatch) => Promise<void>;
  onRegisterFlush?: (flush: (() => Promise<void>) | null) => void;
};

export function CueDetailSheet({
  cue,
  open,
  onOpenChange,
  onUpdate,
  onRegisterFlush,
}: CueDetailSheetProps) {
  const flushRef = useRef<(() => Promise<void>) | null>(null);

  if (!cue) return null;

  async function handleOpenChange(next: boolean) {
    if (!next) {
      await flushRef.current?.();
      onOpenChange(false);
      return;
    }
    onOpenChange(true);
  }

  return (
    <Sheet open={open} onOpenChange={(next) => void handleOpenChange(next)}>
      <SheetContent
        side="bottom"
        showOverlay
        className="h-[min(94vh,100dvh)] max-h-[94vh] min-h-[88vh] rounded-t-2xl"
        aria-describedby={undefined}
      >
        <CueDetailPanel
          cue={cue}
          onUpdate={onUpdate}
          onClose={() => void handleOpenChange(false)}
          onRegisterFlush={(fn) => {
            flushRef.current = fn;
            onRegisterFlush?.(fn);
          }}
        />
      </SheetContent>
    </Sheet>
  );
}
