"use client";

import { useQuery } from "@tanstack/react-query";
import { formatRupiah } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface CategoryItem {
    category: string;
    total: number;
}

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

    const CategoryChart = ({ title, data, isIncome }: {
        title: string,
        data: CategoryItem[],
        isIncome: boolean
    }) => {
        if (!data || data.length === 0) return null;

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

export default TransactionCharts;