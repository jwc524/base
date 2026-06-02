"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatKey } from "@/lib/format-key";
import { inputClass } from "@/lib/styles";
import type { CueWithRelations } from "@/lib/setlist-types";
import { cn } from "@/lib/utils";
import { MetaEmpty } from "./cue-meta";

type CueRowProps = {
  cue: CueWithRelations;
  isSelected: boolean;
  isHighlighted: boolean;
  onSelect: () => void;
  onDelete: (id: string) => void;
  onUpdate: (
    id: string,
    data: { notes?: string | null; arrangementId?: string | null },
  ) => Promise<void>;
  isDeleting: boolean;
};

export function CueRow({
  cue,
  isSelected,
  isHighlighted,
  onSelect,
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
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(cue.notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);
  const notesInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setNotes(cue.notes ?? "");
  }, [cue.notes]);

  useEffect(() => {
    if (editingNotes) notesInputRef.current?.focus();
  }, [editingNotes]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  async function saveNotes(value: string) {
    if (value === (cue.notes ?? "")) {
      setEditingNotes(false);
      return;
    }
    setSavingNotes(true);
    try {
      await onUpdate(cue.id, { notes: value || null });
      setEditingNotes(false);
    } finally {
      setSavingNotes(false);
    }
  }

  function handleRowClick() {
    if (editingNotes) return;
    onSelect();
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      onClick={handleRowClick}
      className={cn(
        "group border-b border-white/10 transition-colors duration-150",
        isDragging && "opacity-40",
        !isDragging && "hover:bg-white/5",
        isSelected && !isDragging && "bg-indigo-500/10",
        isHighlighted && "animate-[cue-flash_1.2s_ease-out]",
      )}
    >
      <td className="w-9 px-1 py-2">
        <button
          type="button"
          className="flex size-8 cursor-grab items-center justify-center rounded-md text-white/25 transition-colors hover:bg-white/5 hover:text-white/50 active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
      </td>
      <td className="w-10 px-2 py-2 tabular-nums text-xs text-white/40">
        {cue.position}
      </td>
      <td className="min-w-[140px] px-3 py-2">
        <span className="font-medium text-white">{cue.song.title}</span>
        {cue.song.artist ? (
          <span className="mt-0.5 block truncate text-xs text-white/40">
            {cue.song.artist}
          </span>
        ) : null}
      </td>
      <td className="hidden px-3 py-2 text-sm text-white/60 lg:table-cell">
        {arrangement?.name ?? <MetaEmpty />}
      </td>
      <td className="px-3 py-2 text-sm text-white/60">
        {arrangement ? formatKey(arrangement) : <MetaEmpty />}
      </td>
      <td className="hidden px-3 py-2 text-sm tabular-nums text-white/60 sm:table-cell">
        {arrangement?.bpm ?? <MetaEmpty />}
      </td>
      <td className="hidden px-3 py-2 text-sm text-white/60 md:table-cell">
        {arrangement?.timeSignature ?? <MetaEmpty />}
      </td>
      <td
        className="max-w-[160px] px-3 py-2"
        onClick={(e) => e.stopPropagation()}
      >
        {editingNotes ? (
          <input
            ref={notesInputRef}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => void saveNotes(notes)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
              }
              if (e.key === "Escape") {
                setNotes(cue.notes ?? "");
                setEditingNotes(false);
              }
            }}
            placeholder="Add note..."
            className={cn(
              inputClass,
              "h-8 w-full rounded-lg px-2 text-xs",
            )}
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditingNotes(true)}
            className={cn(
              "block w-full truncate rounded-md px-2 py-1 text-left text-xs transition-colors",
              cue.notes
                ? "text-white/60 hover:bg-white/5 hover:text-white/80"
                : "text-white/25 hover:bg-white/5 hover:text-white/40",
              savingNotes && "opacity-50",
            )}
          >
            {cue.notes || "Add note..."}
          </button>
        )}
      </td>
      <td className="w-10 px-1 py-2">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={isDeleting}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(cue.id);
          }}
          className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 text-white/30 hover:bg-red-500/10 hover:text-red-400"
        >
          <Trash2 className="size-4" />
        </Button>
      </td>
    </tr>
  );
}
