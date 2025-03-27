"use client"

import { useQuery } from "@tanstack/react-query"
import { RefreshCcw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { formatRupiah } from "@/lib/utils"
import { Button } from "./ui/button"
import { ScrollArea } from "./ui/scroll-area"

async function fetchRecentTransactions() {
    const response = await fetch("/api/transactions?limit=10")
    if (!response.ok) throw new Error("Failed to fetch transactions")
    return response.json()
}

export default function RecentTransactions() {
    const today = new Date()

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["recentTransactions"],
        queryFn: fetchRecentTransactions
    })

    const transactions = data?.data || []

    return (
        <Card className="w-full h-full flex flex-col">
            <CardHeader className="flex-none">
                <CardTitle className="mt-0 flex items-center justify-between">
                    <p>Transaksi Terakhir</p>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => refetch()}
                        className="rounded-full"
                    >
                        <RefreshCcw className="w-4 h-4" />
                    </Button>
                </CardTitle>
                <CardDescription>
                    <span className="text-sm font-medium text-muted-foreground">
                        {format(today, "EEEE, d MMMM yyyy", { locale: id })}
                    </span>
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
                <ScrollArea className="h-[calc(100%-1rem)] pr-4">
                    <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-2 top-3 bottom-3 w-[2px] bg-border" />

                        <div className="space-y-4">
                            {isLoading ? (
                                <div className="text-center py-4 text-muted-foreground">
                                    Loading...
                                </div>
                            ) : transactions.length === 0 ? (
                                <div className="text-center py-4 text-muted-foreground">
                                    Belum ada transaksi
                                </div>
                            ) : (
                                transactions.map((transaction: any) => (
                                    <div
                                        key={transaction.id}
                                        className="flex gap-4 relative pl-7 group"
                                    >
                                        {/* Timeline dot */}
                                        <div
                                            className={`absolute left-0.5 top-2 w-[15px] h-[15px] border-4 border-background rounded-full transition-all
                                                group-hover:scale-110
                                                ${transaction.type === "pemasukan"
                                                    ? "bg-green-500"
                                                    : "bg-red-500"
                                                }`}
                                        />

                                        <div className="flex-1 bg-muted/50 hover:bg-muted/70 transition-colors rounded-lg p-3 text-sm">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <p className="font-medium line-clamp-2">
                                                        {transaction.type === "pemasukan"
                                                            ? "Pemasukan dari"
                                                            : "Pengeluaran untuk"} {transaction.description}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                                                        <span className="px-2 py-0.5 rounded-full bg-muted">
                                                            {transaction.category}
                                                        </span>
                                                        <span>•</span>
                                                        <span>
                                                            {format(new Date(transaction.createdAt),
                                                                "d MMM yyyy • HH:mm",
                                                                { locale: id }
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span
                                                    className={`font-medium whitespace-nowrap
                                                        ${transaction.type === "pemasukan"
                                                            ? "text-green-600"
                                                            : "text-red-600"
                                                        }`}
                                                >
                                                    {transaction.type === "pemasukan" ? "+" : "-"}
                                                    {formatRupiah(transaction.amountTotal)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}