"use client";

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { formatRupiah } from "@/lib/utils"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

async function fetchDashboardStats() {
  const response = await fetch("/api/dashboard/stats")
  if (!response.ok) {
    throw new Error("Failed to fetch stats")
  }
  return response.json()
}

export function SectionCards() {
  const { data: stats } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: fetchDashboardStats,
    initialData: {
      totalPemasukan: 0,
      totalPengeluaran: 0,
      persentasePemasukan: 0,
      persentasePengeluaran: 0,
      saldo: 0,
      persentaseSaldo: 0,
      totalTransaksi: 0,
      persentaseTransaksi: 0,
    },
  })

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Pemasukan</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatRupiah(stats.totalPemasukan)}
          </CardTitle>
          <CardAction>
            <Badge variant={stats.persentasePemasukan >= 0 ? "outline" : "destructive"}>
              {stats.persentasePemasukan >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              {stats.persentasePemasukan}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.persentasePemasukan >= 0 ? "Meningkat" : "Menurun"} bulan ini
          </div>
          <div className="text-muted-foreground">
            Dibandingkan dengan bulan lalu
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Pengeluaran</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatRupiah(stats.totalPengeluaran)}
          </CardTitle>
          <CardAction>
            <Badge variant={stats.persentasePengeluaran <= 0 ? "outline" : "destructive"}>
              {stats.persentasePengeluaran <= 0 ? <IconTrendingDown /> : <IconTrendingUp />}
              {stats.persentasePengeluaran}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.persentasePengeluaran <= 0 ? "Menurun" : "Meningkat"} bulan ini
          </div>
          <div className="text-muted-foreground">
            Dibandingkan dengan bulan lalu
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Saldo</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatRupiah(stats.saldo)}
          </CardTitle>
          <CardAction>
            <Badge variant={stats.persentaseSaldo >= 0 ? "outline" : "destructive"}>
              {stats.persentaseSaldo >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              {stats.persentaseSaldo}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.persentaseSaldo >= 0 ? "Meningkat" : "Menurun"} bulan ini
          </div>
          <div className="text-muted-foreground">
            Selisih pemasukan dan pengeluaran
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Transaksi</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalTransaksi}
          </CardTitle>
          <CardAction>
            <Badge variant={stats.persentaseTransaksi >= 0 ? "outline" : "destructive"}>
              {stats.persentaseTransaksi >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              {stats.persentaseTransaksi}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.persentaseTransaksi >= 0 ? "Meningkat" : "Menurun"} bulan ini
          </div>
          <div className="text-muted-foreground">
            Jumlah transaksi dibandingkan bulan lalu
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
