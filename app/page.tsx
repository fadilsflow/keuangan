"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { ResponsiveUserButton } from "@/components/responsive-user-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@clerk/nextjs";

import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  ArrowUpRight,
  Check,
  BarChart3,
  Receipt,
  FileText,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

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
                  <Link href="/sign-in" className="hover:no-underline">
                    Sign In
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/sign-up" className="rounded-full">
                    Sign Up
                  </Link>
                </Button>
              </SignedOut>
              <SignedIn>
                <Button size="sm" className="rounded-full" asChild>
                  <Link href="/dashboard">Masuk</Link>
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
                Catat pemasukan & pengeluaran dengan mudah
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium text-muted-foreground tracking-tight">
                Pencatatan Keuangan <br />
                <span className="text-foreground">Simpel & Terorganisir</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-md">
                Catat setiap transaksi keuangan dengan mudah. Monitor pemasukan
                dan pengeluaran untuk kontrol keuangan yang lebih baik.
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
                  <code className="text-sm font-mono">
                    Mulai kelola keuangan Anda hari ini
                  </code>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Sepenuhnya gratis, tanpa biaya tersembunyi
              </p>
            </div>

            {/* Hero Image */}
            <div className="relative aspect-16/9 rounded-lg overflow-hidden shadow-md bg-card">
              <Image
                src="https://res.cloudinary.com/dxurnpbrc/image/upload/v1748188613/dashboard-ss_v35hqa.png"
                alt="Tampilan Dashboard CashLog"
                width={1000}
                height={1000}
                className=" p-4"
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
              Kelola keuangan organisasi Anda dengan mudah menggunakan
              fitur-fitur canggih kami
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Pencatatan Transaksi",
                description:
                  "Catat pemasukan dan pengeluaran dengan cepat dan mudah.",
                icon: <Receipt className="w-8 h-8" />,
                features: [
                  "Input transaksi yang simpel",
                  "Kategorisasi pemasukan & pengeluaran",
                  "Upload bukti transaksi",
                ],
              },
              {
                title: "Ringkasan Cashflow",
                description:
                  "Lihat ringkasan arus kas secara real-time dan terperinci.",
                icon: <BarChart3 className="w-8 h-8" />,
                features: [
                  "Total pemasukan & pengeluaran",
                  "Grafik tren cashflow",
                  "Analisis per kategori",
                ],
              },
              {
                title: "Laporan & Ekspor",
                description:
                  "Buat laporan keuangan dan ekspor data dengan mudah.",
                icon: <FileText className="w-8 h-8" />,
                features: [
                  "Laporan cashflow bulanan",
                  "Filter berdasarkan kategori",
                  "Ekspor ke Excel/PDF",
                ],
              },
            ].map((feature) => (
              <Card
                key={feature.title}
                className="group hover:border-primary/50 transition-colors"
              >
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
                      <li
                        key={item}
                        className="flex items-center gap-2 text-sm"
                      >
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
              Mulai Catat{" "}
              <span className="text-foreground">Keuangan Anda Sekarang</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Bergabung dengan pengguna lain yang telah berhasil mengelola
              cashflow mereka dengan CashLog
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" className="rounded-full" asChild>
                <Link href="/sign-up">Mulai Gratis</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full"
                asChild
              >
                <Link href="/docs">Pelajari Lebih Lanjut</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-center text-sm text-muted-foreground">
          &copy; CashLog {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
