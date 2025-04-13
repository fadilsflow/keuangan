"use client"

import { useTheme } from "next-themes";
import { OrganizationSwitcher } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function ResponsiveOrganizationSwitcher() {
    const { theme } = useTheme();
    return (
        <OrganizationSwitcher
        appearance={{
          baseTheme: theme === "dark" ? dark : undefined,
          variables: theme === "dark" ? {
            colorBackground: "#020817",
            colorInputBackground: "#020817",
            colorText: "#ffffff",
            colorTextSecondary: "#71717a",
            colorInputText: "#ffffff",
            colorPrimary: "#0ea5e9"
          } : undefined,
          elements: {
            rootBox: "w-full",
            organizationSwitcherTrigger: "w-full items-left p-0 bg-card border border-input hover:bg-accent/50 transition-colors rounded-md",
            organizationPreview: "py-2",
            organizationSwitcherPopoverCard: "shadow-lg bg-card border border-border rounded-lg",
            organizationSwitcherPopoverActions: "bg-card",
            organizationList: "bg-card",
            organizationListItem: "hover:bg-accent/50 rounded-md",
            organizationSwitcherPopoverActionButton: "hover:bg-accent/50 rounded-md",
            organizationSwitcherPopoverActionButtonText: "text-foreground",
            organizationSwitcherPopoverActionButtonIcon: "text-muted-foreground"
          }
        }}
        createOrganizationUrl="/create-organization"
        afterCreateOrganizationUrl="/switch-organization"
        afterSelectOrganizationUrl="/switch-organization"
        afterLeaveOrganizationUrl="/switch-organization"
      />
    )
}