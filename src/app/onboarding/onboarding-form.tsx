"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AccountType, type Instrument } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { INSTRUMENTS, INSTRUMENT_LABELS } from "@/lib/instruments";

export function OnboardingForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState<AccountType>(
    AccountType.MUSICIAN,
  );
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function toggleInstrument(instrument: Instrument) {
    setInstruments((current) =>
      current.includes(instrument)
        ? current.filter((item) => item !== instrument)
        : [...current, instrument],
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          accountType,
          instruments,
          location,
          bio: bio || undefined,
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.04)_1px,transparent_0)] bg-size-[24px_24px]" />
      </div>

      <div className="relative w-full max-w-lg">
        <div className="rounded-xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-indigo-500/10 backdrop-blur-md ring-1 ring-indigo-500/20">
          <div className="mb-8 space-y-2 text-center">
            <p className="text-sm font-medium tracking-wide text-indigo-400 uppercase">
              Get started
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Welcome to Base
            </h1>
            <p className="text-sm text-white/60">
              Tell us a bit about yourself so we can tailor your experience.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white/80">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                required
                className="rounded-lg border-white/10 bg-white/5 text-white placeholder:text-white/40"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/80">Account type</Label>
              <Tabs
                value={accountType}
                onValueChange={(value) => {
                  if (
                    value === AccountType.ARTIST ||
                    value === AccountType.MUSICIAN
                  ) {
                    setAccountType(value);
                  }
                }}
              >
                <TabsList className="grid h-11 w-full grid-cols-2 rounded-lg border border-white/10 bg-white/5 p-1">
                  <TabsTrigger
                    value={AccountType.MUSICIAN}
                    className="rounded-md data-active:bg-indigo-500/20 data-active:text-white"
                  >
                    Musician
                  </TabsTrigger>
                  <TabsTrigger
                    value={AccountType.ARTIST}
                    className="rounded-md data-active:bg-indigo-500/20 data-active:text-white"
                  >
                    Artist
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <p className="text-xs text-white/50">
                {accountType === AccountType.ARTIST
                  ? "You book and manage musicians for your shows."
                  : "You play gigs and collaborate with other musicians."}
              </p>
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
                          ? "border-indigo-400/50 bg-indigo-500/20 text-white shadow-sm shadow-indigo-500/20"
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
              <Label htmlFor="location" className="text-white/80">
                City
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Nashville, TN"
                required
                className="rounded-lg border-white/10 bg-white/5 text-white placeholder:text-white/40"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-white/80">
                Bio{" "}
                <span className="font-normal text-white/40">(optional)</span>
              </Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                placeholder="A few lines about your music, experience, or what you're looking for..."
                rows={4}
                className="rounded-lg border-white/10 bg-white/5 text-white placeholder:text-white/40"
              />
            </div>

            {error ? (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full rounded-lg bg-indigo-500 text-white hover:bg-indigo-400 disabled:opacity-60"
            >
              {isSubmitting ? "Creating profile..." : "Continue to Base"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
