import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, startOfYear, endOfYear, parseISO } from "date-fns";

export async function GET(request: Request) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get("type");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!reportType || !startDate || !endDate) {
      return new NextResponse("Missing required parameters", { status: 400 });
    }

    const start = parseISO(startDate);
    const end = parseISO(endDate);

    let reportData;

    switch (reportType) {
      case "monthly":
        reportData = await generateMonthlyReport(orgId, start, end);
        break;
      case "category":
        reportData = await generateCategoryReport(orgId, start, end);
        break;
      case "yearly":
        reportData = await generateYearlyReport(orgId, start, end);
        break;
      case "related-party":
        reportData = await generateRelatedPartyReport(orgId, start, end);
        break;
      default:
        return new NextResponse("Invalid report type", { status: 400 });
    }

    return NextResponse.json(reportData);
  } catch (error) {
    console.error("Report generation error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function generateMonthlyReport(orgId: string, startDate: Date, endDate: Date) {
  const transactions = await prisma.transaction.findMany({
    where: {
      organizationId: orgId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      date: true,
      type: true,
      amountTotal: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  // Group transactions by month
  const monthlyData = transactions.reduce((acc: any, transaction) => {
    const month = transaction.date.getMonth();
    const year = transaction.date.getFullYear();
    const key = `${year}-${month + 1}`;

    if (!acc[key]) {
      acc[key] = {
        month: month + 1,
        year,
        income: 0,
        expense: 0,
      };
    }

    if (transaction.type === "income") {
      acc[key].income += transaction.amountTotal;
    } else {
      acc[key].expense += transaction.amountTotal;
    }

    return acc;
  }, {});

  return Object.values(monthlyData);
}

export async function generateCategoryReport(orgId: string, startDate: Date, endDate: Date) {
  const transactions = await prisma.transaction.findMany({
    where: {
      organizationId: orgId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      category: true,
      type: true,
      amountTotal: true,
    },
  });

  // Group transactions by category
  const categoryData = transactions.reduce((acc: any, transaction) => {
    if (!acc[transaction.category]) {
      acc[transaction.category] = {
        category: transaction.category,
        income: 0,
        expense: 0,
      };
    }

    if (transaction.type === "income") {
      acc[transaction.category].income += transaction.amountTotal;
    } else {
      acc[transaction.category].expense += transaction.amountTotal;
    }

    return acc;
  }, {});

  return Object.values(categoryData);
}

export async function generateYearlyReport(orgId: string, startDate: Date, endDate: Date) {
  const transactions = await prisma.transaction.findMany({
    where: {
      organizationId: orgId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      date: true,
      type: true,
      amountTotal: true,
    },
  });

  // Group transactions by year
  const yearlyData = transactions.reduce((acc: any, transaction) => {
    const year = transaction.date.getFullYear();

    if (!acc[year]) {
      acc[year] = {
        year,
        income: 0,
        expense: 0,
      };
    }

    if (transaction.type === "income") {
      acc[year].income += transaction.amountTotal;
    } else {
      acc[year].expense += transaction.amountTotal;
    }

    return acc;
  }, {});

  return Object.values(yearlyData);
}

export async function generateRelatedPartyReport(orgId: string, startDate: Date, endDate: Date) {
  const transactions = await prisma.transaction.findMany({
    where: {
      organizationId: orgId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      relatedParty: true,
      type: true,
      amountTotal: true,
    },
  });

  // Group transactions by related party
  const relatedPartyData = transactions.reduce((acc: any, transaction) => {
    if (!acc[transaction.relatedParty]) {
      acc[transaction.relatedParty] = {
        relatedParty: transaction.relatedParty,
        income: 0,
        expense: 0,
      };
    }

    if (transaction.type === "income") {
      acc[transaction.relatedParty].income += transaction.amountTotal;
    } else {
      acc[transaction.relatedParty].expense += transaction.amountTotal;
    }

    return acc;
  }, {});

  return Object.values(relatedPartyData);
} 