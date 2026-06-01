"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateSetlistModal } from "@/components/setlist/create-setlist-modal";
import { glassCard } from "@/lib/styles";
import { cn } from "@/lib/utils";

type ShowSetlistSectionProps = {
  showId: string;
  setlists: { id: string; name: string }[];
};

export function ShowSetlistSection({
  showId,
  setlists,
}: ShowSetlistSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <section className={cn(glassCard, "p-6")}>
        <h2 className="text-sm font-medium text-white">Setlist</h2>

        {setlists.length === 0 ? (
          <div className="mt-6 flex flex-col items-center py-6 text-center">
            <p className="text-white/60">No setlist yet</p>
            <Button
              type="button"
              onClick={() => setModalOpen(true)}
              className="mt-4 rounded-lg bg-indigo-500 text-white hover:bg-indigo-400"
            >
              Create Setlist
            </Button>
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {setlists.map((setlist) => (
              <li key={setlist.id}>
                <Link
                  href={`/shows/${showId}/setlist/${setlist.id}`}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm transition-colors hover:border-indigo-500/30 hover:bg-indigo-500/10"
                >
                  <span className="font-medium text-white">{setlist.name}</span>
                  <span className="text-white/40">Edit →</span>
                </Link>
              </li>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(true)}
              className="mt-2 w-full rounded-lg border-white/10 text-white/70 hover:bg-white/5"
            >
              Create another setlist
            </Button>
          </ul>
        )}
      </section>

      <CreateSetlistModal
        showId={showId}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
