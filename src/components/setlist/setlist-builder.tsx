"use client";

import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Check, Link2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { AddSongBar } from "@/components/setlist/add-song-bar";
import { CueRow } from "@/components/setlist/cue-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatShowDate } from "@/lib/format";
import { glassCard, inputClass } from "@/lib/styles";
import type { SetlistDetail } from "@/lib/setlist-types";
import { cn } from "@/lib/utils";

type SetlistBuilderProps = {
  showId: string;
  initialSetlist: SetlistDetail;
};

export function SetlistBuilder({ showId, initialSetlist }: SetlistBuilderProps) {
  const [setlist, setSetlist] = useState(initialSetlist);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState(setlist.name);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  async function saveName() {
    const trimmed = nameDraft.trim();
    if (!trimmed || trimmed === setlist.name) {
      setNameDraft(setlist.name);
      setIsRenaming(false);
      return;
    }

    const response = await fetch(`/api/setlists/${setlist.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });

    const data = (await response.json()) as {
      error?: string;
      setlist?: { name: string };
    };

    if (!response.ok) {
      toast.error(data.error ?? "Failed to rename setlist");
      setNameDraft(setlist.name);
      setIsRenaming(false);
      return;
    }

    setSetlist((current) => ({ ...current, name: trimmed }));
    setIsRenaming(false);
    toast.success("Setlist renamed");
  }

  async function shareSetlist() {
    const url = `${window.location.origin}/s/${setlist.shareToken}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Share link copied to clipboard");
    } catch {
      toast.error("Could not copy link");
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || isReordering) return;

    const oldIndex = setlist.cues.findIndex((c) => c.id === active.id);
    const newIndex = setlist.cues.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(setlist.cues, oldIndex, newIndex).map(
      (cue, index) => ({ ...cue, position: index + 1 }),
    );

    const previous = setlist.cues;
    setSetlist((current) => ({ ...current, cues: reordered }));
    setIsReordering(true);

    try {
      const response = await fetch("/api/cues/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          setlistId: setlist.id,
          cueIds: reordered.map((c) => c.id),
        }),
      });

      if (!response.ok) {
        setSetlist((current) => ({ ...current, cues: previous }));
        toast.error("Failed to save order");
        return;
      }

      const data = (await response.json()) as { setlist?: SetlistDetail };
      if (data.setlist) {
        setSetlist(data.setlist);
      }
    } catch {
      setSetlist((current) => ({ ...current, cues: previous }));
      toast.error("Failed to save order");
    } finally {
      setIsReordering(false);
    }
  }

  async function deleteCue(cueId: string) {
    setDeletingId(cueId);
    try {
      const response = await fetch(`/api/cues/${cueId}`, {
        method: "DELETE",
      });

      const data = (await response.json()) as {
        error?: string;
        setlist?: SetlistDetail;
      };

      if (!response.ok || !data.setlist) {
        toast.error(data.error ?? "Failed to remove song");
        return;
      }

      setSetlist(data.setlist);
      if (expandedId === cueId) setExpandedId(null);
    } catch {
      toast.error("Failed to remove song");
    } finally {
      setDeletingId(null);
    }
  }

  async function updateCue(
    cueId: string,
    patch: { notes?: string | null; arrangementId?: string | null },
  ) {
    const response = await fetch(`/api/cues/${cueId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });

    const data = (await response.json()) as {
      error?: string;
      setlist?: SetlistDetail;
    };

    if (!response.ok || !data.setlist) {
      toast.error(data.error ?? "Failed to update cue");
      return;
    }

    setSetlist(data.setlist);
  }

  const showDate = setlist.show
    ? formatShowDate(new Date(setlist.show.date))
    : null;

  return (
    <div className="flex min-h-full flex-col p-6 pb-32 md:p-8">
      <div className="mb-8">
        <Link
          href={`/shows/${showId}`}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Back to show
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {isRenaming ? (
              <div className="flex items-center gap-2">
                <Input
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void saveName();
                    if (e.key === "Escape") {
                      setNameDraft(setlist.name);
                      setIsRenaming(false);
                    }
                  }}
                  autoFocus
                  className={cn(inputClass, "max-w-md text-xl font-semibold")}
                />
                <Button
                  type="button"
                  size="icon-sm"
                  onClick={() => void saveName()}
                  className="rounded-lg bg-indigo-500 text-white hover:bg-indigo-400"
                >
                  <Check className="size-4" />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsRenaming(true)}
                className="group flex items-center gap-2 text-left"
              >
                <h1 className="text-2xl font-semibold tracking-tight text-white">
                  {setlist.name}
                </h1>
                <Pencil className="size-4 text-white/0 transition-colors group-hover:text-white/40" />
              </button>
            )}

            {setlist.show ? (
              <p className="mt-2 text-white/60">
                {setlist.show.name}
                {showDate ? ` · ${showDate}` : ""}
              </p>
            ) : null}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => void shareSetlist()}
            className="rounded-lg border-white/10 text-white/80 hover:bg-white/5"
          >
            <Link2 className="size-4" />
            Share
          </Button>
        </div>
      </div>

      <div className={cn(glassCard, "overflow-hidden")}>
        <div className="overflow-x-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => void handleDragEnd(event)}
          >
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="w-10 px-2 py-3" />
                  <th className="px-3 py-3 font-medium text-white/50">#</th>
                  <th className="px-3 py-3 font-medium text-white/50">Song</th>
                  <th className="px-3 py-3 font-medium text-white/50">
                    Arrangement
                  </th>
                  <th className="px-3 py-3 font-medium text-white/50">Key</th>
                  <th className="px-3 py-3 font-medium text-white/50">BPM</th>
                  <th className="px-3 py-3 font-medium text-white/50">
                    Time Sig
                  </th>
                  <th className="px-3 py-3 font-medium text-white/50">Notes</th>
                  <th className="w-12 px-2 py-3" />
                </tr>
              </thead>
              <tbody>
                {setlist.cues.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-16 text-center text-white/50"
                    >
                      No songs yet — search below to add your first one
                    </td>
                  </tr>
                ) : (
                  <SortableContext
                    items={setlist.cues.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {setlist.cues.map((cue) => (
                      <CueRow
                        key={cue.id}
                        cue={cue}
                        expanded={expandedId === cue.id}
                        onToggle={() =>
                          setExpandedId((current) =>
                            current === cue.id ? null : cue.id,
                          )
                        }
                        onDelete={(id) => void deleteCue(id)}
                        onUpdate={updateCue}
                        isDeleting={deletingId === cue.id}
                      />
                    ))}
                  </SortableContext>
                )}
              </tbody>
            </table>
          </DndContext>
        </div>
      </div>

      <div className="mt-6">
        <AddSongBar
          setlistId={setlist.id}
          onSetlistUpdated={(updated) => setSetlist(updated)}
        />
      </div>
    </div>
  );
}
