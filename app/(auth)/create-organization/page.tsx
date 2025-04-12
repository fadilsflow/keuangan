"use client";

import { CreateOrganization } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

export default function CreateOrganizationPage() {
  const { theme } = useTheme();

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <CreateOrganization 
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
            rootBox: "w-full max-w-lg",
            card: "shadow-none",
            form: "gap-6",
            formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
            formFieldInput: "bg-background",
            formFieldLabel: "text-foreground",
            formFieldHintText: "text-muted-foreground",
            formFieldErrorText: "text-destructive",
            dividerLine: "bg-border",
            dividerText: "text-muted-foreground"
          }
        }}
        afterCreateOrganizationUrl="/dashboard"
      />
    </div>
  );
} 