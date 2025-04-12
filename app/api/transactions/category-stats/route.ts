import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  try {
    // Get organization ID and user ID from Clerk auth
    const { orgId, userId } = await auth();
    
    // If no organization is selected, return error
    if (!orgId) {
      return NextResponse.json(
        { error: "No organization selected" },
        { status: 403 }
      );
    }

    // If no user is authenticated, return error
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

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
          organizationId: orgId,
          userId: userId
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
          organizationId: orgId,
          userId: userId
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
  } catch (error) {
    console.error("Error fetching category stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch category stats" },
      { status: 500 }
    );
  }
} 