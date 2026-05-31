"use client";

import { useOrganization } from "@clerk/nextjs";
import { useEffect } from "react";

export function useSyncOrganization() {
  const { organization, isLoaded } = useOrganization();

  useEffect(() => {
    if (!isLoaded || !organization) return;

    void fetch("/api/organizations/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: organization.id,
        name: organization.name,
      }),
    }).catch((error) => {
      console.error("Failed to sync organization:", error);
    });
  }, [isLoaded, organization?.id, organization?.name]);
}
