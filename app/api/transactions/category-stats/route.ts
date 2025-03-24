import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get income by category
    const incomeByCategory = await prisma.transaction.groupBy({
      by: ['category'],
      where: {
        type: 'pemasukan',
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        amountTotal: true,
      },
    });

    // Get expense by category
    const expenseByCategory = await prisma.transaction.groupBy({
      by: ['category'],
      where: {
        type: 'pengeluaran',
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        amountTotal: true,
      },
    });

    return NextResponse.json({
      income: incomeByCategory.map(item => ({
        category: item.category,
        total: item._sum.amountTotal || 0,
      })),
      expense: expenseByCategory.map(item => ({
        category: item.category,
        total: item._sum.amountTotal || 0,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch category stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch category stats" },
      { status: 500 }
    );
  }
} 