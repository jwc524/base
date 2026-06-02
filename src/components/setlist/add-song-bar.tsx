"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Music2, Plus, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { glassCard, inputClass } from "@/lib/styles";
import type { SetlistDetail, SongSearchResult } from "@/lib/setlist-types";
import { cn } from "@/lib/utils";

type AddSongBarProps = {
  setlistId: string;
  onSetlistUpdated: (setlist: SetlistDetail) => void;
};

export function AddSongBar({ setlistId, onSetlistUpdated }: AddSongBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SongSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 1) {
      setResults([]);
      setOpen(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/songs?q=${encodeURIComponent(trimmed)}`,
        );
        const data = (await response.json()) as { songs?: SongSearchResult[] };
        setResults(data.songs ?? []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function addCue(songId: string, arrangementId?: string | null) {
    setIsAdding(true);
    try {
      const response = await fetch("/api/cues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          setlistId,
          songId,
          arrangementId: arrangementId ?? undefined,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        toast.error(data.error ?? "Failed to add song");
        return;
      }

      const data = (await response.json()) as {
        setlist?: SetlistDetail;
      };

      setQuery("");
      setResults([]);
      setOpen(false);
      if (data.setlist) onSetlistUpdated(data.setlist);
    } catch {
      toast.error("Failed to add song");
    } finally {
      setIsAdding(false);
    }
  }

  async function createAndAddSong(title: string) {
    setIsAdding(true);
    try {
      const response = await fetch("/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      const data = (await response.json()) as {
        error?: string;
        song?: SongSearchResult;
      };

      if (!response.ok || !data.song) {
        toast.error(data.error ?? "Failed to create song");
        return;
      }

      await addCue(data.song.id, data.song.defaultArrangementId);
    } catch {
      toast.error("Failed to create song");
    } finally {
      setIsAdding(false);
    }
  }

  const trimmed = query.trim();
  const exactMatch = results.some(
    (song) => song.title.toLowerCase() === trimmed.toLowerCase(),
  );
  const showDropdown = open && trimmed.length > 0;

  return (
    <div
      ref={containerRef}
      className={cn(
        glassCard,
        "sticky bottom-4 z-20 overflow-hidden border transition-shadow duration-300",
        focused || showDropdown
          ? "border-indigo-500/40 shadow-lg shadow-indigo-500/10"
          : "border-white/10 shadow-xl shadow-black/40",
      )}
    >
      <div className="border-b border-white/5 bg-gradient-to-r from-indigo-500/10 via-transparent to-amber-500/5 px-4 py-2">
        <p className="flex items-center gap-1.5 text-xs font-medium text-white/50">
          <Sparkles className="size-3 text-indigo-400" />
          Add to setlist
        </p>
      </div>

      <div className="p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-white/30" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              setFocused(true);
              if (trimmed) setOpen(true);
            }}
            onBlur={() => setFocused(false)}
            placeholder="Search your songs..."
            disabled={isAdding}
            className={cn(
              inputClass,
              "h-11 rounded-lg border-white/10 bg-white/[0.04] pl-10 pr-10 text-sm transition-colors focus:border-indigo-500/50 focus:bg-white/[0.06]",
            )}
          />
          {(isSearching || isAdding) && (
            <Loader2 className="absolute top-1/2 right-3.5 size-4 -translate-y-1/2 animate-spin text-indigo-400/80" />
          )}
        </div>

        <div
          className={cn(
            "grid transition-all duration-200 ease-out",
            showDropdown
              ? "mt-2 grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="overflow-hidden">
            <div className="max-h-56 overflow-y-auto rounded-lg border border-white/10 bg-[#0e0e16]/95 backdrop-blur-md">
              {results.length === 0 && !isSearching ? (
                <button
                  type="button"
                  disabled={isAdding}
                  onClick={() => void createAndAddSong(trimmed)}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-amber-500/10"
                >
                  <span className="flex size-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
                    <Plus className="size-4" />
                  </span>
                  <span className="text-sm">
                    <span className="text-white/50">Create new song: </span>
                    <span className="font-medium text-amber-400">{trimmed}</span>
                  </span>
                </button>
              ) : (
                <>
                  {results.map((song) => (
                    <button
                      key={song.id}
                      type="button"
                      disabled={isAdding}
                      onClick={() =>
                        void addCue(song.id, song.defaultArrangementId)
                      }
                      className="flex w-full items-center gap-3 border-b border-white/5 px-4 py-3 text-left transition-colors last:border-0 hover:bg-white/5"
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400">
                        <Music2 className="size-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-white">
                          {song.title}
                        </span>
                        {song.artist ? (
                          <span className="block truncate text-xs text-white/45">
                            {song.artist}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  ))}
                  {!exactMatch && trimmed ? (
                    <button
                      type="button"
                      disabled={isAdding}
                      onClick={() => void createAndAddSong(trimmed)}
                      className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-amber-500/10"
                    >
                      <span className="flex size-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
                        <Plus className="size-4" />
                      </span>
                      <span className="text-sm">
                        <span className="text-white/50">Create new song: </span>
                        <span className="font-medium text-amber-400">
                          {trimmed}
                        </span>
                      </span>
                    </button>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
