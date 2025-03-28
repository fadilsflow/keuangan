import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const dateFilter = {
    date: {
      ...(from && { gte: new Date(from) }),
      ...(to && { lte: new Date(to) }),
    },
  };

  const [income, expense] = await Promise.all([
    prisma.transaction.groupBy({
      by: ['category'],
      where: {
        ...dateFilter,
        type: 'pemasukan',
      },
      _sum: {
        amountTotal: true,
      },
    }),
    prisma.transaction.groupBy({
      by: ['category'],
      where: {
        ...dateFilter,
        type: 'pengeluaran',
      },
      _sum: {
        amountTotal: true,
      },
    }),
  ]);

  return NextResponse.json({
    income: income.map((item) => ({
      category: item.category,
      total: item._sum.amountTotal || 0,
    })),
    expense: expense.map((item) => ({
      category: item.category,
      total: item._sum.amountTotal || 0,
    })),
  });
} 