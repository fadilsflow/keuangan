"use client"


import { ModeToggle } from "@/components/mode-toggle";
import { ResponsiveUserButton } from "@/components/responsive-user-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@clerk/nextjs";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ArrowUpRight, Check, BarChart3, Receipt, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 flex-grow">
        {/* Header */}
        <header className="py-6">
          <nav className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold">
              CashLog
            </Link>
            <div className="flex items-center gap-4">
              <SignedOut>
                <Button variant="link" asChild>
                  <Link href="/sign-in" className="hover:no-underline">Masuk</Link>
                </Button>
                <Button asChild>
                  <Link href="/sign-up" className="rounded-full">Mulai Gratis</Link>
                </Button>
              </SignedOut>
              <SignedIn>
                <Button size="sm" className="rounded-full" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <ResponsiveUserButton />
              </SignedIn>
              <ModeToggle />
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="py-16 md:py-20 ">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Hero Text */}
            <div className="flex flex-col gap-4 ">
              <Badge className="rounded-full w-fit px-4 py-1" variant="outline">
                Kelola keuangan organisasi Anda dengan mudah
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium text-muted-foreground tracking-tight">
                Solusi Keuangan{" "}
                <br />
                <span className="text-foreground">Modern & Powerfull</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-md">
                Kelola keuangan Perusahaan Anda dengan platform yang powerful, 
                intuitif, dan aman. Buat keputusan keuangan yang lebih baik dengan mudah.
              </p>

                <SignedOut>
              <div className="flex flex-wrap gap-4 mt-2">
                <Button asChild className="rounded-full">
                  <Link href="/sign-up">
                    Mulai Gratis <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <Button variant="outline" asChild className="rounded-full">
                  <Link href="/sign-in">
                    Masuk <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              </SignedOut>

              <div className="border rounded-lg overflow-hidden mt-4 max-w-sm">
                <div className="flex justify-between items-center p-3 bg-card">
                  <code className="text-sm font-mono">Mulai kelola keuangan Anda hari ini</code>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Sepenuhnya gratis, tanpa biaya tersembunyi
              </p>
            </div>

            {/* Hero Image */}
            <div className="relative aspect-16/9 rounded-lg overflow-hidden shadow-md bg-card">
                <Image
                  src="/dashboard.png"
                  alt="Tampilan Dashboard CashLog"
                  width={1000}
                  height={1000}
                  className="object-cover p-4"
                  priority
                />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-medium mb-4">
              Fitur Lengkap untuk{" "}
              <span className="text-foreground">Keuangan Modern</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Kelola keuangan organisasi Anda dengan mudah menggunakan fitur-fitur canggih kami
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Dashboard Interaktif",
                description: "Pantau kesehatan keuangan organisasi Anda dengan dashboard yang informatif dan mudah dipahami.",
                icon: <BarChart3 className="w-8 h-8" />,
                features: [
                  "Overview keuangan real-time",
                  "Grafik transaksi interaktif",
                  "Analisis laba rugi"
                ]
              },
              {
                title: "Manajemen Transaksi",
                description: "Kelola semua transaksi keuangan dengan mudah dan terstruktur.",
                icon: <Receipt className="w-8 h-8" />,
                features: [
                  "Pencatatan transaksi cepat",
                  "Kategorisasi otomatis",
                  "Riwayat transaksi lengkap"
                ]
              },
              {
                title: "Laporan Keuangan",
                description: "Buat dan akses laporan keuangan komprehensif kapan saja.",
                icon: <FileText className="w-8 h-8" />,
                features: [
                  "Laporan laba rugi",
                  "Laporan arus kas",
                  "Export data keuangan"
                ]
              }
             
             
            ].map((feature) => (
              <Card key={feature.title} className="group hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base mt-2">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.features.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

       

     
        {/* CTA Section */}
        <section className="py-24 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-medium mb-6">
              Siap Mengubah Cara{" "}
              <span className="text-foreground">Mengelola Keuangan Anda?</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Bergabunglah dengan ribuan organisasi yang sudah menggunakan CashLog untuk mengelola keuangan mereka
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" className="rounded-full" asChild>
                <Link href="/sign-up">Mulai Gratis</Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full" asChild>
                <Link href="/docs">Pelajari Lebih Lanjut</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>&copy; {new Date().getFullYear()} CashLog</span>
            <span>•</span>
            <span>Semua hak dilindungi</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Kebijakan Privasi
            </Link>
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Syarat & Ketentuan
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
