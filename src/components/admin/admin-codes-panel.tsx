"use client";

import { useState } from "react";
import { toast } from "sonner";
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
  adminButton,
  adminButtonOutline,
  adminCard,
  adminInput,
  adminLabel,
  adminMuted,
  adminTableBorder,
  adminText,
} from "@/lib/admin-styles";
import { cn } from "@/lib/utils";

export type AdminDiscountCode = {
  id: string;
  code: string;
  discountPercent: number;
  maxUses: number | null;
  usedCount: number;
  isLifetimeFree: boolean;
  expiresAt: string | null;
  createdAt: string;
};

function getCodeStatus(code: AdminDiscountCode) {
  if (code.expiresAt && new Date(code.expiresAt) < new Date()) {
    return "Expired";
  }
  if (code.maxUses !== null && code.usedCount >= code.maxUses) {
    return "Exhausted";
  }
  return "Active";
}

export function AdminCodesPanel({
  initialCodes,
}: {
  initialCodes: AdminDiscountCode[];
}) {
  const [codes, setCodes] = useState(initialCodes);
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("100");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isLifetimeFree, setIsLifetimeFree] = useState(false);
  const [creating, setCreating] = useState(false);

  async function createCode(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const response = await fetch("/api/admin/codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim() || undefined,
          discountPercent: Number(discountPercent),
          maxUses: maxUses ? Number(maxUses) : null,
          expiresAt: expiresAt || null,
          isLifetimeFree,
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        code?: AdminDiscountCode;
      };
      if (!response.ok || !data.code) {
        toast.error(data.error ?? "Failed to create code");
        return;
      }
      setCodes((current) => [data.code!, ...current]);
      setCode("");
      setMaxUses("");
      setExpiresAt("");
      setIsLifetimeFree(false);
      toast.success(`Code created: ${data.code.code}`);
    } finally {
      setCreating(false);
    }
  }

  async function deleteCode(id: string) {
    const response = await fetch(`/api/admin/codes?id=${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      toast.error("Failed to delete code");
      return;
    }
    setCodes((current) => current.filter((c) => c.id !== id));
    toast.success("Code deleted");
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={createCode}
        className={cn(adminCard, "space-y-4 p-6")}
      >
        <h2 className={cn("text-sm font-medium", adminText)}>Generate code</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label className={adminLabel}>Code (optional)</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Auto-generate if empty"
              className={cn(adminInput, "font-mono uppercase")}
            />
          </div>
          <div className="space-y-2">
            <Label className={adminLabel}>Discount %</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              className={adminInput}
            />
          </div>
          <div className="space-y-2">
            <Label className={adminLabel}>Max uses</Label>
            <Input
              type="number"
              min={1}
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              placeholder="Unlimited"
              className={adminInput}
            />
          </div>
          <div className="space-y-2">
            <Label className={adminLabel}>Expires</Label>
            <Input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className={adminInput}
            />
          </div>
          <div className="flex items-end gap-3 pb-1">
            <Switch
              checked={isLifetimeFree}
              onCheckedChange={setIsLifetimeFree}
            />
            <Label className={adminLabel}>Lifetime free</Label>
          </div>
        </div>
        <Button type="submit" disabled={creating} className={adminButton}>
          {creating ? "Creating..." : "Generate code"}
        </Button>
      </form>

      <div className={cn(adminCard, "overflow-hidden")}>
        <Table>
          <TableHeader>
            <TableRow
              className={cn(adminTableBorder, "border-b hover:bg-transparent")}
            >
              <TableHead className={adminMuted}>Code</TableHead>
              <TableHead className={adminMuted}>Discount</TableHead>
              <TableHead className={adminMuted}>Uses</TableHead>
              <TableHead className={adminMuted}>Expires</TableHead>
              <TableHead className={adminMuted}>Status</TableHead>
              <TableHead className={adminMuted} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {codes.map((row) => {
              const status = getCodeStatus(row);
              return (
                <TableRow
                  key={row.id}
                  className={cn(adminTableBorder, "border-b")}
                >
                  <TableCell className={cn("font-mono font-medium", adminText)}>
                    {row.code}
                  </TableCell>
                  <TableCell className="text-zinc-300">
                    {row.discountPercent}%
                    {row.isLifetimeFree ? (
                      <span className="ml-2 text-xs text-amber-500/80">
                        lifetime
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-zinc-300">
                    {row.usedCount}
                    {row.maxUses !== null ? ` / ${row.maxUses}` : " / ∞"}
                  </TableCell>
                  <TableCell className={adminMuted}>
                    {row.expiresAt
                      ? new Date(row.expiresAt).toLocaleString()
                      : "Never"}
                  </TableCell>
                  <TableCell className="text-zinc-300">{status}</TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => deleteCode(row.id)}
                      className="rounded-md border-red-900/50 text-red-400 hover:bg-red-950/50"
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
