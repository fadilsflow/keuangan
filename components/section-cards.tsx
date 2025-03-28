"use client";

import { useQuery } from "@tanstack/react-query"
import { formatRupiah } from "@/lib/utils"
import { Wallet, ListOrdered, TrendingDown, TrendingUpIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"

async function fetchDashboardStats(dateRange: DateRange) {
  const params = new URLSearchParams();
  if (dateRange?.from) {
    params.append('from', dateRange.from.toISOString());
  }
  if (dateRange?.to) {
    params.append('to', dateRange.to.toISOString());
  }

  const response = await fetch(`/api/dashboard/stats?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch stats");
  }
  return response.json();
}

interface SectionCardsProps {
  dateRange: DateRange;
}

export function SectionCards({ dateRange }: SectionCardsProps) {
  const { data: stats } = useQuery({
    queryKey: ["dashboardStats", dateRange?.from, dateRange?.to],
    queryFn: () => fetchDashboardStats(dateRange),
    initialData: {
      totalPemasukan: 0,
      totalPengeluaran: 0,
      saldo: 0,
      totalTransaksi: 0,
    },
  })

  return (
    <div className="grid grid-cols-2 gap-4 px-4 lg:px-6 @xl/main:grid-cols-4 @5xl/main:grid-cols-4">
      <Card className="relative overflow-hidden">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <CardDescription className="flex items-center gap-2">
              <TrendingUpIcon className="h-4 w-4 text-green-600" />
              Total Pemasukan
            </CardDescription>
          </div>
          <CardTitle className="text-2xl font-semibold  tabular-nums @[250px]/card:text-3xl">
            {formatRupiah(stats.totalPemasukan)}
          </CardTitle>
        </CardHeader>

      </Card>
      <Card className="relative overflow-hidden">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <CardDescription className="flex items-center gap-2 ">
              <TrendingDown className="h-4 w-4  text-red-600" />
              Total Pengeluaran
            </CardDescription>
          </div>
          <CardTitle className="text-2xl font-semibold  tabular-nums @[250px]/card:text-3xl">
            {formatRupiah(stats.totalPengeluaran)}
          </CardTitle>
        </CardHeader>


      </Card>
      <Card className="relative overflow-hidden">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <CardDescription className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-blue-600" />
              Saldo
            </CardDescription>
          </div>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatRupiah(stats.saldo)}
          </CardTitle>
        </CardHeader>

      </Card>
      <Card className="relative overflow-hidden">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <CardDescription className="flex items-center gap-2">
              <ListOrdered className="h-4 w-4 text-purple-600" />
              Total Transaksi
            </CardDescription>
          </div>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalTransaksi}
          </CardTitle>
        </CardHeader>

      </Card>
    </div>
  )
}
