"use client";

import { useQuery } from "@tanstack/react-query";
import { formatRupiah } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { Skeleton } from "@/components/ui/skeleton";

interface CategoryItem {
    category: string;
    total: number;
}

async function fetchCategoryStats(dateRange: DateRange | undefined) {
    const params = new URLSearchParams();
    if (dateRange?.from) {
        params.append('from', dateRange.from.toISOString());
    }
    if (dateRange?.to) {
        params.append('to', dateRange.to.toISOString());
    }

    const response = await fetch(`/api/transactions/category-stats?${params.toString()}`);
    if (!response.ok) throw new Error("Failed to fetch category stats");
    return response.json();
}

interface TransactionChartsProps {
    dateRange: DateRange | undefined;
}

export function TransactionCharts({ dateRange }: TransactionChartsProps) {
    const { data: stats, isLoading } = useQuery({
        queryKey: ["categoryStats", dateRange?.from, dateRange?.to],
        queryFn: () => fetchCategoryStats(dateRange),
    });

    if (isLoading) {
        return (
            <div className="grid gap-6 md:grid-cols-2">
                <ChartSkeleton title="Pemasukan per Kategori" />
                <ChartSkeleton title="Pengeluaran per Kategori" />
            </div>
        );
    }

    const CategoryChart = ({ title, data, isIncome }: {
        title: string,
        data: CategoryItem[],
        isIncome: boolean
    }) => {
        if (!data || data.length === 0) {
            return (
                <Card>
                    <CardHeader>
                        <CardTitle>{title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-6 text-center">
                        <p className="text-muted-foreground mb-2">
                            Tidak ada data untuk periode yang dipilih
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Coba pilih periode yang berbeda atau tambahkan transaksi baru
                        </p>
                    </CardContent>
                </Card>
            );
        }

        const totalAmount = data.reduce((sum: number, item: CategoryItem) => sum + item.total, 0);

        return (
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {data.map((item: CategoryItem, index: number) => {
                        const percentage = ((item.total / totalAmount) * 100).toFixed(0);

                        return (
                            <div key={index} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        {item.category} ({percentage}%)
                                    </span>
                                    <span className="text-sm font-medium">
                                        {formatRupiah(item.total)}
                                    </span>
                                </div>

                                <div className="h-2 w-full rounded-full bg-secondary">
                                    <div
                                        className={`h-2 rounded-full ${isIncome
                                            ? 'bg-green-500'
                                            : 'bg-red-500'
                                            }`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <CategoryChart
                title="Pemasukan per Kategori"
                data={stats?.income}
                isIncome={true}
            />
            <CategoryChart
                title="Pengeluaran per Kategori"
                data={stats?.expense}
                isIncome={false}
            />
        </div>
    );
}

function ChartSkeleton({ title }: { title: string }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                        <Skeleton className="h-2 w-full" />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

export default TransactionCharts;