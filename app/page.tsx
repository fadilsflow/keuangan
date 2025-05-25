"use client"


import { ModeToggle } from "@/components/mode-toggle";
import { ResponsiveUserButton } from "@/components/responsive-user-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@clerk/nextjs";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex items-center flex-col min-h-screen">
      {/* Header */}
      <header className="w-full space-y-4 ">
            <nav className="flex px-4 border-b container mx-auto h-16 justify-between items-center">
                <Link href="/">
                    <h1 className="text-2xl font-bold">CashLog</h1>
                </Link>
                <div className="flex items-center gap-2">
                <SignedOut>
                  <Button variant="link" asChild>
                    <Link href="/sign-in" className="hover:no-underline" >Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/sign-up" className="border-lg rounded-xl">Get Started</Link>
                  </Button>
                </SignedOut>
                    <SignedIn>
              <Button size="sm"className="rounded-xl " asChild>
                <Link href="/dashboard">
                  Go to Dashboard
                </Link>
              </Button>
              <ResponsiveUserButton/>
            </SignedIn>
            <ModeToggle/>
                    {/* <ResponsiveUserButton /> */}
                </div>
            </nav>
        </header>

      {/* Hero Section */}
      <section className="py-20 px-4">

        <div className="container flex flex-col items-center text-center space-y-8">
          <div className="flex flex-col items-center gap-2">
         <Badge variant="default" className="rounded-full "> CashLog is now available for free! </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight max-w-3xl">
            Manage Your Organization's Finances with Ease
          </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Simple, powerful, and modern financial management for organizations of all sizes.
          </p>
          <div className="flex gap-4">
            <SignedOut>
              <Button size="lg" className="rounded-xl" asChild>
                <Link href="/sign-up">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-xl" asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
            </SignedOut>
          
          </div>
        </div>
      </section>
      <footer>
        <div className="container mx-auto"> 
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} CashLog. All rights reserved.
          </p>
        </div>
      </footer>

     
    </div>
  );
}
