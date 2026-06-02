"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatKey } from "@/lib/format-key";
import { inputClass } from "@/lib/styles";
import type { CueWithRelations } from "@/lib/setlist-types";
import { cn } from "@/lib/utils";
import { MetaEmpty } from "./cue-meta";

export type CueUpdatePatch = {
  notes?: string | null;
  arrangementId?: string | null;
};

type CueDetailPanelProps = {
  cue: CueWithRelations;
  onUpdate: (id: string, data: CueUpdatePatch) => Promise<void>;
  onClose: () => void;
  onRegisterFlush?: (flush: (() => Promise<void>) | null) => void;
  showCloseButton?: boolean;
  className?: string;
};

export function CueDetailPanel({
  cue,
  onUpdate,
  onClose,
  onRegisterFlush,
  showCloseButton = true,
  className,
}: CueDetailPanelProps) {
  const [notes, setNotes] = useState(cue.notes ?? "");
  const [arrangementId, setArrangementId] = useState(cue.arrangement?.id ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNotes(cue.notes ?? "");
    setArrangementId(cue.arrangement?.id ?? "");
  }, [cue.id, cue.notes, cue.arrangement?.id]);

  const buildPatch = useCallback((): CueUpdatePatch => {
    const patch: CueUpdatePatch = {};
    const trimmedNotes = notes.trim();
    const savedNotes = cue.notes?.trim() ?? "";
    if (trimmedNotes !== savedNotes) {
      patch.notes = trimmedNotes || null;
    }
    const savedArrangementId = cue.arrangement?.id ?? "";
    if (arrangementId !== savedArrangementId) {
      patch.arrangementId = arrangementId || null;
    }
    return patch;
  }, [notes, arrangementId, cue.notes, cue.arrangement?.id]);

  const flushSave = useCallback(async () => {
    const patch = buildPatch();
    if (Object.keys(patch).length === 0) return;
    setSaving(true);
    try {
      await onUpdate(cue.id, patch);
    } finally {
      setSaving(false);
    }
  }, [buildPatch, cue.id, onUpdate]);

  useEffect(() => {
    onRegisterFlush?.(flushSave);
    return () => onRegisterFlush?.(null);
  }, [flushSave, onRegisterFlush]);

  async function handleClose() {
    await flushSave();
    onClose();
  }

  const arrangement =
    cue.song.arrangements.find((a) => a.id === arrangementId) ?? cue.arrangement;

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="relative flex items-start justify-between gap-3 border-b border-white/10 p-5 pr-12">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold tracking-tight text-white">
            {cue.song.title}
          </h2>
          {cue.song.artist ? (
            <p className="mt-1 truncate text-sm text-white/60">{cue.song.artist}</p>
          ) : null}
        </div>
        {showCloseButton ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => void handleClose()}
            className="absolute top-4 right-4 text-white/50 hover:bg-white/10 hover:text-white"
          >
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </Button>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-5">
        <div className="space-y-2">
          <Label className="text-white/70">Arrangement</Label>
          <select
            value={arrangementId}
            onChange={(e) => setArrangementId(e.target.value)}
            onBlur={() => void flushSave()}
            className={cn(
              inputClass,
              "h-10 w-full rounded-lg px-3 text-sm outline-none",
            )}
          >
            {cue.song.arrangements.map((arr) => (
              <option key={arr.id} value={arr.id}>
                {arr.name}
                {arr.isDefault ? " (default)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
            <p className="text-[10px] font-medium tracking-wide text-white/40 uppercase">
              Key
            </p>
            <p className="mt-1 text-sm text-white/90">
              {arrangement ? formatKey(arrangement) : <MetaEmpty />}
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
            <p className="text-[10px] font-medium tracking-wide text-white/40 uppercase">
              BPM
            </p>
            <p className="mt-1 text-sm tabular-nums text-white/90">
              {arrangement?.bpm ?? <MetaEmpty />}
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
            <p className="text-[10px] font-medium tracking-wide text-white/40 uppercase">
              Time
            </p>
            <p className="mt-1 text-sm text-white/90">
              {arrangement?.timeSignature ?? <MetaEmpty />}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-white/70">Show notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => void flushSave()}
            placeholder="Notes for this show..."
            rows={5}
            className={cn(inputClass, "rounded-lg")}
          />
          {saving ? (
            <p className="text-xs text-white/30">Saving...</p>
          ) : null}
        </div>

        <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center">
          <p className="text-sm text-white/40">Charts & files</p>
          <p className="mt-1 text-xs text-white/25">Coming soon</p>
        </div>
      </div>
    </div>
  );
}
