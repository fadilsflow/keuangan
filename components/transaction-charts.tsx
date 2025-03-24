"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupiah } from "@/lib/utils";
import {
    Bar,
    BarChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
} from "recharts";

async function fetchCategoryStats() {
    const response = await fetch("/api/transactions/category-stats");
    if (!response.ok) throw new Error("Failed to fetch category stats");
    return response.json();
}

export function TransactionCharts() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ["categoryStats"],
        queryFn: fetchCategoryStats,
    });

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Pemasukan per Kategori</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={stats?.income || []}>
                            <XAxis
                                dataKey="category"
                                tickLine={false}
                                axisLine={false}
                                fontSize={12}
                            />
                            <YAxis
                                tickFormatter={(value) => formatRupiah(value)}
                                tickLine={false}
                                axisLine={false}
                                fontSize={12}
                            />
                            <Tooltip
                                formatter={(value: number) => formatRupiah(value)}
                                labelStyle={{ color: "black" }}
                            />
                            <Bar
                                dataKey="total"
                                fill="#22c55e"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Pengeluaran per Kategori</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={stats?.expense || []}>
                            <XAxis
                                dataKey="category"
                                tickLine={false}
                                axisLine={false}
                                fontSize={12}
                            />
                            <YAxis
                                tickFormatter={(value) => formatRupiah(value)}
                                tickLine={false}
                                axisLine={false}
                                fontSize={12}
                            />
                            <Tooltip
                                formatter={(value: number) => formatRupiah(value)}
                                labelStyle={{ color: "black" }}
                            />
                            <Bar
                                dataKey="total"
                                fill="#ef4444"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
} 