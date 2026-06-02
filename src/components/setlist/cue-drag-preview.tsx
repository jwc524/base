"use client";

import { GripVertical } from "lucide-react";
import { formatKey } from "@/lib/format-key";
import type { CueWithRelations } from "@/lib/setlist-types";
import { cn } from "@/lib/utils";
import { MetaEmpty } from "./cue-meta";

type CueDragPreviewProps = {
  cue: CueWithRelations;
  variant: "table" | "card";
};

export function CueDragPreview({ cue, variant }: CueDragPreviewProps) {
  const arrangement = cue.arrangement;

  if (variant === "card") {
    return (
      <div
        className={cn(
          "flex items-start gap-2 rounded-xl border border-indigo-500/40 bg-[#12121a] p-3 shadow-xl shadow-indigo-500/20 ring-1 ring-indigo-500/30",
        )}
      >
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center text-indigo-400">
          <GripVertical className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-white">{cue.song.title}</p>
          {cue.song.artist ? (
            <p className="truncate text-xs text-white/40">{cue.song.artist}</p>
          ) : null}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className="text-white/50">
              {arrangement?.name ?? <MetaEmpty />}
            </span>
            <span className="text-white/60">
              {arrangement ? formatKey(arrangement) : <MetaEmpty />}
            </span>
          </div>
        </div>
        <span className="shrink-0 text-xs tabular-nums text-white/30">
          #{cue.position}
        </span>
      </div>
    );
  }

  return (
    <table className="w-[min(100vw-2rem,720px)] text-sm">
      <tbody>
        <tr className="bg-[#12121a] shadow-xl shadow-indigo-500/20 ring-1 ring-indigo-500/30">
          <td className="w-9 px-1 py-2">
            <div className="flex size-8 items-center justify-center text-indigo-400">
              <GripVertical className="size-4" />
            </div>
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
          <td className="max-w-[160px] truncate px-3 py-2 text-xs text-white/50">
            {cue.notes || "—"}
          </td>
          <td className="w-10 px-1 py-2" />
        </tr>
      </tbody>
    </table>
  );
}
