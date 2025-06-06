"use client";

import { useQuery } from "@tanstack/react-query"
import { formatRupiah } from "@/lib/utils"
import { Wallet, ListOrdered, TrendingDown, TrendingUpIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { useOrganization } from "@clerk/nextjs"

import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

async function fetchDashboardStats(dateRange: DateRange | undefined, organizationId: string | undefined) {
  const params = new URLSearchParams();
  if (dateRange?.from) {
    params.append('from', dateRange.from.toISOString());
  }
  if (dateRange?.to) {
    params.append('to', dateRange.to.toISOString());
  }
  if (organizationId) {
    params.append('organizationId', organizationId);
  }

  const response = await fetch(`/api/dashboard/stats?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch stats");
  }
  return response.json();
}

interface SectionCardsProps {
  dateRange: DateRange | undefined;
}

export function SectionCards({ dateRange }: SectionCardsProps) {
  const { organization } = useOrganization();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboardStats", dateRange?.from, dateRange?.to, organization?.id],
    queryFn: () => fetchDashboardStats(dateRange, organization?.id),
    initialData: {
      totalPemasukan: 0,
      totalPengeluaran: 0,
      saldo: 0,
      totalTransaksi: 0,
    },
  })

  const cards = [
    {
      title: "Pemasukan",
      icon: <TrendingUpIcon className="h-3 w-3 mr-1 text-green-600" />,
      value: isLoading ? null : stats.totalPemasukan,
      formatter: formatRupiah,
      skeletonWidth: "w-28",
      color: "text-green-600",
      showCurrency: true
    },
    {
      title: "Pengeluaran",
      icon: <TrendingDown className="h-3 w-3 mr-1 text-red-600" />,
      value: isLoading ? null : stats.totalPengeluaran,
      formatter: formatRupiah,
      skeletonWidth: "w-28",
      color: "text-red-600",
      showCurrency: true
    },
    {
      title: "Saldo",
      icon: <Wallet className="h-3 w-3 mr-1 text-blue-600" />,
      value: isLoading ? null : stats.saldo,
      formatter: formatRupiah,
      skeletonWidth: "w-28",
      color: "text-blue-600",
      showCurrency: true
    },
    {
      title: "Transaksi",
      icon: <ListOrdered className="h-3 w-3 mr-1 text-purple-600" />,
      value: isLoading ? null : stats.totalTransaksi,
      formatter: (val: number) => val.toString(),
      skeletonWidth: "w-12",
      color: "text-purple-600",
      showCurrency: false
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 @xl/main:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index} className="overflow-hidden shadow-sm">
          <CardHeader >
            <CardDescription className="flex items-center text-xs">
              {card.icon}
              <span className="text-sm font-medium">{card.title}</span>
            </CardDescription>
            {isLoading ? (
              <div className="mt-1">
                {card.showCurrency ? (
                  <div className={`flex items-center ${card.color}`}>
                    <span className="text-base font-medium">Rp</span>
                    <div className="ml-1 flex-1">
                      <Skeleton className={`h-5 ${card.skeletonWidth}`} />
                    </div>
                  </div>
                ) : (
                  <Skeleton className={`h-5 ${card.skeletonWidth}`} />
                )}
              </div>
            ) : (
              <CardTitle className="text-base font-medium tabular-nums truncate">
                {card.formatter(card.value)}
              </CardTitle>
            )}
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
