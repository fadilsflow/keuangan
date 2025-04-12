import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { parseISO, format } from "date-fns";
import { id } from "date-fns/locale";
import jsPDF from "jspdf";
import ExcelJS from "exceljs";
import { formatRupiah } from "@/lib/utils";
import { generateMonthlyReport, generateCategoryReport, generateYearlyReport, generateRelatedPartyReport } from "../route";

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
    const format = searchParams.get("format");

    if (!reportType || !startDate || !endDate || !format) {
      return new NextResponse("Missing required parameters", { status: 400 });
    }

    const start = parseISO(startDate);
    const end = parseISO(endDate);

    // Get report data using the appropriate generator function
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

    // Generate export based on format
    if (format === "pdf") {
      const pdfBuffer = await generatePDF(reportType, reportData, start, end);
      return new Response(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename=${reportType}-report.pdf`,
        },
      });
    } else if (format === "excel") {
      const buffer = await generateExcel(reportType, reportData, start, end);
      return new Response(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename=${reportType}-report.xlsx`,
        },
      });
    } else {
      return new NextResponse("Invalid format", { status: 400 });
    }
  } catch (error) {
    console.error("Export error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

async function generatePDF(reportType: string, data: any[], startDate: Date, endDate: Date) {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Set initial position
  let y = 20;
  
  // Add title
  doc.setFontSize(16);
  doc.text(getReportTitle(reportType), doc.internal.pageSize.width / 2, y, { align: 'center' });
  y += 10;

  // Add period
  doc.setFontSize(12);
  const periodText = `Periode: ${format(startDate, "d MMMM yyyy", { locale: id })} - ${format(endDate, "d MMMM yyyy", { locale: id })}`;
  doc.text(periodText, doc.internal.pageSize.width / 2, y, { align: 'center' });
  y += 20;

  // Get headers and calculate column widths
  const headers = getTableHeaders(reportType);
  const margin = 10;
  const pageWidth = doc.internal.pageSize.width - 2 * margin;
  const colWidth = pageWidth / headers.length;

  // Draw table headers
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  headers.forEach((header, i) => {
    doc.rect(margin + (i * colWidth), y - 5, colWidth, 10);
    doc.text(header, margin + (i * colWidth) + colWidth / 2, y, { align: 'center' });
  });
  y += 10;

  // Draw table content
  doc.setFont('helvetica', 'normal');
  data.forEach((row) => {
    // Check if we need a new page
    if (y > doc.internal.pageSize.height - 20) {
      doc.addPage();
      y = 20;
    }

    const values = getRowValues(reportType, row);
    values.forEach((value, i) => {
      doc.rect(margin + (i * colWidth), y - 5, colWidth, 10);
      doc.text(String(value), margin + (i * colWidth) + colWidth / 2, y, { align: 'center' });
    });
    y += 10;
  });

  // Return the PDF as a buffer
  return doc.output('arraybuffer');
}

async function generateExcel(reportType: string, data: any[], startDate: Date, endDate: Date) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(getReportTitle(reportType));

  // Add title
  worksheet.mergeCells("A1:E1");
  worksheet.getCell("A1").value = getReportTitle(reportType);
  worksheet.getCell("A1").alignment = { horizontal: "center" };
  worksheet.getCell("A1").font = { size: 16, bold: true };

  // Add period
  worksheet.mergeCells("A2:E2");
  worksheet.getCell("A2").value = `Periode: ${format(startDate, "d MMMM yyyy", {
    locale: id,
  })} - ${format(endDate, "d MMMM yyyy", { locale: id })}`;
  worksheet.getCell("A2").alignment = { horizontal: "center" };

  // Add headers
  const headers = getTableHeaders(reportType);
  worksheet.addRow(headers);

  // Style headers
  const headerRow = worksheet.getRow(3);
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: "center" };

  // Add data
  data.forEach((row) => {
    worksheet.addRow(getRowValues(reportType, row));
  });

  // Auto-fit columns
  worksheet.columns.forEach((column) => {
    column.width = 15;
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();

  return buffer;
}

function getReportTitle(reportType: string): string {
  switch (reportType) {
    case "monthly":
      return "Laporan Bulanan";
    case "yearly":
      return "Laporan Tahunan";
    case "category":
      return "Laporan Berdasarkan Kategori";
    case "related-party":
      return "Laporan Berdasarkan Pihak Terkait";
    default:
      return "Laporan";
  }
}

function getTableHeaders(reportType: string): string[] {
  switch (reportType) {
    case "monthly":
      return ["Bulan", "Tahun", "Pemasukan", "Pengeluaran", "Selisih"];
    case "yearly":
      return ["Tahun", "Pemasukan", "Pengeluaran", "Selisih"];
    case "category":
      return ["Kategori", "Pemasukan", "Pengeluaran", "Selisih"];
    case "related-party":
      return ["Pihak Terkait", "Pemasukan", "Pengeluaran", "Selisih"];
    default:
      return [];
  }
}

function getRowValues(reportType: string, row: any): string[] {
  const income = row.income || 0;
  const expense = row.expense || 0;
  const difference = income - expense;

  switch (reportType) {
    case "monthly":
      return [
        format(new Date(2021, row.month - 1), "MMMM", { locale: id }),
        row.year.toString(),
        formatRupiah(income),
        formatRupiah(expense),
        formatRupiah(difference),
      ];
    case "yearly":
      return [
        row.year.toString(),
        formatRupiah(income),
        formatRupiah(expense),
        formatRupiah(difference),
      ];
    case "category":
      return [
        row.category,
        formatRupiah(income),
        formatRupiah(expense),
        formatRupiah(difference),
      ];
    case "related-party":
      return [
        row.relatedParty,
        formatRupiah(income),
        formatRupiah(expense),
        formatRupiah(difference),
      ];
    default:
      return [];
  }
} 