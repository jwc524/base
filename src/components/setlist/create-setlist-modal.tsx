"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { glassCard, inputClass } from "@/lib/styles";
import { cn } from "@/lib/utils";

type CreateSetlistModalProps = {
  showId: string;
  open: boolean;
  onClose: () => void;
};

export function CreateSetlistModal({
  showId,
  open,
  onClose,
}: CreateSetlistModalProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/setlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, showId }),
      });

      const data = (await response.json()) as {
        error?: string;
        setlist?: { id: string };
      };

      if (!response.ok || !data.setlist) {
        setError(data.error ?? "Failed to create setlist");
        return;
      }

      router.push(`/shows/${showId}/setlist/${data.setlist.id}`);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={cn(glassCard, "relative z-10 w-full max-w-md p-6")}>
        <h2 className="text-lg font-semibold text-white">Create setlist</h2>
        <p className="mt-1 text-sm text-white/60">
          Name this setlist for the show.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="setlist-name" className="text-white/80">
              Setlist name
            </Label>
            <Input
              id="setlist-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Main set"
              required
              autoFocus
              className={inputClass}
            />
          </div>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-white/60 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-indigo-500 text-white hover:bg-indigo-400"
            >
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
