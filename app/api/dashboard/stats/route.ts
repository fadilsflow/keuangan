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

  const [pemasukan, pengeluaran] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        ...dateFilter,
        type: "pemasukan",
      },
      _sum: {
        amountTotal: true,
      },
    }),
    prisma.transaction.aggregate({
      where: {
        ...dateFilter,
        type: "pengeluaran",
      },
      _sum: {
        amountTotal: true,
      },
    }),
  ]);

  const totalTransaksi = await prisma.transaction.count({
    where: dateFilter,
  });

  return NextResponse.json({
    totalPemasukan: pemasukan._sum.amountTotal || 0,
    totalPengeluaran: pengeluaran._sum.amountTotal || 0,
    saldo: (pemasukan._sum.amountTotal || 0) - (pengeluaran._sum.amountTotal || 0),
    totalTransaksi,
  });
} 