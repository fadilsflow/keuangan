"use client";

import { useQuery } from "@tanstack/react-query"
import { formatRupiah } from "@/lib/utils"
import { Wallet, ListOrdered, TrendingDown, TrendingUpIcon } from "lucide-react"

import {
  Card,
  CardHeader,
  CardDescription,
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
