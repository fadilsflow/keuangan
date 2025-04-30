"use client";

import { SignedIn, UserButton } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { dark } from "@clerk/themes";

export function ResponsiveUserButton() {
  const { theme } = useTheme();
  return (
    <SignedIn>
      <UserButton
        appearance={{
          baseTheme: theme === "dark" ? dark : undefined,
          variables:
            theme === "dark"
              ? {
                  colorBackground: "#020817",
                  colorInputBackground: "#020817",
                  colorText: "#ffffff",
                  colorTextSecondary: "#71717a",
                  colorInputText: "#ffffff",
                  colorPrimary: "#0ea5e9",
                }
              : undefined,
          elements: {
            avatarBox: "h-8 w-8",
            card: "bg-background border border-border shadow-lg",
            userPreview: "bg-background",
            userPreviewAvatarBox: "h-12 w-12",
            userPreviewTextContainer: "text-foreground",
            userPreviewSecondaryIdentifier: "text-muted-foreground",
            userButtonPopoverCard:
              "bg-background border border-border shadow-lg",
            userButtonPopoverActions: "bg-background",
            userButtonPopoverActionButton: "hover:bg-accent",
            userButtonPopoverActionButtonText: "text-foreground",
            userButtonPopoverActionButtonIcon: "text-muted-foreground",
          },
        }}
        afterSignOutUrl="/"
        userProfileMode="navigation"
        userProfileUrl="/user-profile"
      />
    </SignedIn>
  );
}
