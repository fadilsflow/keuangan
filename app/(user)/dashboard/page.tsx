"use client"

import { SectionCards } from "@/components/section-cards"
import { TransactionCharts } from "@/components/transaction-charts"
import { ChartLabaRugi } from "@/components/chart-laba-rugi"
import { useState, Suspense } from "react"
import { TransactionHistoryCharts } from "@/components/transaction-history-charts"
import RecentTransactions from "@/components/recent-transactions"
import { Button } from "@/components/ui/button"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { startOfMonth, endOfMonth } from "date-fns"
import { DateRange } from "react-day-picker"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { PlusCircleIcon } from "lucide-react"

export default function Page() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Overview</h1>
            </div>
            <div className="flex flex-col sm:flex-row w-full lg:w-auto items-start sm:items-center gap-3">
              <DatePickerWithRange date={date} setDate={setDate} />
              <Link href="/transactions/new" className="w-full sm:w-auto">
                <Button
                  className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/90 gap-1.5"
                >
                  <PlusCircleIcon className="h-4 w-4" />
                  <span>Buat Transaksi</span>
                </Button>
              </Link>
            </div>
          </div>
          
          <div>
            <Suspense fallback={<SectionCardsSkeleton />}>
              <SectionCards dateRange={date} />
            </Suspense>
          </div>
          
          <div className="px-4 lg:px-6">
            <Suspense fallback={<TransactionChartsSkeleton />}>
              <TransactionCharts dateRange={date} />
            </Suspense>
          </div>
          
          <div className="px-4 lg:px-6 grid gap-6 md:grid-cols-2">
            <Suspense fallback={<ChartLabaRugiSkeleton />}>
              <ChartLabaRugi />
            </Suspense>
            <Suspense fallback={<RecentTransactionsSkeleton />}>
              <RecentTransactions />
            </Suspense>
          </div>
          
          <div className="px-4 lg:px-6">
            <Suspense fallback={<TransactionHistoryChartsSkeleton />}>
              <TransactionHistoryCharts />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 px-4 lg:px-6 @xl/main:grid-cols-4">
      {Array(4).fill(0).map((_, i) => (
        <Card key={i} className="overflow-hidden shadow-sm">
          <CardHeader className="p-3">
            <CardDescription className="flex items-center text-xs">
              <Skeleton className="h-3 w-3 mr-1 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </CardDescription>
            <Skeleton className="h-6 w-24 mt-1" />
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}

function TransactionChartsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle><Skeleton className="h-5 w-48" /></CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle><Skeleton className="h-5 w-48" /></CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function ChartLabaRugiSkeleton() {
  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          <Skeleton className="h-5 w-24" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-36" />
        </CardDescription>
        <div className="w-full">
          <Skeleton className="h-10 w-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-2 w-2 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-2 w-2 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="border-t pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-5 w-28" />
            </div>
          </div>
        </div>
        <div className="h-[250px] flex items-center justify-center">
          <Skeleton className="h-[180px] w-[180px] rounded-full" />
        </div>
      </CardContent>
    </Card>
  )
}

function RecentTransactionsSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle><Skeleton className="h-5 w-40" /></CardTitle>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <CardDescription>
          <Skeleton className="h-4 w-64" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-border rounded-md border">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="p-4">
              <div className="grid gap-1">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3 w-16" />
                      <span>•</span>
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-24 mt-1" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function TransactionHistoryChartsSkeleton() {
  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardTitle><Skeleton className="h-5 w-40" /></CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-48" />
        </CardDescription>
        <div className="absolute right-4 top-4">
          <Skeleton className="h-8 w-40" />
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <div className="aspect-auto h-[250px] w-full flex items-center justify-center">
          <Skeleton className="h-[200px] w-full" />
        </div>
      </CardContent>
    </Card>
  )
}
