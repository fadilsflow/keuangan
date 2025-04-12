import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";


export default function Home() {
  return (
    <div className="min-h-screen  flex flex-col items-center justify-center">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">CashLog.</CardTitle>
            <CardDescription>Aplikasi untuk mencatat keuangan.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button className="w-full " variant={"outline"} asChild>
            <SignedOut>
              <Button variant={"outline"} asChild><SignInButton /></Button>
              <Button variant={"outline"} asChild ><SignUpButton /></Button>
          </SignedOut>
            </Button>
            <SignedIn>
            <Button asChild><Link href="/dashboard">Dashboard</Link></Button>
          </SignedIn>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
