"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { glassCard, inputClass } from "@/lib/styles";
import { cn } from "@/lib/utils";

export function NewShowForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");
  const [city, setCity] = useState("");
  const [soundcheckTime, setSoundcheckTime] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/shows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          date,
          venue: venue || undefined,
          city: city || undefined,
          soundcheckTime: soundcheckTime || undefined,
          notes: notes || undefined,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        show?: { id: string };
      };

      if (!response.ok || !data.show) {
        setError(data.error ?? "Failed to create show");
        return;
      }

      router.push(`/shows/${data.show.id}`);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className={cn(glassCard, "p-8")}>
        <h1 className="text-xl font-semibold text-white">New Show</h1>
        <p className="mt-1 text-sm text-white/60">
          Add the details for your upcoming gig.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white/80">
              Show name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-white/80">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue" className="text-white/80">
              Venue
            </Label>
            <Input
              id="venue"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city" className="text-white/80">
              City
            </Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="soundcheckTime" className="text-white/80">
              Soundcheck time
            </Label>
            <Input
              id="soundcheckTime"
              type="time"
              value={soundcheckTime}
              onChange={(e) => setSoundcheckTime(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-white/80">
              Notes{" "}
              <span className="font-normal text-white/30">(optional)</span>
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className={inputClass}
            />
          </div>

          {error ? (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          ) : null}

          <div className="flex gap-3 pt-2">
            <Link
              href="/shows"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "flex flex-1 items-center justify-center rounded-lg border-white/10 bg-white/5 text-white hover:bg-white/10",
              )}
            >
              Cancel
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-indigo-500 text-white hover:bg-indigo-400"
            >
              {isSubmitting ? "Creating..." : "Create Show"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
