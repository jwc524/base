"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Plus, Search } from "lucide-react";
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

  return (
    <div
      ref={containerRef}
      className={cn(
        glassCard,
        "sticky bottom-4 z-20 border-indigo-500/20 p-4 shadow-lg shadow-black/40",
      )}
    >
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/30" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => trimmed && setOpen(true)}
          placeholder="Search songs to add..."
          disabled={isAdding}
          className={cn(inputClass, "pl-10")}
        />
        {(isSearching || isAdding) && (
          <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-white/40" />
        )}
      </div>

      {open && trimmed ? (
        <div className="mt-2 max-h-64 overflow-y-auto rounded-lg border border-white/10 bg-[#12121a]">
          {results.length === 0 && !isSearching ? (
            <button
              type="button"
              disabled={isAdding}
              onClick={() => void createAndAddSong(trimmed)}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-amber-400 transition-colors hover:bg-white/5"
            >
              <Plus className="size-4 shrink-0" />
              Create new song: {trimmed}
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
                  className="flex w-full flex-col px-4 py-3 text-left transition-colors hover:bg-white/5"
                >
                  <span className="text-sm font-medium text-white">
                    {song.title}
                  </span>
                  {song.artist ? (
                    <span className="text-xs text-white/50">{song.artist}</span>
                  ) : null}
                </button>
              ))}
              {!exactMatch && trimmed ? (
                <button
                  type="button"
                  disabled={isAdding}
                  onClick={() => void createAndAddSong(trimmed)}
                  className="flex w-full items-center gap-2 border-t border-white/10 px-4 py-3 text-left text-sm text-amber-400 transition-colors hover:bg-white/5"
                >
                  <Plus className="size-4 shrink-0" />
                  Create new song: {trimmed}
                </button>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
