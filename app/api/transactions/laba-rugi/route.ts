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

        // Calculate totals
        const totals = transactions.reduce(
            (acc, transaction) => {
                if (transaction.type === "pemasukan") {
                    acc.pendapatan += transaction.amountTotal;
                } else {
                    // Untuk pengeluaran, pisahkan antara HPP dan pengeluaran lain
                    if (transaction.category === "Bahan Baku" ||
                        transaction.category === "Tenaga Kerja" ||
                        transaction.category === "Overhead") {
                        acc.hpp += transaction.amountTotal;
                    } else {
                        acc.pengeluaran += transaction.amountTotal;
                    }
                }
                return acc;
            },
            { pendapatan: 0, hpp: 0, pengeluaran: 0 }
        );

        // Hitung laba/rugi
        const laba = totals.pendapatan - totals.hpp - totals.pengeluaran;

        return NextResponse.json({
            ...totals,
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