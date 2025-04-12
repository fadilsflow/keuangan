"use client"

import { SignUp } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { useTheme } from "next-themes"

export default function SignUpPage() {
  const { theme } = useTheme()

  return (
    <div className="container mx-auto py-8 pt-16">
      <div className="flex justify-center">
        <SignUp 
          appearance={{
            baseTheme: theme === "dark" ? dark : undefined,
            elements: {
              formButtonPrimary: 
                "bg-primary hover:bg-primary/90 text-primary-foreground",
              card: "bg-background shadow-md dark:shadow-primary/10",
              headerTitle: "text-foreground",
              headerSubtitle: "text-muted-foreground",
              socialButtonsBlockButton: 
                "text-foreground border-border hover:bg-muted",
              socialButtonsBlockButtonText: "text-foreground",
              dividerLine: "bg-border",
              dividerText: "text-muted-foreground",
              formFieldLabel: "text-foreground",
              formFieldInput: 
                "bg-background text-foreground border-input focus:ring-1 focus:ring-primary",
              footerActionLink: "text-primary hover:text-primary/90",
              formFieldInputShowPasswordButton: "text-muted-foreground",
              identityPreviewText: "text-foreground",
              identityPreviewEditButton: 
                "text-primary hover:text-primary/90",
            },
            layout: {
              socialButtonsPlacement: "bottom",
              showOptionalFields: false,
              logoPlacement: "inside",
            },
          }}
        />
      </div>
    </div>
  )
} 