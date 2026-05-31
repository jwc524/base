"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AccountType } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  adminButton,
  adminButtonOutline,
  adminCard,
  adminInput,
  adminLabel,
  adminMuted,
  adminText,
} from "@/lib/admin-styles";
import { cn } from "@/lib/utils";

export type AdminFlag = {
  id: string;
  name: string;
  description: string | null;
  enabledForAll: boolean;
  enabledUserIds: string[];
  enabledAccountTypes: AccountType[];
};

export function AdminFlagsPanel({ initialFlags }: { initialFlags: AdminFlag[] }) {
  const [flags, setFlags] = useState(initialFlags);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [userIdInputs, setUserIdInputs] = useState<Record<string, string>>({});

  async function refreshFlags() {
    const response = await fetch("/api/admin/flags");
    const data = (await response.json()) as { flags?: AdminFlag[] };
    if (data.flags) setFlags(data.flags);
  }

  async function createFlag(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const response = await fetch("/api/admin/flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        toast.error(data.error ?? "Failed to create flag");
        return;
      }
      setName("");
      setDescription("");
      toast.success("Flag created");
      await refreshFlags();
    } finally {
      setCreating(false);
    }
  }

  async function updateFlag(id: string, patch: Partial<AdminFlag>) {
    const response = await fetch("/api/admin/flags", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    const data = (await response.json()) as { error?: string; flag?: AdminFlag };
    if (!response.ok || !data.flag) {
      toast.error(data.error ?? "Failed to update flag");
      return;
    }
    setFlags((current) =>
      current.map((flag) => (flag.id === id ? data.flag! : flag)),
    );
    toast.success("Flag updated");
  }

  async function deleteFlag(id: string) {
    const response = await fetch(`/api/admin/flags?id=${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      toast.error("Failed to delete flag");
      return;
    }
    setFlags((current) => current.filter((flag) => flag.id !== id));
    toast.success("Flag deleted");
  }

  function toggleAccountType(flag: AdminFlag, type: AccountType) {
    const types = flag.enabledAccountTypes.includes(type)
      ? flag.enabledAccountTypes.filter((t) => t !== type)
      : [...flag.enabledAccountTypes, type];
    void updateFlag(flag.id, { enabledAccountTypes: types });
  }

  function addUserId(flag: AdminFlag) {
    const userId = userIdInputs[flag.id]?.trim();
    if (!userId || flag.enabledUserIds.includes(userId)) return;
    void updateFlag(flag.id, {
      enabledUserIds: [...flag.enabledUserIds, userId],
    });
    setUserIdInputs((current) => ({ ...current, [flag.id]: "" }));
  }

  function removeUserId(flag: AdminFlag, userId: string) {
    void updateFlag(flag.id, {
      enabledUserIds: flag.enabledUserIds.filter((id) => id !== userId),
    });
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={createFlag}
        className={cn(adminCard, "space-y-4 p-6")}
      >
        <h2 className={cn("text-sm font-medium", adminText)}>Create flag</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="flag-name" className={adminLabel}>
              Name
            </Label>
            <Input
              id="flag-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={adminInput}
              placeholder="new_dashboard"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="flag-desc" className={adminLabel}>
              Description
            </Label>
            <Textarea
              id="flag-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={adminInput}
              rows={2}
            />
          </div>
        </div>
        <Button type="submit" disabled={creating} className={adminButton}>
          {creating ? "Creating..." : "Create flag"}
        </Button>
      </form>

      <div className="space-y-4">
        {flags.length === 0 ? (
          <p className={cn(adminCard, "p-6", adminMuted)}>
            No feature flags yet.
          </p>
        ) : (
          flags.map((flag) => (
            <div key={flag.id} className={cn(adminCard, "space-y-4 p-6")}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className={cn("font-semibold", adminText)}>{flag.name}</h3>
                  {flag.description ? (
                    <p className={cn("mt-1 text-sm", adminMuted)}>
                      {flag.description}
                    </p>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => deleteFlag(flag.id)}
                  className="rounded-md border-red-900/50 text-red-400 hover:bg-red-950/50"
                >
                  Delete
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  checked={flag.enabledForAll}
                  onCheckedChange={(checked) =>
                    updateFlag(flag.id, { enabledForAll: checked })
                  }
                />
                <span className={cn("text-sm", adminText)}>Enabled for all</span>
              </div>

              <div>
                <p className={cn("mb-2 text-sm", adminMuted)}>Account types</p>
                <div className="flex gap-4">
                  {[AccountType.MUSICIAN, AccountType.ARTIST].map((type) => (
                    <label
                      key={type}
                      className={cn("flex items-center gap-2 text-sm", adminText)}
                    >
                      <Checkbox
                        checked={flag.enabledAccountTypes.includes(type)}
                        onCheckedChange={() => toggleAccountType(flag, type)}
                      />
                      {type === AccountType.ARTIST ? "Artist" : "Musician"}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className={cn("mb-2 text-sm", adminMuted)}>Enabled user IDs</p>
                <div className="flex flex-wrap gap-2">
                  {flag.enabledUserIds.map((userId) => (
                    <span
                      key={userId}
                      className="inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-800/80 px-2 py-1 font-mono text-xs text-zinc-300"
                    >
                      {userId}
                      <button
                        type="button"
                        onClick={() => removeUserId(flag, userId)}
                        className="text-zinc-500 hover:text-zinc-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <Input
                    value={userIdInputs[flag.id] ?? ""}
                    onChange={(e) =>
                      setUserIdInputs((current) => ({
                        ...current,
                        [flag.id]: e.target.value,
                      }))
                    }
                    placeholder="User ID (cuid)"
                    className={cn(adminInput, "max-w-xs font-mono text-xs")}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => addUserId(flag)}
                    className={adminButtonOutline}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
