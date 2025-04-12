import { ModeToggle } from "@/components/mode-toggle";
import { ResponsiveUserButton } from "@/components/responsive-user-button";
import Link from "next/link";
import { Toaster } from "sonner";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    

    
    <div className="min-h-screen flex flex-col items-center bg-background">
        <header className="w-full max-w-5xl space-y-4 p-4">
            <nav className="flex container mx-auto h-16 justify-between items-center">
                <Link href="/">
                    <h1 className="text-2xl font-bold">CashLog</h1>
                </Link>
                <div className="flex items-center gap-2">
                    <ResponsiveUserButton />
                    <ModeToggle />
                </div>
            </nav>
        </header>
        <main className="flex  flex-col items-center justify-center">
          <div className="flex-1">{children}</div>
        </main>
        <Toaster />
      </div>

  );
} 