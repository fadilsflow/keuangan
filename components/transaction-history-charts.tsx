"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { useQuery } from "@tanstack/react-query"
import { useIsMobile } from "@/hooks/use-mobile"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    ToggleGroup,
    ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { formatRupiah } from "@/lib/utils"
import { TooltipProps } from "recharts"

async function fetchTransactionHistory() {
    const response = await fetch("/api/transactions/history")
    if (!response.ok) throw new Error("Failed to fetch transaction history")
    return response.json()
}

const chartConfig = {
    income: {
        label: "Pemasukan",
        color: "hsl(142.1 76.2% 36.3%)", // green-600
    },
    expense: {
        label: "Pengeluaran",
        color: "hsl(346.8 77.2% 49.8%)", // red-600
    },
} satisfies ChartConfig

export function TransactionHistoryCharts() {
    const isMobile = useIsMobile()
    const [timeRange, setTimeRange] = React.useState("30d")
    const { data: transactions = [], isLoading } = useQuery({
        queryKey: ["transactionHistory", timeRange],
        queryFn: fetchTransactionHistory,
    })

    React.useEffect(() => {
        if (isMobile) {
            setTimeRange("7d")
        }
    }, [isMobile])

    const filteredData = transactions.filter((item: any) => {
        const date = new Date(item.date)
        const now = new Date()
        let daysToSubtract = 90
        if (timeRange === "30d") {
            daysToSubtract = 30
        } else if (timeRange === "7d") {
            daysToSubtract = 7
        }
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - daysToSubtract)
        return date >= startDate
    })

    if (isLoading) return <div>Loading...</div>

    return (
        <Card className="@container/card">
            <CardHeader className="relative">
                <CardTitle>Riwayat Transaksi</CardTitle>
                <CardDescription>
                    <span className="@[540px]/card:block hidden">
                        Total transaksi dalam {timeRange === "90d" ? "3 bulan" : timeRange === "30d" ? "30 hari" : "7 hari"} terakhir
                    </span>
                    <span className="@[540px]/card:hidden">
                        {timeRange === "90d" ? "3 bulan" : timeRange === "30d" ? "30 hari" : "7 hari"} terakhir
                    </span>
                </CardDescription>
                <div className="absolute right-4 top-4">
                    <ToggleGroup
                        type="single"
                        value={timeRange}
                        onValueChange={setTimeRange}
                        variant="outline"
                        className="@[767px]/card:flex hidden"
                    >
                        <ToggleGroupItem value="90d" className="h-8 px-2.5">
                            3 Bulan Terakhir
                        </ToggleGroupItem>
                        <ToggleGroupItem value="30d" className="h-8 px-2.5">
                            30 Hari Terakhir
                        </ToggleGroupItem>
                        <ToggleGroupItem value="7d" className="h-8 px-2.5">
                            7 Hari Terakhir
                        </ToggleGroupItem>
                    </ToggleGroup>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger
                            className="@[767px]/card:hidden flex w-40"
                            aria-label="Pilih rentang waktu"
                        >
                            <SelectValue placeholder="3 Bulan terakhir" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="90d" className="rounded-lg">
                                3 Bulan terakhir
                            </SelectItem>
                            <SelectItem value="30d" className="rounded-lg">
                                30 Hari terakhir
                            </SelectItem>
                            <SelectItem value="7d" className="rounded-lg">
                                7 Hari terakhir
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[250px] w-full"
                >
                    <AreaChart data={filteredData}>
                        <defs>
                            <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="hsl(142.1 76.2% 36.3%)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="hsl(142.1 76.2% 36.3%)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                            <linearGradient id="fillExpense" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="hsl(346.8 77.2% 49.8%)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="hsl(346.8 77.2% 49.8%)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value)
                                return date.toLocaleDateString("id-ID", {
                                    month: "short",
                                    day: "numeric",
                                })
                            }}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => formatRupiah(value)}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={({ active, payload, label }: TooltipProps<number, string>) => {
                                if (!active || !payload) return null

                                return (
                                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                                        <div className="font-medium">
                                            {new Date(label).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric"
                                            })}
                                        </div>
                                        {payload.map((entry, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between gap-2"
                                            >
                                                <span className="flex items-center gap-1 text-sm">
                                                    <span
                                                        className="h-2 w-2 rounded-full"
                                                        style={{
                                                            backgroundColor: entry.color
                                                        }}
                                                    />
                                                    {entry.name === "income" ? "Pemasukan" : "Pengeluaran"}
                                                </span>
                                                <span className="text-sm font-medium">
                                                    {formatRupiah(entry.value as number)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )
                            }}
                        />
                        <Area
                            dataKey="income"
                            type="monotone"
                            fill="url(#fillIncome)"
                            stroke="hsl(142.1 76.2% 36.3%)"
                            strokeWidth={2}
                        />
                        <Area
                            dataKey="expense"
                            type="monotone"
                            fill="url(#fillExpense)"
                            stroke="hsl(346.8 77.2% 49.8%)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
