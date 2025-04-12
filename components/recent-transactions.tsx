"use client"

import { useQuery } from "@tanstack/react-query"
import { RefreshCcw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { format, parseISO } from "date-fns"
import { id } from "date-fns/locale"
import { formatRupiah } from "@/lib/utils"
import { Button } from "./ui/button"
import { ScrollArea } from "./ui/scroll-area"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Skeleton } from "./ui/skeleton"

async function fetchRecentTransactions() {
    const response = await fetch("/api/transactions/recent")
    if (!response.ok) throw new Error("Failed to fetch recent transactions")
    return response.json()
}

export default function RecentTransactions() {
    const { data: transactions = [], isLoading, refetch } = useQuery({
        queryKey: ["recentTransactions"],
        queryFn: fetchRecentTransactions
    })

    // Show only 5 transactions initially
    const displayedTransactions = transactions.slice(0, 5)
    const hasMoreTransactions = transactions.length > 5

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Transaksi Terbaru</CardTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => refetch()}
                        className="rounded-full"
                    >
                        <RefreshCcw className="h-4 w-4" />
                    </Button>
                </div>
                <CardDescription>
                    Transaksi yang baru saja dibuat atau diperbarui
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="divide-y divide-border rounded-md border">
                    {isLoading ? (
                        <>
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
                        </>
                    ) : displayedTransactions.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            Tidak ada transaksi terbaru
                        </div>
                    ) : (
                        <>
                            {displayedTransactions.map((transaction: any) => (
                                <div key={transaction.id} className="p-4">
                                    <div className="grid gap-1">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-sm font-medium leading-none">
                                                    {transaction.description}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        {transaction.category}
                                                    </p>
                                                    <span>•</span>
                                                    <p className="text-sm text-muted-foreground">
                                                        {transaction.relatedParty}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <div
                                                    className={`flex items-center gap-1 text-sm font-medium ${transaction.type === "pemasukan"
                                                        ? "text-green-600"
                                                        : "text-red-600"
                                                        }`}
                                                >
                                                    {transaction.type === "pemasukan" ? (
                                                        <TrendingUp className="h-4 w-4" />
                                                    ) : (
                                                        <TrendingDown className="h-4 w-4" />
                                                    )}
                                                    {formatRupiah(transaction.amountTotal)}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span>•</span>
                                                    <span>
                                                        {format(
                                                            parseISO(transaction.createdAt),
                                                            "d MMM yyyy • HH:mm",
                                                            { locale: id }
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {hasMoreTransactions && (
                                <Button
                                    variant="ghost"
                                    className="w-full h-10 hover:bg-muted/50"
                                    asChild
                                >
                                    <a href="/transactions">
                                        Lihat Semua Transaksi
                                    </a>
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}