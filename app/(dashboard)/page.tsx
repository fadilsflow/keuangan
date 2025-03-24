import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen  flex flex-col items-center justify-center">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Keuangan.</CardTitle>
            <CardDescription>Aplikasi untuk mencatat keuangan.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full " variant={"outline"} asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
