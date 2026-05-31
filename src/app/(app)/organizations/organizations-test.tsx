"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CreateOrganization,
  OrganizationSwitcher,
  useOrganization,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { glassCard, inputClass } from "@/lib/styles";
import { cn } from "@/lib/utils";

type Band = {
  id: string;
  name: string;
};

type PrismaOrganization = {
  id: string;
  clerkOrgId: string;
  name: string;
  bands: Band[];
};

export function OrganizationsTest() {
  const { organization, isLoaded } = useOrganization();
  const [prismaOrg, setPrismaOrg] = useState<PrismaOrganization | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [bandName, setBandName] = useState("");
  const [isAddingBand, setIsAddingBand] = useState(false);

  const syncOrganization = useCallback(async () => {
    if (!organization) {
      setPrismaOrg(null);
      setSyncError(null);
      return;
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      const response = await fetch("/api/organizations/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: organization.id,
          name: organization.name,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        organization?: PrismaOrganization;
      };

      if (!response.ok || !data.organization) {
        setSyncError(data.error ?? "Failed to sync organization");
        setPrismaOrg(null);
        return;
      }

      setPrismaOrg(data.organization);
    } catch {
      setSyncError("Failed to sync organization");
      setPrismaOrg(null);
    } finally {
      setIsSyncing(false);
    }
  }, [organization]);

  useEffect(() => {
    if (!isLoaded) return;
    void syncOrganization();
  }, [isLoaded, syncOrganization]);

  async function handleAddBand(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!bandName.trim()) return;

    setIsAddingBand(true);
    try {
      const response = await fetch("/api/organizations/bands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: bandName.trim() }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setSyncError(data.error ?? "Failed to create band");
        return;
      }

      setBandName("");
      await syncOrganization();
    } catch {
      setSyncError("Failed to create band");
    } finally {
      setIsAddingBand(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className={cn(glassCard, "p-6")}>
        <h2 className="text-sm font-medium text-white/60">Clerk controls</h2>
        <div className="mt-4 flex flex-wrap items-start gap-4">
          <OrganizationSwitcher
            hidePersonal
            afterCreateOrganizationUrl="/organizations"
            afterSelectOrganizationUrl="/organizations"
          />
          <CreateOrganization afterCreateOrganizationUrl="/organizations" />
        </div>
      </div>

      <div className={cn(glassCard, "p-6")}>
        <h2 className="text-sm font-medium text-white/60">
          Prisma sync (current org)
        </h2>

        {!isLoaded ? (
          <p className="mt-4 text-sm text-white/30">Loading Clerk org...</p>
        ) : !organization ? (
          <p className="mt-4 text-sm text-white/60">
            No organization selected. Create or switch to an organization above.
          </p>
        ) : isSyncing ? (
          <p className="mt-4 text-sm text-white/30">Syncing to Postgres...</p>
        ) : syncError ? (
          <p className="mt-4 text-sm text-red-300">{syncError}</p>
        ) : prismaOrg ? (
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-white/30">
                Clerk org
              </p>
              <p className="text-white">{organization.name}</p>
              <p className="mt-1 font-mono text-xs text-white/30">
                {organization.id}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-white/30">
                Postgres org
              </p>
              <p className="text-white">{prismaOrg.name}</p>
              <p className="mt-1 font-mono text-xs text-white/30">
                {prismaOrg.id} · clerkOrgId {prismaOrg.clerkOrgId}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-white/30">
                Bands
              </p>
              {prismaOrg.bands.length === 0 ? (
                <p className="mt-2 text-sm text-white/60">No bands yet</p>
              ) : (
                <ul className="mt-2 space-y-1">
                  {prismaOrg.bands.map((band) => (
                    <li
                      key={band.id}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                    >
                      {band.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <form
              onSubmit={handleAddBand}
              className="flex flex-wrap items-end gap-2 border-t border-white/10 pt-4"
            >
              <div className="min-w-[200px] flex-1">
                <label
                  htmlFor="bandName"
                  className="mb-1 block text-xs text-white/60"
                >
                  Add test band
                </label>
                <Input
                  id="bandName"
                  value={bandName}
                  onChange={(e) => setBandName(e.target.value)}
                  placeholder="e.g. Main Band"
                  className={inputClass}
                />
              </div>
              <Button
                type="submit"
                disabled={isAddingBand || !bandName.trim()}
                className="rounded-lg bg-indigo-500 text-white hover:bg-indigo-400"
              >
                {isAddingBand ? "Adding..." : "Add band"}
              </Button>
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
}
