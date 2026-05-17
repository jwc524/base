"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AccountType, type Instrument } from "@/generated/prisma/enums";
import { AccountTypeBadge } from "@/components/app/account-type-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { INSTRUMENTS, INSTRUMENT_LABELS } from "@/lib/instruments";
import { glassCard, inputClass } from "@/lib/styles";
import { cn } from "@/lib/utils";

export type ProfileFormUser = {
  name: string;
  bio: string | null;
  location: string | null;
  accountType: AccountType;
  instruments: Instrument[];
  genres: string[];
};

type ProfileFormProps = {
  user: ProfileFormUser;
  clerkImageUrl: string | null;
};

export function ProfileForm({ user, clerkImageUrl }: ProfileFormProps) {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio ?? "");
  const [location, setLocation] = useState(user.location ?? "");
  const [instruments, setInstruments] = useState<Instrument[]>(user.instruments);
  const [genres, setGenres] = useState<string[]>(user.genres);
  const [genreInput, setGenreInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function toggleInstrument(instrument: Instrument) {
    setInstruments((current) =>
      current.includes(instrument)
        ? current.filter((item) => item !== instrument)
        : [...current, instrument],
    );
  }

  function addGenre() {
    const value = genreInput.trim();
    if (!value || genres.includes(value)) {
      setGenreInput("");
      return;
    }
    setGenres((current) => [...current, value]);
    setGenreInput("");
  }

  function removeGenre(genre: string) {
    setGenres((current) => current.filter((item) => item !== genre));
  }

  function handleGenreKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      addGenre();
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          bio: bio || null,
          location: location || null,
          instruments,
          genres,
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        toast.error(data.error ?? "Failed to save profile");
        return;
      }

      toast.success("Profile saved");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn(glassCard, "max-w-2xl p-8")}>
      <div className="mb-8 flex items-center gap-4">
        <Avatar className="size-16 border border-white/10">
          {clerkImageUrl ? (
            <AvatarImage src={clerkImageUrl} alt={name} />
          ) : null}
          <AvatarFallback className="bg-indigo-500/30 text-lg text-indigo-100">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium text-white">Profile photo</p>
          <p className="text-xs text-white/30">
            Managed by your sign-in provider
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white/80">
            Name
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
          <Label htmlFor="bio" className="text-white/80">
            Bio{" "}
            <span className="font-normal text-white/30">(optional)</span>
          </Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="text-white/80">
            Location
          </Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, state or region"
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-white/80">Account type</Label>
          <div>
            <AccountTypeBadge accountType={user.accountType} />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-white/80">Instruments</Label>
          <div className="flex flex-wrap gap-2">
            {INSTRUMENTS.map((instrument) => {
              const selected = instruments.includes(instrument);
              return (
                <button
                  key={instrument}
                  type="button"
                  onClick={() => toggleInstrument(instrument)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-sm font-medium transition-all",
                    selected
                      ? "border-indigo-400/50 bg-indigo-500/20 text-white"
                      : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white",
                  )}
                >
                  {INSTRUMENT_LABELS[instrument]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="genres" className="text-white/80">
            Genres
          </Label>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <span
                key={genre}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-sm text-white/80"
              >
                {genre}
                <button
                  type="button"
                  onClick={() => removeGenre(genre)}
                  className="text-white/40 hover:text-white"
                  aria-label={`Remove ${genre}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <Input
            id="genres"
            value={genreInput}
            onChange={(e) => setGenreInput(e.target.value)}
            onKeyDown={handleGenreKeyDown}
            onBlur={addGenre}
            placeholder="Type a genre and press Enter"
            className={inputClass}
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-indigo-500 text-white hover:bg-indigo-400"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
