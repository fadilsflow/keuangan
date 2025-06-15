import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  try {
    // Get organization ID and user ID from Clerk auth
    const { orgId } = await auth();

    // If no organization is selected, return error
    if (!orgId) {
      return NextResponse.json(
        { error: "No organization selected" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const dateFilter = {
      date: {
        ...(from && { gte: new Date(from) }),
        ...(to && { lte: new Date(to) }),
      },
    };

    // First, get all transactions with their categories
    const [incomeTransactions, expenseTransactions] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          ...dateFilter,
          type: "pemasukan",
          organizationId: orgId,
        },
        select: {
          amountTotal: true,
          category: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.transaction.findMany({
        where: {
          ...dateFilter,
          type: "pengeluaran",
          organizationId: orgId,
        },
        select: {
          amountTotal: true,
          category: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    // Process income transactions
    const incomeStats = incomeTransactions.reduce(
      (acc: { [key: string]: number }, transaction) => {
        const categoryName = transaction.category.name;
        acc[categoryName] = (acc[categoryName] || 0) + transaction.amountTotal;
        return acc;
      },
      {}
    );

    // Process expense transactions
    const expenseStats = expenseTransactions.reduce(
      (acc: { [key: string]: number }, transaction) => {
        const categoryName = transaction.category.name;
        acc[categoryName] = (acc[categoryName] || 0) + transaction.amountTotal;
        return acc;
      },
      {}
    );

    return NextResponse.json({
      income: Object.entries(incomeStats).map(([category, total]) => ({
        category,
        total,
      })),
      expense: Object.entries(expenseStats).map(([category, total]) => ({
        category,
        total,
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
