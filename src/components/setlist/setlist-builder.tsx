"use client";

import {
  DndContext,
  DragOverlay,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
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
import { useCallback, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, Link2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { AddSongBar } from "@/components/setlist/add-song-bar";
import { CueDetailPanel } from "@/components/setlist/cue-detail-panel";
import { CueDetailSheet } from "@/components/setlist/cue-detail-sheet";
import { CueDragPreview } from "@/components/setlist/cue-drag-preview";
import { CueMobileCard } from "@/components/setlist/cue-mobile-card";
import { CueRow } from "@/components/setlist/cue-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMediaQuery } from "@/hooks/use-media-query";
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
  const [selectedCueId, setSelectedCueId] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [highlightCueIds, setHighlightCueIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [isRenaming, setIsRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState(setlist.name);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  const panelFlushRef = useRef<(() => Promise<void>) | null>(null);
  const isMobile = useMediaQuery("(max-width: 767px)");

  const selectedCue = useMemo(
    () => setlist.cues.find((c) => c.id === selectedCueId) ?? null,
    [setlist.cues, selectedCueId],
  );

  const activeCue = useMemo(
    () => setlist.cues.find((c) => c.id === activeDragId) ?? null,
    [setlist.cues, activeDragId],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const flushPanelEdits = useCallback(async () => {
    await panelFlushRef.current?.();
  }, []);

  const closePanel = useCallback(async () => {
    await flushPanelEdits();
    setSelectedCueId(null);
  }, [flushPanelEdits]);

  const toggleCue = useCallback(
    async (cueId: string) => {
      if (selectedCueId === cueId) {
        await closePanel();
        return;
      }
      if (selectedCueId) {
        await flushPanelEdits();
      }
      setSelectedCueId(cueId);
    },
    [selectedCueId, flushPanelEdits, closePanel],
  );

  function handleSetlistUpdated(updated: SetlistDetail) {
    const prevIds = new Set(setlist.cues.map((c) => c.id));
    const newIds = updated.cues
      .filter((c) => !prevIds.has(c.id))
      .map((c) => c.id);

    setSetlist(updated);

    if (newIds.length > 0) {
      setHighlightCueIds(new Set(newIds));
      window.setTimeout(() => setHighlightCueIds(new Set()), 1400);
    }
  }

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

  function handleDragStart(event: DragStartEvent) {
    setActiveDragId(String(event.active.id));
  }

  async function persistReorder(
    reordered: SetlistDetail["cues"],
    previous: SetlistDetail["cues"],
    setlistId: string,
  ) {
    setIsReordering(true);

    try {
      const response = await fetch("/api/cues/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          setlistId,
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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over || active.id === over.id || isReordering) return;

    setSetlist((current) => {
      const oldIndex = current.cues.findIndex((c) => c.id === active.id);
      const newIndex = current.cues.findIndex((c) => c.id === over.id);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
        return current;
      }

      const reordered = arrayMove(current.cues, oldIndex, newIndex).map(
        (cue, index) => ({ ...cue, position: index + 1 }),
      );

      void persistReorder(reordered, current.cues, current.id);
      return { ...current, cues: reordered };
    });
  }

  function handleDragCancel() {
    setActiveDragId(null);
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
      if (selectedCueId === cueId) setSelectedCueId(null);
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

  const cueIds = setlist.cues.map((c) => c.id);
  const emptyMessage = "No songs yet — search below to add your first one";
  const panelOpen = !isMobile && !!selectedCue;

  return (
    <div className="flex min-h-full flex-col p-4 pb-36 md:p-8 md:pb-32">
      <div className="mb-6 md:mb-8">
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
              <p className="mt-2 text-sm text-white/60">
                {setlist.show.name}
                {showDate ? ` · ${showDate}` : ""}
              </p>
            ) : null}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => void shareSetlist()}
            className="rounded-lg border-white/10 bg-white/5 text-white/80 hover:border-indigo-500/30 hover:bg-indigo-500/10"
          >
            <Link2 className="size-4" />
            Share
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-hidden md:min-h-[calc(100vh-11rem)] md:flex-row",
        )}
      >
        <div
          className={cn(
            "flex min-h-0 min-w-0 flex-1 flex-col transition-[flex-grow] duration-300 ease-in-out",
          )}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            {isMobile ? (
              <div className="space-y-2">
                {setlist.cues.length === 0 ? (
                  <div
                    className={cn(
                      glassCard,
                      "px-4 py-16 text-center text-sm text-white/50",
                    )}
                  >
                    {emptyMessage}
                  </div>
                ) : (
                  <SortableContext
                    items={cueIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {setlist.cues.map((cue) => (
                      <CueMobileCard
                        key={cue.id}
                        cue={cue}
                        isSelected={selectedCueId === cue.id}
                        isHighlighted={highlightCueIds.has(cue.id)}
                        onSelect={() => void toggleCue(cue.id)}
                        onDelete={(id) => void deleteCue(id)}
                        isDeleting={deletingId === cue.id}
                      />
                    ))}
                  </SortableContext>
                )}
              </div>
            ) : (
              <div
                className={cn(
                  glassCard,
                  "flex min-h-0 flex-1 flex-col overflow-hidden",
                )}
              >
                <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
                  <table className="w-full min-w-[640px] text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-left">
                        <th className="w-9 px-1 py-2.5" />
                        <th className="w-10 px-2 py-2.5 text-xs font-medium text-white/40">
                          #
                        </th>
                        <th className="px-3 py-2.5 text-xs font-medium text-white/40">
                          Song
                        </th>
                        <th className="hidden px-3 py-2.5 text-xs font-medium text-white/40 lg:table-cell">
                          Arrangement
                        </th>
                        <th className="px-3 py-2.5 text-xs font-medium text-white/40">
                          Key
                        </th>
                        <th className="hidden px-3 py-2.5 text-xs font-medium text-white/40 sm:table-cell">
                          BPM
                        </th>
                        <th className="hidden px-3 py-2.5 text-xs font-medium text-white/40 md:table-cell">
                          Time Sig
                        </th>
                        <th className="px-3 py-2.5 text-xs font-medium text-white/40">
                          Notes
                        </th>
                        <th className="w-10 px-1 py-2.5" />
                      </tr>
                    </thead>
                    <tbody>
                      {setlist.cues.length === 0 ? (
                        <tr>
                          <td
                            colSpan={9}
                            className="px-4 py-20 text-center text-white/50"
                          >
                            {emptyMessage}
                          </td>
                        </tr>
                      ) : (
                        <SortableContext
                          items={cueIds}
                          strategy={verticalListSortingStrategy}
                        >
                          {setlist.cues.map((cue) => (
                            <CueRow
                              key={cue.id}
                              cue={cue}
                              isSelected={selectedCueId === cue.id}
                              isHighlighted={highlightCueIds.has(cue.id)}
                              onSelect={() => void toggleCue(cue.id)}
                              onDelete={(id) => void deleteCue(id)}
                              onUpdate={updateCue}
                              isDeleting={deletingId === cue.id}
                            />
                          ))}
                        </SortableContext>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
              {activeCue ? (
                <CueDragPreview
                  cue={activeCue}
                  variant={isMobile ? "card" : "table"}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>

        <aside
          aria-hidden={!panelOpen}
          className={cn(
            "hidden shrink-0 overflow-hidden transition-[width,min-width,box-shadow] duration-300 ease-in-out md:flex md:flex-col",
            panelOpen
              ? "w-80 min-w-80 border-l border-white/10 shadow-[-12px_0_32px_-16px_rgba(0,0,0,0.45)]"
              : "w-0 min-w-0 border-l-0 shadow-none",
          )}
        >
          <div
            className={cn(
              glassCard,
              "flex h-full min-w-[20rem] flex-col rounded-none border-0 border-l border-white/10 bg-[#0a0a12]/95",
              panelOpen
                ? "opacity-100"
                : "pointer-events-none opacity-0",
            )}
          >
            {selectedCue ? (
              <CueDetailPanel
                cue={selectedCue}
                onUpdate={updateCue}
                onClose={() => void closePanel()}
                onRegisterFlush={(fn) => {
                  panelFlushRef.current = fn;
                }}
              />
            ) : null}
          </div>
        </aside>
      </div>

      {isMobile ? (
        <CueDetailSheet
          cue={selectedCue}
          open={!!selectedCueId}
          onOpenChange={(open) => {
            if (!open) setSelectedCueId(null);
          }}
          onUpdate={updateCue}
          onRegisterFlush={(fn) => {
            panelFlushRef.current = fn;
          }}
        />
      ) : null}

      <div className="mt-6">
        <AddSongBar
          setlistId={setlist.id}
          onSetlistUpdated={handleSetlistUpdated}
        />
      </div>
    </div>
  );
}
