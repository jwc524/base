"use client";

import { OrganizationSwitcher } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { cn } from "@/lib/utils";

const orgSwitcherAppearance = {
  theme: dark,
  variables: {
    colorBackground: "#12121a",
    colorForeground: "#ffffff",
    colorMutedForeground: "rgba(255, 255, 255, 0.6)",
    colorInput: "rgba(255, 255, 255, 0.05)",
    colorInputForeground: "#ffffff",
    colorPrimary: "#6366f1",
    colorPrimaryForeground: "#ffffff",
    colorNeutral: "rgba(255, 255, 255, 0.08)",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: {
      width: "100%",
    },
    organizationSwitcherTrigger: {
      width: "100%",
      color: "#ffffff",
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "0.5rem",
      padding: "0.5rem 0.75rem",
      boxShadow: "none",
      "&:hover": {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
      },
    },
    organizationSwitcherTriggerIcon: {
      color: "rgba(255, 255, 255, 0.5)",
    },
    organizationPreviewTextContainer: {
      color: "#ffffff",
    },
    organizationPreviewMainIdentifier: {
      color: "#ffffff",
      fontWeight: 500,
    },
    organizationPreviewSecondaryIdentifier: {
      color: "rgba(255, 255, 255, 0.5)",
    },
    organizationSwitcherPopoverCard: {
      backgroundColor: "#12121a",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "0.75rem",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    },
    organizationSwitcherPopoverActionButton: {
      color: "rgba(255, 255, 255, 0.85)",
      "&:hover": {
        backgroundColor: "rgba(255, 255, 255, 0.05)",
      },
    },
    organizationSwitcherPopoverActionButtonText: {
      color: "rgba(255, 255, 255, 0.85)",
    },
    organizationSwitcherPopoverActionButtonIcon: {
      color: "rgba(255, 255, 255, 0.5)",
    },
    organizationSwitcherPopoverFooter: {
      borderTop: "1px solid rgba(255, 255, 255, 0.1)",
      backgroundColor: "transparent",
    },
    organizationSwitcherPopoverFooterAction: {
      color: "#818cf8",
    },
    organizationSwitcherPreviewButton: {
      color: "#ffffff",
    },
    organizationSwitcherListedOrganization: {
      color: "#ffffff",
    },
    organizationSwitcherActiveOrganization: {
      color: "#ffffff",
      backgroundColor: "rgba(99, 102, 241, 0.15)",
    },
  },
} as const;

type SidebarOrganizationSwitcherProps = {
  className?: string;
  compact?: boolean;
};

export function SidebarOrganizationSwitcher({
  className,
  compact = false,
}: SidebarOrganizationSwitcherProps) {
  return (
    <div className={cn("min-w-0 [&_.cl-organizationPreview]:text-white", className)}>
      <OrganizationSwitcher
        hidePersonal
        afterCreateOrganizationUrl="/organizations"
        appearance={{
          ...orgSwitcherAppearance,
          elements: {
            ...orgSwitcherAppearance.elements,
            organizationSwitcherTrigger: {
              ...orgSwitcherAppearance.elements.organizationSwitcherTrigger,
              height: compact ? "2.25rem" : "2.5rem",
            },
          },
        }}
      />
    </div>
  );
}
