"use client"

import { SectionCards } from "@/components/section-cards"
import { TransactionCharts } from "@/components/transaction-charts"
import { ChartLabaRugi } from "@/components/chart-laba-rugi"
import { useState } from "react"
import { TransactionHistoryCharts } from "@/components/transaction-history-charts"
import RecentTransactions from "@/components/recent-transactions"
import { Button } from "@/components/ui/button"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { IconCirclePlusFilled } from "@tabler/icons-react"
import { startOfMonth, endOfMonth } from "date-fns"
import { DateRange } from "react-day-picker"
import Link from "next/link"

export default function Page() {
  const [date, setDate] = useState<DateRange>({
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
                  <IconCirclePlusFilled className="h-4 w-4" />
                  <span>Buat Transaksi</span>
                </Button>
              </Link>
            </div>
          </div>
          
          <div>
            <SectionCards dateRange={date} />
          </div>
          
          <div className="px-4 lg:px-6">
            <TransactionCharts dateRange={date} />
          </div>
          
          <div className="px-4 lg:px-6 grid gap-6 md:grid-cols-2">
            <ChartLabaRugi />
            <RecentTransactions />
          </div>
          
          <div className="px-4 lg:px-6">
            <TransactionHistoryCharts />
          </div>
        </div>
      </div>
    </div>
  )
}
