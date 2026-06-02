"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatKey } from "@/lib/format-key";
import type { CueWithRelations } from "@/lib/setlist-types";
import { cn } from "@/lib/utils";
import { MetaEmpty } from "./cue-meta";

type CueMobileCardProps = {
  cue: CueWithRelations;
  isSelected: boolean;
  isHighlighted: boolean;
  onSelect: () => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
};

export function CueMobileCard({
  cue,
  isSelected,
  isHighlighted,
  onSelect,
  onDelete,
  isDeleting,
}: CueMobileCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cue.id });

  const arrangement = cue.arrangement;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "group flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-3 transition-colors duration-150",
        isDragging && "opacity-40",
        !isDragging && "active:bg-white/[0.07]",
        isSelected && !isDragging && "border-indigo-500/30 bg-indigo-500/10",
        isHighlighted && "animate-[cue-flash_1.2s_ease-out]",
      )}
    >
      <button
        type="button"
        className="mt-0.5 flex size-8 shrink-0 cursor-grab items-center justify-center rounded-md text-white/25 active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-medium text-white">{cue.song.title}</p>
            {cue.song.artist ? (
              <p className="truncate text-xs text-white/40">{cue.song.artist}</p>
            ) : null}
          </div>
          <span className="shrink-0 text-xs tabular-nums text-white/30">
            #{cue.position}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className="text-white/50">
            {arrangement?.name ?? <MetaEmpty />}
          </span>
          <span className="text-white/30">·</span>
          <span className="text-white/60">
            {arrangement ? formatKey(arrangement) : <MetaEmpty />}
          </span>
        </div>

        {cue.notes ? (
          <p className="mt-2 line-clamp-1 text-xs text-white/40">{cue.notes}</p>
        ) : null}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={isDeleting}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(cue.id);
        }}
        className="shrink-0 text-white/30 hover:bg-red-500/10 hover:text-red-400"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
