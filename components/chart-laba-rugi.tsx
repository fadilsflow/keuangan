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

    const calculations = React.useMemo(() => {
        if (!labaRugi) return {
            laba: 0,
            isProfit: false,
            percentage: 0
        };

        const totalPendapatan = labaRugi.pendapatan || 0;
        const totalPengeluaran = labaRugi.pengeluaran || 0;
        const laba = totalPendapatan - totalPengeluaran;

        const percentage = totalPendapatan === 0 ? 0 : (laba / totalPendapatan) * 100;

        return {
            laba,
            isProfit: laba >= 0,
            percentage: Math.abs(percentage)
        };
    }, [labaRugi]);

    const { laba, isProfit, percentage } = calculations;

    const chartData = React.useMemo(() => {
        if (!labaRugi) return [];
        return [
            {
                name: "Pendapatan",
                value: Math.abs(labaRugi.pendapatan || 0),
                fill: "hsl(142, 76%, 36%)"
            },
            {
                name: "Pengeluaran",
                value: Math.abs(labaRugi.pengeluaran || 0),
                fill: "hsl(346, 87%, 43%)"
            },
        ];
    }, [labaRugi]);

    const chartConfig = {
        pendapatan: {
            label: "Pendapatan",
            color: "hsl(142, 76%, 36%)",
        },
        pengeluaran: {
            label: "Pengeluaran",
            color: "hsl(346, 87%, 43%)",
        },
    } satisfies ChartConfig;

    const dateRangeText = date.from && date.to
        ? `${date.from.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`
        : "Pilih rentang tanggal";

    return (
        <Card className="w-full h-full">
            <CardHeader className="flex items-center gap-x-20 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-base font-medium">Laba Rugi</CardTitle>
                    <CardDescription>{dateRangeText}</CardDescription>
                </div>
                <DatePickerWithRange
                    date={date}
                    onDateChange={(date) => setDate(date || { from: new Date(), to: new Date() })}
                    className="w-[230px] "
                />
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: chartConfig.pendapatan.color }}></div>
                                <span className="text-sm">Pendapatan</span>
                            </div>
                            <span className="text-sm font-medium" style={{ color: chartConfig.pendapatan.color }}>
                                {formatRupiah(labaRugi?.pendapatan || 0)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: chartConfig.pengeluaran.color }}></div>
                                <span className="text-sm">Pengeluaran</span>
                            </div>
                            <span className="text-sm font-medium" style={{ color: chartConfig.pengeluaran.color }}>
                                -{formatRupiah(labaRugi?.pengeluaran || 0)}
                            </span>
                        </div>
                    </div>
                    <div className="border-t pt-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {isProfit ? (
                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                ) : (
                                    <TrendingDown className="h-4 w-4 text-red-600" />
                                )}
                                <span className="text-sm font-medium">Total {isProfit ? 'Laba' : 'Rugi'}</span>
                            </div>
                            <span className={`font-medium ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                                {formatRupiah(Math.abs(laba))}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="h-[250px]">
                    <ChartContainer config={chartConfig}>
                        <PieChart>
                            <ChartTooltip
                                cursor={false}
                                content={({ payload }) => (
                                    payload?.[0] && (
                                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                                            <div className="grid grid-cols-2 gap-2">
                                                <span className="text-sm">{payload[0].name}</span>
                                                <span className="text-sm font-medium text-right">
                                                    {payload[0].name === "Pengeluaran" ? "-" : ""}
                                                    {formatRupiah(Math.abs(payload[0].value as number))}
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
                                innerRadius={70}
                                outerRadius={90}
                                paddingAngle={2}
                                startAngle={90}
                                endAngle={450}
                            >
                                <Label
                                    content={({ viewBox }) => {
                                        if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) return null;
                                        const cx = viewBox.cx ?? 0;
                                        const cy = viewBox.cy ?? 0;
                                        return (
                                            <text
                                                x={cx}
                                                y={cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={cx}
                                                    y={cy - 10}
                                                    className={`fill-current text-xl font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}
                                                >
                                                    {percentage.toFixed(1)}%
                                                </tspan>
                                                <tspan
                                                    x={cx}
                                                    y={cy + 10}
                                                    className="fill-muted-foreground text-sm"
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