"use client"

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useOrganization } from "@clerk/nextjs";
import Link from "next/link";

import { AlertCircle, ChevronRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ResponsiveOrganizationSwitcher from "@/components/responsive-organization-switcher";

export default function OrganizationPage() {

  const { organization } = useOrganization();

  return (
    <main className="mt-10 flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-4 p-4">
        <Card className="border-2 min-w-80 bg-background border-none">
          <CardHeader className="text-center text-left items-center">
            <CardTitle className="text-2xl font-bold">Select an organization</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Switch between your organizations
            </CardDescription>
            <ResponsiveOrganizationSwitcher />
          </CardHeader>

          <CardContent className="space-y-4">
      
              {!organization ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please select an organization first to access the dashboard.
                  </AlertDescription>
                </Alert>
              ) : (
                <Button 
                  asChild 
                  className="w-full font-medium group"
                >
                  <Link href="/dashboard" className="flex items-center justify-center">
                    Go to Dashboard
                    <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
} 