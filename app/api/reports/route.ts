import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { parseISO } from "date-fns";
import { 
  generateMonthlyReport, 
  generateCategoryReport, 
  generateYearlyReport, 
  generateRelatedPartyReport,
  generateItemReport,
  generateSummaryReport
} from "./utils";

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
    const transactionType = searchParams.get("transactionType") || "all"; // "all", "income", or "expense"

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
        // Filter by transaction type if specified
        if (transactionType !== "all") {
          reportData = reportData.filter(item => item.type === transactionType);
        }
        break;
      case "yearly":
        reportData = await generateYearlyReport(orgId, start, end);
        break;
      case "related-party":
        reportData = await generateRelatedPartyReport(orgId, start, end);
        // Filter by transaction type if specified
        if (transactionType !== "all") {
          reportData = reportData.filter(item => item.type === transactionType);
        }
        break;
      case "items":
        reportData = await generateItemReport(orgId, start, end);
        // Filter by transaction type if specified
        if (transactionType !== "all") {
          reportData = reportData.filter(item => item.type === transactionType);
        }
        break;
      case "summary":
        reportData = await generateSummaryReport(orgId, start, end);
        // Return only the specific transaction type data if requested
        if (transactionType === "income") {
          reportData = reportData.income;
        } else if (transactionType === "expense") {
          reportData = reportData.expense;
        }
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