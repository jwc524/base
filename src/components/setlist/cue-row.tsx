"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatKey } from "@/lib/format-key";
import { inputClass } from "@/lib/styles";
import type { CueWithRelations } from "@/lib/setlist-types";
import { cn } from "@/lib/utils";

type CueRowProps = {
  cue: CueWithRelations;
  expanded: boolean;
  onToggle: () => void;
  onDelete: (id: string) => void;
  onUpdate: (
    id: string,
    data: { notes?: string | null; arrangementId?: string | null },
  ) => Promise<void>;
  isDeleting: boolean;
};

export function CueRow({
  cue,
  expanded,
  onToggle,
  onDelete,
  onUpdate,
  isDeleting,
}: CueRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cue.id });

  const arrangement = cue.arrangement;
  const [notes, setNotes] = useState(cue.notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    setNotes(cue.notes ?? "");
  }, [cue.notes]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  async function saveNotes(value: string) {
    if (value === (cue.notes ?? "")) return;
    setSavingNotes(true);
    try {
      await onUpdate(cue.id, { notes: value || null });
    } finally {
      setSavingNotes(false);
    }
  }

  return (
    <>
      <tr
        ref={setNodeRef}
        style={style}
        className={cn(
          "border-b border-white/10 transition-colors",
          isDragging && "relative z-10 bg-indigo-500/10 shadow-lg",
          !isDragging && "hover:bg-white/[0.03]",
        )}
      >
        <td className="w-10 px-2 py-3">
          <button
            type="button"
            className="flex size-8 cursor-grab items-center justify-center rounded-md text-white/30 hover:bg-white/5 hover:text-white/60 active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" />
          </button>
        </td>
        <td
          className="cursor-pointer px-3 py-3 tabular-nums text-white/50"
          onClick={onToggle}
        >
          {cue.position}
        </td>
        <td
          className="cursor-pointer px-3 py-3 font-medium text-white"
          onClick={onToggle}
        >
          {cue.song.title}
          {cue.song.artist ? (
            <span className="mt-0.5 block text-xs font-normal text-white/40">
              {cue.song.artist}
            </span>
          ) : null}
        </td>
        <td
          className="cursor-pointer px-3 py-3 text-white/70"
          onClick={onToggle}
        >
          {arrangement?.name ?? "—"}
        </td>
        <td
          className="cursor-pointer px-3 py-3 text-white/70"
          onClick={onToggle}
        >
          {arrangement ? formatKey(arrangement) : "—"}
        </td>
        <td
          className="cursor-pointer px-3 py-3 tabular-nums text-white/70"
          onClick={onToggle}
        >
          {arrangement?.bpm ?? "—"}
        </td>
        <td
          className="cursor-pointer px-3 py-3 text-white/70"
          onClick={onToggle}
        >
          {arrangement?.timeSignature ?? "—"}
        </td>
        <td
          className="max-w-[140px] cursor-pointer truncate px-3 py-3 text-white/50"
          onClick={onToggle}
        >
          {cue.notes || "—"}
        </td>
        <td className="px-2 py-3">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={isDeleting}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(cue.id);
            }}
            className="text-white/30 hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 className="size-4" />
          </Button>
        </td>
      </tr>

      {expanded ? (
        <tr className="border-b border-white/10 bg-white/[0.02]">
          <td colSpan={9} className="px-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-white/70">Show notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={() => void saveNotes(notes)}
                  placeholder="Cue notes for this show..."
                  rows={3}
                  className={inputClass}
                />
                {savingNotes ? (
                  <p className="text-xs text-white/30">Saving...</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label className="text-white/70">Arrangement</Label>
                <select
                  value={cue.arrangement?.id ?? ""}
                  onChange={(e) =>
                    void onUpdate(cue.id, {
                      arrangementId: e.target.value || null,
                    })
                  }
                  className={cn(
                    inputClass,
                    "h-10 w-full px-3 text-sm outline-none",
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
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}
