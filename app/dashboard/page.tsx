"use client"
import { AppSidebar } from "@/components/app-sidebar"

import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"

import { TransactionCharts } from "@/components/transaction-charts"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

import { ChartLabaRugi } from "@/components/chart-laba-rugi"
import { useState } from "react"
import { TransactionHistoryCharts } from "@/components/transaction-history-charts"
import RecentTransactions from "@/components/recent-transactions"



export default function Page() {
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    category: "",
    startDate: undefined,
    endDate: undefined,
  });
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <TransactionCharts />
              </div>
              <div className="px-4 lg:px-6 grid gap-6 md:grid-cols-2 ">
                <ChartLabaRugi />
                <RecentTransactions />
              </div>




              <div className="px-4 lg:px-6">
                <TransactionHistoryCharts />
              </div>


            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
