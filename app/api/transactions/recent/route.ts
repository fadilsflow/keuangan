import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      take: 5, // Ambil 5 transaksi terbaru
      orderBy: {
        date: 'desc'
      },
      include: {
        items: true
      }
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Failed to fetch recent transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent transactions" },
      { status: 500 }
    );
  }
} 