"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"
import { DateRange } from "react-day-picker"
import { formatRupiah } from "@/lib/utils"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"

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
} from "@/components/ui/chart"

async function fetchLabaRugi(startDate: Date, endDate: Date) {
    const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
    });

    const response = await fetch(`/api/transactions/laba-rugi?${params}`);
    if (!response.ok) throw new Error("Failed to fetch laba rugi");
    return response.json();
}

export function ChartLabaRugi() {
    const [date, setDate] = React.useState<DateRange>({
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    });

    const { data: labaRugi, isLoading } = useQuery({
        queryKey: ["labaRugi", date],
        queryFn: () => {
            if (!date.from || !date.to) return Promise.reject("Date range is required");
            return fetchLabaRugi(date.from, date.to);
        },
        enabled: !!date.from && !!date.to,
    });

    const chartData = React.useMemo(() => {
        if (!labaRugi) return [];
        return [
            {
                name: "HPP",
                value: labaRugi.hpp || 0,
                fill: "hsl(25, 95%, 53%)"
            },
            {
                name: "Pendapatan",
                value: labaRugi.pendapatan || 0,
                fill: "hsl(142, 76%, 36%)"
            },
            {
                name: "Pengeluaran",
                value: labaRugi.pengeluaran || 0,
                fill: "hsl(346, 87%, 43%)"
            },
        ];
    }, [labaRugi]);

    const chartConfig = {
        hpp: {
            label: "HPP",
            color: "hsl(25, 95%, 53%)",
        },
        pendapatan: {
            label: "Pendapatan",
            color: "hsl(142, 76%, 36%)",
        },
        pengeluaran: {
            label: "Pengeluaran",
            color: "hsl(346, 87%, 43%)",
        },
    } satisfies ChartConfig;

    const isProfit = (labaRugi?.laba || 0) > 0;
    const dateRangeText = date.from && date.to
        ? `${date.from.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} - ${date.to.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
        : "Pilih rentang tanggal";

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div>
                    <CardTitle className="text-lg">Laporan Laba Rugi</CardTitle>
                    <CardDescription className="line-clamp-1">
                        {dateRangeText}
                    </CardDescription>
                </div>
                <DatePickerWithRange
                    date={date}
                    onDateChange={setDate}
                    className="w-full sm:w-auto"
                />
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-4 p-4">
                <div className="flex-1 space-y-3 min-w-0">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: chartConfig.hpp.color }}></div>
                                <span className="text-sm text-muted-foreground">HPP</span>
                            </div>
                            <span className="text-sm font-medium" style={{ color: chartConfig.hpp.color }}>
                                {formatRupiah(labaRugi?.hpp || 0)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: chartConfig.pendapatan.color }}></div>
                                <span className="text-sm text-muted-foreground">Pendapatan</span>
                            </div>
                            <span className="text-sm font-medium" style={{ color: chartConfig.pendapatan.color }}>
                                {formatRupiah(labaRugi?.pendapatan || 0)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: chartConfig.pengeluaran.color }}></div>
                                <span className="text-sm text-muted-foreground">Pengeluaran</span>
                            </div>
                            <span className="text-sm font-medium" style={{ color: chartConfig.pengeluaran.color }}>
                                {formatRupiah(labaRugi?.pengeluaran || 0)}
                            </span>
                        </div>
                    </div>
                    <div className="border-t pt-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {isProfit ? (
                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                ) : (
                                    <TrendingDown className="h-4 w-4 text-red-600" />
                                )}
                                <span className="font-medium">Laba/Rugi</span>
                            </div>
                            <span className={`font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                                {formatRupiah(labaRugi?.laba || 0)}
                            </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 text-right">
                            Periode {date.from?.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                        </div>
                    </div>
                </div>

                <div className="flex-1 min-w-0 h-64 md:h-auto">
                    <ChartContainer config={chartConfig} className="h-full">
                        <PieChart>
                            <ChartTooltip
                                cursor={false}
                                content={({ payload }) => (
                                    payload?.[0] && (
                                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                                            <div className="grid grid-cols-2 gap-2">
                                                <span className="font-medium">{payload[0].name}</span>
                                                <span className="font-medium text-right">
                                                    {formatRupiah(payload[0].value as number)}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                )}
                            />
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={2}
                            >
                                <Label
                                    content={({ viewBox }) => {
                                        if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) return null;
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className={`fill-current text-xl font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}
                                                >
                                                    {formatRupiah(labaRugi?.laba || 0)}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy + 20}
                                                    className="fill-muted-foreground text-xs"
                                                >
                                                    {isProfit ? 'Laba' : 'Rugi'}
                                                </tspan>
                                            </text>
                                        );
                                    }}
                                />
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                </div>
            </CardContent>
        </Card>
    );
}