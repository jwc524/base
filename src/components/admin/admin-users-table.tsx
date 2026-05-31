"use client";

import { Fragment, useMemo, useState } from "react";
import { toast } from "sonner";
import { AccountType } from "@/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  adminButtonOutline,
  adminCard,
  adminInput,
  adminLabel,
  adminMuted,
  adminTableBorder,
  adminText,
} from "@/lib/admin-styles";
import { cn } from "@/lib/utils";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  accountType: AccountType;
  pricingTier: string;
  betaFeatures: string[];
  createdAt: string;
};

type AdminUsersTableProps = {
  users: AdminUserRow[];
  allFlagNames: string[];
};

export function AdminUsersTable({ users, allFlagNames }: AdminUsersTableProps) {
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rows, setRows] = useState(users);
  const [savingId, setSavingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (user) =>
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q),
    );
  }, [query, rows]);

  async function patchUser(
    id: string,
    data: { pricingTier?: string; betaFeatures?: string[] },
  ) {
    setSavingId(id);
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = (await response.json()) as {
        error?: string;
        user?: AdminUserRow;
      };
      if (!response.ok || !result.user) {
        toast.error(result.error ?? "Failed to update user");
        return;
      }
      setRows((current) =>
        current.map((user) =>
          user.id === id
            ? {
                ...user,
                pricingTier: result.user!.pricingTier,
                betaFeatures: result.user!.betaFeatures,
              }
            : user,
        ),
      );
      toast.success("User updated");
    } catch {
      toast.error("Failed to update user");
    } finally {
      setSavingId(null);
    }
  }

  function toggleLifetimeFree(user: AdminUserRow) {
    const next =
      user.pricingTier === "LIFETIME_FREE" ? "FREE" : "LIFETIME_FREE";
    void patchUser(user.id, { pricingTier: next });
  }

  function toggleBetaFeature(user: AdminUserRow, flagName: string) {
    const has = user.betaFeatures.includes(flagName);
    const betaFeatures = has
      ? user.betaFeatures.filter((f) => f !== flagName)
      : [...user.betaFeatures, flagName];
    void patchUser(user.id, { betaFeatures });
  }

  return (
    <div className="space-y-4">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name or email..."
        className={cn(adminInput, "max-w-md")}
      />

      <div className={cn(adminCard, "overflow-hidden")}>
        <Table>
          <TableHeader>
            <TableRow
              className={cn(adminTableBorder, "border-b hover:bg-transparent")}
            >
              <TableHead className={adminMuted}>Name</TableHead>
              <TableHead className={adminMuted}>Email</TableHead>
              <TableHead className={adminMuted}>Type</TableHead>
              <TableHead className={adminMuted}>Joined</TableHead>
              <TableHead className={adminMuted}>Tier</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((user) => {
              const expanded = expandedId === user.id;
              return (
                <Fragment key={user.id}>
                  <TableRow
                    className={cn(
                      adminTableBorder,
                      "cursor-pointer border-b hover:bg-zinc-800/40",
                    )}
                    onClick={() =>
                      setExpandedId(expanded ? null : user.id)
                    }
                  >
                    <TableCell className={cn("font-medium", adminText)}>
                      {user.name}
                    </TableCell>
                    <TableCell className={adminMuted}>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="border-zinc-700 text-zinc-300"
                      >
                        {user.accountType === AccountType.ARTIST
                          ? "Artist"
                          : "Musician"}
                      </Badge>
                    </TableCell>
                    <TableCell className={adminMuted}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-zinc-300">
                      {user.pricingTier}
                    </TableCell>
                  </TableRow>
                  {expanded ? (
                    <TableRow
                      key={`${user.id}-expanded`}
                      className={cn(
                        adminTableBorder,
                        "border-b bg-zinc-950/50 hover:bg-zinc-950/50",
                      )}
                    >
                      <TableCell colSpan={5} className="p-4">
                        <div className="grid gap-6 md:grid-cols-2">
                          <div>
                            <Label className={adminLabel}>Lifetime free</Label>
                            <div className="mt-2 flex items-center gap-3">
                              <Switch
                                checked={user.pricingTier === "LIFETIME_FREE"}
                                disabled={savingId === user.id}
                                onCheckedChange={() =>
                                  toggleLifetimeFree(user)
                                }
                              />
                              <span className={cn("text-sm", adminMuted)}>
                                {user.pricingTier === "LIFETIME_FREE"
                                  ? "Enabled"
                                  : "Disabled"}
                              </span>
                            </div>
                          </div>

                          <div>
                            <Label className={adminLabel}>Beta features</Label>
                            {user.betaFeatures.length > 0 ? (
                              <p className="mt-1 text-xs text-zinc-600">
                                Active: {user.betaFeatures.join(", ")}
                              </p>
                            ) : null}
                            <div className="mt-2 flex flex-wrap gap-2">
                              {allFlagNames.length === 0 ? (
                                <p className={cn("text-sm", adminMuted)}>
                                  No feature flags defined yet.
                                </p>
                              ) : (
                                allFlagNames.map((flagName) => {
                                  const active =
                                    user.betaFeatures.includes(flagName);
                                  return (
                                    <Button
                                      key={flagName}
                                      type="button"
                                      size="sm"
                                      disabled={savingId === user.id}
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleBetaFeature(user, flagName);
                                      }}
                                      className={cn(
                                        adminButtonOutline,
                                        "text-xs",
                                        active &&
                                          "border-zinc-500 bg-zinc-800 text-zinc-100",
                                      )}
                                    >
                                      {flagName}
                                    </Button>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="mt-4 font-mono text-xs text-zinc-600">
                          User ID: {user.id}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : null}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
