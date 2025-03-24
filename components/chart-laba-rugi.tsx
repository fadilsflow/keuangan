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
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
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
            { name: "HPP", value: labaRugi.hpp || 0, fill: "hsl(var(--chart-1))" },
            { name: "Pendapatan", value: labaRugi.pendapatan || 0, fill: "hsl(var(--chart-2))" },
            { name: "Pengeluaran", value: labaRugi.pengeluaran || 0, fill: "hsl(var(--chart-3))" },
        ];
    }, [labaRugi]);

    const chartConfig = {
        hpp: {
            label: "HPP",
            color: "hsl(var(--chart-1))",
        },
        pendapatan: {
            label: "Pendapatan",
            color: "hsl(var(--chart-2))",
        },
        pengeluaran: {
            label: "Pengeluaran",
            color: "hsl(var(--chart-3))",
        },
    } satisfies ChartConfig;

    const isProfit = (labaRugi?.laba || 0) > 0;

    return (
        <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                    <CardTitle>Laporan Laba Rugi</CardTitle>
                    <CardDescription>
                        {date.from && date.to ? (
                            <>
                                {date.from.toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })} - {date.to.toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </>
                        ) : (
                            "Pilih rentang tanggal"
                        )}
                    </CardDescription>
                </div>
                <DatePickerWithRange
                    date={date}
                    onDateChange={setDate}
                />
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
                <div className="space-y-4">
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">HPP</span>
                            <span className="text-sm font-medium">{formatRupiah(labaRugi?.hpp || 0)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Pendapatan</span>
                            <span className="text-sm font-medium text-green-600">{formatRupiah(labaRugi?.pendapatan || 0)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Pengeluaran</span>
                            <span className="text-sm font-medium text-red-600">{formatRupiah(labaRugi?.pengeluaran || 0)}</span>
                        </div>
                        <div className="border-t pt-2">
                            <div className="flex items-center justify-between font-medium">
                                <span>Laba/Rugi</span>
                                <span className={isProfit ? 'text-green-600' : 'text-red-600'}>
                                    {formatRupiah(labaRugi?.laba || 0)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <ChartContainer config={chartConfig} className="aspect-square">
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={({ payload }) => {
                                if (payload && payload[0]) {
                                    return (
                                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                                            <div className="grid grid-cols-2 gap-2">
                                                <span className="font-medium">{payload[0].name}</span>
                                                <span className="font-medium">{formatRupiah(payload[0].value as number)}</span>
                                            </div>
                                        </div>
                                    )
                                }
                                return null
                            }}
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
                                                className={`fill-current text-2xl font-bold ${isProfit ? 'text-green-600' : 'text-red-600'
                                                    }`}
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
            </CardContent>
            <CardFooter className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                    {isProfit ? (
                        <>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="text-green-600">Profit</span>
                        </>
                    ) : (
                        <>
                            <TrendingDown className="h-4 w-4 text-red-600" />
                            <span className="text-red-600">Loss</span>
                        </>
                    )}
                </div>
                <span className="text-xs text-muted-foreground">
                    Data periode {date.from?.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                </span>
            </CardFooter>
        </Card>
    );
}
