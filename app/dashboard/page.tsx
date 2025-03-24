"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { TransactionHistoryTable } from "@/components/transaction-history-table"
import { TransactionCharts } from "@/components/transaction-charts"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { TransactionForm } from "../components/forms/TransactionForm"
import { ChartLabaRugi } from "@/components/chart-laba-rugi"

import data from "./data.json"

export default function Page() {
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
                <ChartLabaRugi />
              </div>

              <div className="px-4 lg:px-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">Rincian Transaksi per Kategori</h2>
                </div>
                <TransactionCharts />
              </div>

              <div className="px-4 lg:px-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">Transaksi Terakhir</h2>
                </div>
                <TransactionHistoryTable />
              </div>

              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DataTable data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
