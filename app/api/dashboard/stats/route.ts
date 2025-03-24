import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    // Get current month transactions
    const currentMonthTransactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: new Date(currentYear, currentMonth - 1, 1),
          lt: new Date(currentYear, currentMonth, 1),
        },
      },
    });

    // Calculate current month totals
    const currentMonthStats = currentMonthTransactions.reduce(
      (acc, transaction) => {
        if (transaction.type === "pemasukan") {
          acc.totalIncome += transaction.amountTotal;
        } else {
          acc.totalExpense += transaction.amountTotal;
        }
        return acc;
      },
      { totalIncome: 0, totalExpense: 0 }
    );

    // Get last month transactions
    const lastMonthTransactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: new Date(lastMonthYear, lastMonth - 1, 1),
          lt: new Date(lastMonthYear, lastMonth, 1),
        },
      },
    });

    // Calculate last month totals
    const lastMonthStats = lastMonthTransactions.reduce(
      (acc, transaction) => {
        if (transaction.type === "pemasukan") {
          acc.totalIncome += transaction.amountTotal;
        } else {
          acc.totalExpense += transaction.amountTotal;
        }
        return acc;
      },
      { totalIncome: 0, totalExpense: 0 }
    );

    // Calculate percentages
    const persentasePemasukan = lastMonthStats.totalIncome === 0 
      ? currentMonthStats.totalIncome > 0 ? 100 : 0
      : ((currentMonthStats.totalIncome - lastMonthStats.totalIncome) / lastMonthStats.totalIncome) * 100;

    const persentasePengeluaran = lastMonthStats.totalExpense === 0
      ? currentMonthStats.totalExpense > 0 ? 100 : 0
      : ((currentMonthStats.totalExpense - lastMonthStats.totalExpense) / lastMonthStats.totalExpense) * 100;

    const currentSaldo = currentMonthStats.totalIncome - currentMonthStats.totalExpense;
    const lastSaldo = lastMonthStats.totalIncome - lastMonthStats.totalExpense;
    
    const persentaseSaldo = lastSaldo === 0
      ? currentSaldo > 0 ? 100 : currentSaldo < 0 ? -100 : 0
      : ((currentSaldo - lastSaldo) / Math.abs(lastSaldo)) * 100;

    const persentaseTransaksi = lastMonthTransactions.length === 0
      ? currentMonthTransactions.length > 0 ? 100 : 0
      : ((currentMonthTransactions.length - lastMonthTransactions.length) / lastMonthTransactions.length) * 100;

    return NextResponse.json({
      totalPemasukan: currentMonthStats.totalIncome,
      totalPengeluaran: currentMonthStats.totalExpense,
      persentasePemasukan: Math.round(persentasePemasukan * 10) / 10,
      persentasePengeluaran: Math.round(persentasePengeluaran * 10) / 10,
      saldo: currentSaldo,
      persentaseSaldo: Math.round(persentaseSaldo * 10) / 10,
      totalTransaksi: currentMonthTransactions.length,
      persentaseTransaksi: Math.round(persentaseTransaksi * 10) / 10,
    });
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
} 