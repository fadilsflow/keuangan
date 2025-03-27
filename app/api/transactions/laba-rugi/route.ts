import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        if (!startDate || !endDate) {
            return NextResponse.json(
                { error: "Start date and end date are required" },
                { status: 400 }
            );
        }

        // Get transactions for the period
        const transactions = await prisma.transaction.findMany({
            where: {
                date: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
            },
            include: {
                items: true,
            },
        });

        // Calculate totals - hanya pemasukan dan pengeluaran
        const totals = transactions.reduce(
            (acc, transaction) => {
                if (transaction.type === "pemasukan") {
                    acc.pendapatan += transaction.amountTotal;
                } else {
                    acc.pengeluaran += transaction.amountTotal;
                }
                return acc;
            },
            { pendapatan: 0, pengeluaran: 0 }
        );

        // Hitung laba/rugi langsung dari selisih pemasukan dan pengeluaran
        const laba = totals.pendapatan - totals.pengeluaran;

        return NextResponse.json({
            pendapatan: totals.pendapatan,
            pengeluaran: totals.pengeluaran,
            laba,
        });
    } catch (error) {
        console.error("Failed to fetch laba rugi:", error);
        return NextResponse.json(
            { error: "Failed to fetch laba rugi" },
            { status: 500 }
        );
    }
}