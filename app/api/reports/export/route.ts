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
} from "../utils";
import * as ExcelJS from 'exceljs';
import jsPDF from "jspdf";
import { formatRupiah } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cookies } from "next/headers";

// Server-side function to get organization name
async function getOrganizationName(orgId: string | null | undefined): Promise<string> {
  if (!orgId) return "Organization";
  
  try {
    // Get active organization name from the session claims
    const { sessionClaims } = await auth();
    
    // Check if we have org_id and org_metadata
    if (sessionClaims && sessionClaims.org_id) {
      // Check if we have org_metadata with name
      if (sessionClaims.org_metadata && 
          typeof sessionClaims.org_metadata === 'object' && 
          'name' in sessionClaims.org_metadata &&
          sessionClaims.org_metadata.name) {
        return String(sessionClaims.org_metadata.name);
      }
      
      // Fallback to org_name if available
      if (sessionClaims.org_name) {
        return String(sessionClaims.org_name);
      }
      
      // Fallback to capitalizing org_slug if available
      if (sessionClaims.org_slug) {
        // Convert slug to display name (replace hyphens with spaces and capitalize each word)
        return String(sessionClaims.org_slug)
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
    }
    
    return "Organization";
  } catch (error) {
    console.error("Error fetching organization name:", error);
    return "Organization";
  }
}

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
    const transactionType = searchParams.get("transactionType") || "all";
    const format = searchParams.get("format") || "pdf"; // pdf or excel
    
    if (!reportType || !startDate || !endDate) {
      return new NextResponse("Missing required parameters", { status: 400 });
    }

    const start = parseISO(startDate);
    const end = parseISO(endDate);

    let reportData;

    // Get the report data using the same logic as the regular report endpoint
    switch (reportType) {
      case "monthly":
        reportData = await generateMonthlyReport(orgId, start, end);
        break;
      case "category":
        reportData = await generateCategoryReport(orgId, start, end);
        if (transactionType !== "all") {
          reportData = reportData.filter(item => item.type === transactionType);
        }
        break;
      case "yearly":
        reportData = await generateYearlyReport(orgId, start, end);
        break;
      case "related-party":
        reportData = await generateRelatedPartyReport(orgId, start, end);
        if (transactionType !== "all") {
          reportData = reportData.filter(item => item.type === transactionType);
        }
        break;
      case "items":
        reportData = await generateItemReport(orgId, start, end);
        if (transactionType !== "all") {
          reportData = reportData.filter(item => item.type === transactionType);
        }
        break;
      case "summary":
        reportData = await generateSummaryReport(orgId, start, end);
        if (transactionType === "income") {
          reportData = reportData.income;
        } else if (transactionType === "expense") {
          reportData = reportData.expense;
        }
        break;
      default:
        return new NextResponse("Invalid report type", { status: 400 });
    }

    if (format === "pdf") {
      // Generate PDF using jsPDF
      const pdfBuffer = await generatePDF(reportType, reportData, start, end, transactionType);
      return new Response(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename=${reportType}-${transactionType}-report.pdf`,
        },
      });
    } else if (format === "excel") {
      const excelBuffer = await generateExcel(reportType, reportData, start, end, transactionType);
      return new Response(excelBuffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename=${reportType}-${transactionType}-report.xlsx`,
        },
      });
    } else {
      return new NextResponse("Invalid format", { status: 400 });
    }
  } catch (error) {
    console.error("Report export error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

async function generateExcel(
  reportType: string, 
  reportData: any, 
  startDate: Date, 
  endDate: Date,
  transactionType: string
) {
  // Get the organization name using the server-side function
  const { orgId } = await auth();
  const orgName = await getOrganizationName(orgId);

  // Create a new Excel workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(getReportTitle(reportType, transactionType));
  
  // Add organization name
  worksheet.mergeCells('A1:E1');
  const orgCell = worksheet.getCell('A1');
  orgCell.value = orgName;
  orgCell.font = { size: 14, bold: true };
  orgCell.alignment = { horizontal: 'center' };
  
  // Add title and period
  worksheet.mergeCells('A2:E2');
  const titleCell = worksheet.getCell('A2');
  titleCell.value = getReportTitle(reportType, transactionType);
  titleCell.font = { size: 16, bold: true };
  titleCell.alignment = { horizontal: 'center' };
  
  worksheet.mergeCells('A3:E3');
  const periodCell = worksheet.getCell('A3');
  const startFormatted = startDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const endFormatted = endDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  periodCell.value = `Periode: ${startFormatted} - ${endFormatted}`;
  periodCell.alignment = { horizontal: 'center' };
  
  // Add headers and data based on report type
  if (reportType === 'monthly') {
    worksheet.columns = [
      { header: 'Bulan', key: 'month', width: 15 },
      { header: 'Tahun', key: 'year', width: 10 },
      { header: 'Pemasukan', key: 'income', width: 20 },
      { header: 'Pengeluaran', key: 'expense', width: 20 },
    ];
    
    reportData.forEach((item: any) => {
      worksheet.addRow({
        month: new Date(2021, item.month - 1).toLocaleDateString('id-ID', { month: 'long' }),
        year: item.year,
        income: item.income,
        expense: item.expense
      });
    });
    
    // Format currency columns
    worksheet.getColumn('income').numFmt = 'Rp#,##0.00';
    worksheet.getColumn('expense').numFmt = 'Rp#,##0.00';
    
  } else if (reportType === 'yearly') {
    worksheet.columns = [
      { header: 'Tahun', key: 'year', width: 10 },
      { header: 'Pemasukan', key: 'income', width: 20 },
      { header: 'Pengeluaran', key: 'expense', width: 20 },
    ];
    
    reportData.forEach((item: any) => {
      worksheet.addRow({
        year: item.year,
        income: item.income,
        expense: item.expense
      });
    });
    
    // Format currency columns
    worksheet.getColumn('income').numFmt = 'Rp#,##0.00';
    worksheet.getColumn('expense').numFmt = 'Rp#,##0.00';
    
  } else if (reportType === 'category') {
    // For 'all' transaction type, we need columns for both income and expense
    if (transactionType === 'all') {
      worksheet.columns = [
        { header: 'Kategori', key: 'category', width: 25 },
        { header: 'Pemasukan', key: 'income', width: 20 },
        { header: 'Pengeluaran', key: 'expense', width: 20 },
      ];
      
      reportData.forEach((item: any) => {
        worksheet.addRow({
          category: item.category,
          income: item.income || 0,
          expense: item.expense || 0
        });
      });
      
      // Format currency columns
      worksheet.getColumn('income').numFmt = 'Rp#,##0.00';
      worksheet.getColumn('expense').numFmt = 'Rp#,##0.00';
    } else {
      // Single column for either income or expense
      const valueType = transactionType === 'income' ? 'Pemasukan' : 'Pengeluaran';
      const valueKey = transactionType === 'income' ? 'income' : 'expense';
      
      worksheet.columns = [
        { header: 'Kategori', key: 'category', width: 25 },
        { header: valueType, key: 'value', width: 20 },
      ];
      
      reportData.forEach((item: any) => {
        worksheet.addRow({
          category: item.category,
          value: item[valueKey] || 0
        });
      });
      
      // Format currency column
      worksheet.getColumn('value').numFmt = 'Rp#,##0.00';
    }
    
  } else if (reportType === 'related-party') {
    // For 'all' transaction type, we need columns for both income and expense
    if (transactionType === 'all') {
      worksheet.columns = [
        { header: 'Pihak Terkait', key: 'relatedParty', width: 25 },
        { header: 'Pemasukan', key: 'income', width: 20 },
        { header: 'Pengeluaran', key: 'expense', width: 20 },
      ];
      
      reportData.forEach((item: any) => {
        worksheet.addRow({
          relatedParty: item.relatedParty,
          income: item.income || 0,
          expense: item.expense || 0
        });
      });
      
      // Format currency columns
      worksheet.getColumn('income').numFmt = 'Rp#,##0.00';
      worksheet.getColumn('expense').numFmt = 'Rp#,##0.00';
    } else {
      // Single column for either income or expense
      const valueType = transactionType === 'income' ? 'Pemasukan' : 'Pengeluaran';
      const valueKey = transactionType === 'income' ? 'income' : 'expense';
      
      worksheet.columns = [
        { header: 'Pihak Terkait', key: 'relatedParty', width: 25 },
        { header: valueType, key: 'value', width: 20 },
      ];
      
      reportData.forEach((item: any) => {
        worksheet.addRow({
          relatedParty: item.relatedParty,
          value: item[valueKey] || 0
        });
      });
      
      // Format currency column
      worksheet.getColumn('value').numFmt = 'Rp#,##0.00';
    }
    
  } else if (reportType === 'items') {
    worksheet.columns = [
      { header: 'Item', key: 'itemName', width: 25 },
      { header: 'Jumlah', key: 'quantity', width: 15 },
      { header: 'Total', key: 'totalAmount', width: 20 },
    ];
    
    reportData.forEach((item: any) => {
      worksheet.addRow({
        itemName: item.itemName,
        quantity: item.quantity,
        totalAmount: item.totalAmount
      });
    });
    
    // Format currency column
    worksheet.getColumn('totalAmount').numFmt = 'Rp#,##0.00';
    
  } else if (reportType === 'summary') {
    // Handle summary report
    let reportTitle = "";
    if (transactionType === "income") {
      reportTitle = "Laporan Ringkasan Pemasukan";
    } else if (transactionType === "expense") {
      reportTitle = "Laporan Ringkasan Pengeluaran";
    } else {
      reportTitle = "Laporan Ringkasan Keuangan";
    }

    // Set title and period on row 2 and 3
    worksheet.getCell("A2").value = reportTitle;
    worksheet.getCell("A2").font = { size: 14, bold: true };
    worksheet.getCell("A3").value = `Periode: ${format(startDate, "d MMMM yyyy", { locale: id })} - ${format(endDate, "d MMMM yyyy", { locale: id })}`;
    worksheet.getCell("A3").font = { size: 12 };

    let currentRow = 5;

    // Summary
    worksheet.getCell(`A${currentRow}`).value = "Total Transaksi";
    worksheet.getCell(`B${currentRow}`).value = reportData.transactionCount || 0;
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = "Total Nilai";
    worksheet.getCell(`B${currentRow}`).value = reportData.total || 0;
    worksheet.getCell(`B${currentRow}`).numFmt = 'Rp#,##0.00';
    currentRow += 2;

    // Categories (if available)
    if (reportData.categories && reportData.categories.length > 0) {
      worksheet.getCell(`A${currentRow}`).value = "Kategori Teratas";
      worksheet.getCell(`A${currentRow}`).font = { bold: true };
      currentRow++;

      worksheet.getCell(`A${currentRow}`).value = "Nama Kategori";
      worksheet.getCell(`B${currentRow}`).value = "Total";
      worksheet.getCell(`A${currentRow}`).font = { bold: true };
      worksheet.getCell(`B${currentRow}`).font = { bold: true };
      currentRow++;

      reportData.categories.slice(0, 5).forEach((category: { name: string; total: number }) => {
        worksheet.getCell(`A${currentRow}`).value = category.name || "Unknown";
        worksheet.getCell(`B${currentRow}`).value = category.total || 0;
        worksheet.getCell(`B${currentRow}`).numFmt = 'Rp#,##0.00';
        currentRow++;
      });
      currentRow++;
    } else {
      worksheet.getCell(`A${currentRow}`).value = "Kategori Teratas";
      worksheet.getCell(`A${currentRow}`).font = { bold: true };
      currentRow++;
      worksheet.getCell(`A${currentRow}`).value = "Tidak ada data kategori tersedia";
      currentRow += 2;
    }

    // Related Parties (if available)
    if (reportData.relatedParties && reportData.relatedParties.length > 0) {
      worksheet.getCell(`A${currentRow}`).value = "Pihak Terkait Teratas";
      worksheet.getCell(`A${currentRow}`).font = { bold: true };
      currentRow++;

      worksheet.getCell(`A${currentRow}`).value = "Nama Pihak";
      worksheet.getCell(`B${currentRow}`).value = "Total";
      worksheet.getCell(`A${currentRow}`).font = { bold: true };
      worksheet.getCell(`B${currentRow}`).font = { bold: true };
      currentRow++;

      reportData.relatedParties.slice(0, 5).forEach((party: { name: string; total: number }) => {
        worksheet.getCell(`A${currentRow}`).value = party.name || "Unknown";
        worksheet.getCell(`B${currentRow}`).value = party.total || 0;
        worksheet.getCell(`B${currentRow}`).numFmt = 'Rp#,##0.00';
        currentRow++;
      });
      currentRow++;
    } else {
      worksheet.getCell(`A${currentRow}`).value = "Pihak Terkait Teratas";
      worksheet.getCell(`A${currentRow}`).font = { bold: true };
      currentRow++;
      worksheet.getCell(`A${currentRow}`).value = "Tidak ada data pihak terkait tersedia";
      currentRow += 2;
    }

    // Items (if available)
    if (reportData.items && reportData.items.length > 0) {
      worksheet.getCell(`A${currentRow}`).value = "Item Teratas";
      worksheet.getCell(`A${currentRow}`).font = { bold: true };
      currentRow++;

      worksheet.getCell(`A${currentRow}`).value = "Nama Item";
      worksheet.getCell(`B${currentRow}`).value = "Total";
      worksheet.getCell(`C${currentRow}`).value = "Kuantitas";
      worksheet.getCell(`A${currentRow}`).font = { bold: true };
      worksheet.getCell(`B${currentRow}`).font = { bold: true };
      worksheet.getCell(`C${currentRow}`).font = { bold: true };
      currentRow++;

      reportData.items.slice(0, 5).forEach((item: { name: string; total: number; quantity: number }) => {
        worksheet.getCell(`A${currentRow}`).value = item.name || "Unknown";
        worksheet.getCell(`B${currentRow}`).value = item.total || 0;
        worksheet.getCell(`C${currentRow}`).value = item.quantity || 0;
        worksheet.getCell(`B${currentRow}`).numFmt = 'Rp#,##0.00';
        currentRow++;
      });
    } else {
      worksheet.getCell(`A${currentRow}`).value = "Item Teratas";
      worksheet.getCell(`A${currentRow}`).font = { bold: true };
      currentRow++;
      worksheet.getCell(`A${currentRow}`).value = "Tidak ada data item tersedia";
    }
  }
  
  // Style the header row
  const headerRow = worksheet.getRow(4);
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: 'center' };
  
  // Generate buffer
  return await workbook.xlsx.writeBuffer();
}

function getReportTitle(reportType: string, transactionType: string): string {
  const typeLabel = transactionType === 'income' ? 'Pemasukan' : 
                   transactionType === 'expense' ? 'Pengeluaran' : 
                   'Semua Transaksi';
  
  switch (reportType) {
    case "monthly":
      return `Laporan Bulanan - ${typeLabel}`;
    case "yearly":
      return `Laporan Tahunan - ${typeLabel}`;
    case "category":
      return `Laporan Kategori - ${typeLabel}`;
    case "related-party":
      return `Laporan Pihak Terkait - ${typeLabel}`;
    case "items":
      return `Laporan Item - ${typeLabel}`;
    case "summary":
      return `Ringkasan Laporan - ${typeLabel}`;
    default:
      return `Laporan - ${typeLabel}`;
  }
}

async function generatePDF(
  reportType: string,
  reportData: any,
  startDate: Date,
  endDate: Date,
  transactionType: string
) {
  // Create a new PDF document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const lineHeight = 10;
  let y = 20;

  // Get the organization name using the server-side function
  const { orgId } = await auth();
  const orgName = await getOrganizationName(orgId);

  // Add organization name
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(orgName, pageWidth / 2, y, { align: 'center' as const });
  y += 12;

  // Add title
  const title = getReportTitle(reportType, transactionType);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title, pageWidth / 2, y, { align: 'center' as const });
  y += 15;

  // Add period
  const startFormatted = startDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const endFormatted = endDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const periodStr = `Periode: ${startFormatted} - ${endFormatted}`;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(periodStr, pageWidth / 2, y, { align: 'center' as const });
  y += 15;

  // Generate report based on type
  if (reportType === 'monthly') {
    // Draw table header manually
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    
    // Define columns
    const columns = ['Bulan', 'Tahun', 'Pemasukan', 'Pengeluaran'];
    const colWidths = [(pageWidth - 2 * margin) * 0.3, (pageWidth - 2 * margin) * 0.2, (pageWidth - 2 * margin) * 0.25, (pageWidth - 2 * margin) * 0.25];
    
    // Draw header
    let x = margin;
    for (let i = 0; i < columns.length; i++) {
      doc.rect(x, y, colWidths[i], lineHeight);
      doc.text(columns[i], x + colWidths[i] / 2, y + lineHeight / 2, { align: 'center' as const, baseline: 'middle' as const });
      x += colWidths[i];
    }
    y += lineHeight;
    
    // Draw data rows
    doc.setFont("helvetica", "normal");
    reportData.forEach((item: any) => {
      if (y > doc.internal.pageSize.height - 20) {
        doc.addPage();
        y = 20;
      }
      
      x = margin;
      const monthName = new Date(2021, item.month - 1).toLocaleDateString('id-ID', { month: 'long' });
      const values = [monthName, item.year.toString(), formatRupiah(item.income), formatRupiah(item.expense)];
      
      for (let i = 0; i < values.length; i++) {
        doc.rect(x, y, colWidths[i], lineHeight);
        // Align left for text, right for numbers
        const alignOpt = i <= 1 ? 
          { align: 'left' as const, baseline: 'middle' as const } : 
          { align: 'right' as const, baseline: 'middle' as const };
        const textX = i <= 1 ? x + 2 : x + colWidths[i] - 2;
        doc.text(values[i], textX, y + lineHeight / 2, alignOpt);
        x += colWidths[i];
      }
      
      y += lineHeight;
    });

  } else if (reportType === 'yearly') {
    // Draw table header manually
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    
    // Define columns
    const columns = ['Tahun', 'Pemasukan', 'Pengeluaran'];
    const colWidths = [(pageWidth - 2 * margin) * 0.3, (pageWidth - 2 * margin) * 0.35, (pageWidth - 2 * margin) * 0.35];
    
    // Draw header
    let x = margin;
    for (let i = 0; i < columns.length; i++) {
      doc.rect(x, y, colWidths[i], lineHeight);
      doc.text(columns[i], x + colWidths[i] / 2, y + lineHeight / 2, { align: 'center' as const, baseline: 'middle' as const });
      x += colWidths[i];
    }
    y += lineHeight;
    
    // Draw data rows
    doc.setFont("helvetica", "normal");
    reportData.forEach((item: any) => {
      if (y > doc.internal.pageSize.height - 20) {
        doc.addPage();
        y = 20;
      }
      
      x = margin;
      const values = [item.year.toString(), formatRupiah(item.income), formatRupiah(item.expense)];
      
      for (let i = 0; i < values.length; i++) {
        doc.rect(x, y, colWidths[i], lineHeight);
        const alignOpt = i === 0 ? { align: 'left' as const, baseline: 'middle' as const } : { align: 'right' as const, baseline: 'middle' as const };
        const textX = i === 0 ? x + 2 : x + colWidths[i] - 2;
        doc.text(values[i], textX, y + lineHeight / 2, alignOpt);
        x += colWidths[i];
      }
      
      y += lineHeight;
    });

  } else if (reportType === 'category' || reportType === 'related-party') {
    // Common code for category and related-party reports
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    
    // For 'all' transaction type, we need to show both income and expense columns
    const valueColumns = transactionType === 'all' 
      ? ['Pemasukan', 'Pengeluaran'] 
      : [transactionType === 'income' ? 'Pemasukan' : 'Pengeluaran'];
    
    const nameKey = reportType === 'category' ? 'category' : 'relatedParty';
    const titleColumn = reportType === 'category' ? 'Kategori' : 'Pihak Terkait';
    
    // Set column configuration based on transaction type
    const columns = [titleColumn, ...valueColumns];
    
    // Adjust column widths based on number of columns
    const titleWidth = (pageWidth - 2 * margin) * (transactionType === 'all' ? 0.4 : 0.6);
    const valueWidth = (pageWidth - 2 * margin - titleWidth) / valueColumns.length;
    const colWidths = [titleWidth, ...valueColumns.map(() => valueWidth)];
    
    // Draw header
    let x = margin;
    for (let i = 0; i < columns.length; i++) {
      doc.rect(x, y, colWidths[i], lineHeight);
      doc.text(columns[i], x + colWidths[i] / 2, y + lineHeight / 2, { align: 'center' as const, baseline: 'middle' as const });
      x += colWidths[i];
    }
    y += lineHeight;
    
    // Draw data rows
    doc.setFont("helvetica", "normal");
    reportData.forEach((item: any) => {
      if (y > doc.internal.pageSize.height - 20) {
        doc.addPage();
        y = 20;
      }
      
      x = margin;
      
      // Prepare values based on transaction type
      let values = [item[nameKey]];
      
      if (transactionType === 'all') {
        values.push(
          formatRupiah(item.income || 0),
          formatRupiah(item.expense || 0)
        );
      } else {
        values.push(formatRupiah(transactionType === 'income' ? item.income || 0 : item.expense || 0));
      }
      
      for (let i = 0; i < values.length; i++) {
        doc.rect(x, y, colWidths[i], lineHeight);
        const alignOpt = i === 0 
          ? { align: 'left' as const, baseline: 'middle' as const } 
          : { align: 'right' as const, baseline: 'middle' as const };
        const textX = i === 0 ? x + 2 : x + colWidths[i] - 2;
        doc.text(values[i], textX, y + lineHeight / 2, alignOpt);
        x += colWidths[i];
      }
      
      y += lineHeight;
    });

  } else if (reportType === 'items') {
    // Items report
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    
    const columns = ['Item', 'Jumlah', 'Total'];
    const colWidths = [(pageWidth - 2 * margin) * 0.5, (pageWidth - 2 * margin) * 0.2, (pageWidth - 2 * margin) * 0.3];
    
    // Draw header
    let x = margin;
    for (let i = 0; i < columns.length; i++) {
      doc.rect(x, y, colWidths[i], lineHeight);
      doc.text(columns[i], x + colWidths[i] / 2, y + lineHeight / 2, { align: 'center' as const, baseline: 'middle' as const });
      x += colWidths[i];
    }
    y += lineHeight;
    
    // Draw data rows
    doc.setFont("helvetica", "normal");
    reportData.forEach((item: any) => {
      if (y > doc.internal.pageSize.height - 20) {
        doc.addPage();
        y = 20;
      }
      
      x = margin;
      const values = [
        item.itemName,
        item.quantity.toString(),
        formatRupiah(item.totalAmount)
      ];
      
      for (let i = 0; i < values.length; i++) {
        doc.rect(x, y, colWidths[i], lineHeight);
        const alignOpt = i === 0 ? { align: 'left' as const, baseline: 'middle' as const } : { align: 'right' as const, baseline: 'middle' as const };
        const textX = i === 0 ? x + 2 : x + colWidths[i] - 2;
        doc.text(values[i], textX, y + lineHeight / 2, alignOpt);
        x += colWidths[i];
      }
      
      y += lineHeight;
    });

  } else if (reportType === 'summary') {
    // Add total information
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text('Total:', margin, y);
    doc.text(formatRupiah(reportData.total || 0), pageWidth - margin, y, { align: 'right' as const });
    y += 10;
    
    doc.text('Jumlah Transaksi:', margin, y);
    doc.text((reportData.transactionCount || 0).toString(), pageWidth - margin, y, { align: 'right' as const });
    y += 20;
    
    // Top Categories - only if categories exist
    if (reportData.categories && reportData.categories.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Kategori Teratas', margin, y);
      y += 15;
      
      // Categories table
      doc.setFontSize(12);
      const catColumns = ['Kategori', 'Nominal'];
      const catColWidths = [(pageWidth - 2 * margin) * 0.7, (pageWidth - 2 * margin) * 0.3];
      
      // Draw header
      let x = margin;
      for (let i = 0; i < catColumns.length; i++) {
        doc.rect(x, y, catColWidths[i], lineHeight);
        doc.text(catColumns[i], x + catColWidths[i] / 2, y + lineHeight / 2, { align: 'center' as const, baseline: 'middle' as const });
        x += catColWidths[i];
      }
      y += lineHeight;
      
      // Draw data rows
      doc.setFont("helvetica", "normal");
      reportData.categories.slice(0, 5).forEach((cat: any) => {
        if (y > doc.internal.pageSize.height - 20) {
          doc.addPage();
          y = 20;
        }
        
        x = margin;
        const values = [cat.name || 'Unknown', formatRupiah(cat.total || 0)];
        
        for (let i = 0; i < values.length; i++) {
          doc.rect(x, y, catColWidths[i], lineHeight);
          const alignOpt = i === 0 ? { align: 'left' as const, baseline: 'middle' as const } : { align: 'right' as const, baseline: 'middle' as const };
          const textX = i === 0 ? x + 2 : x + catColWidths[i] - 2;
          doc.text(values[i], textX, y + lineHeight / 2, alignOpt);
          x += catColWidths[i];
        }
        
        y += lineHeight;
      });
      
      y += 15;
    } else {
      // No categories available
      doc.setFontSize(12);
      doc.setFont('helvetica', 'italic');
      doc.text('Tidak ada data kategori tersedia', margin, y);
      y += 15;
    }
    
    // Top Related Parties - only if they exist
    if (reportData.relatedParties && reportData.relatedParties.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Pihak Terkait Teratas', margin, y);
      y += 15;
      
      // Related parties table
      doc.setFontSize(12);
      const partyColumns = ['Pihak Terkait', 'Nominal'];
      const partyColWidths = [(pageWidth - 2 * margin) * 0.7, (pageWidth - 2 * margin) * 0.3];
      
      // Draw header
      let x = margin;
      for (let i = 0; i < partyColumns.length; i++) {
        doc.rect(x, y, partyColWidths[i], lineHeight);
        doc.text(partyColumns[i], x + partyColWidths[i] / 2, y + lineHeight / 2, { align: 'center' as const, baseline: 'middle' as const });
        x += partyColWidths[i];
      }
      y += lineHeight;
      
      // Draw data rows
      doc.setFont("helvetica", "normal");
      reportData.relatedParties.slice(0, 5).forEach((party: any) => {
        if (y > doc.internal.pageSize.height - 20) {
          doc.addPage();
          y = 20;
        }
        
        x = margin;
        const values = [party.name || 'Unknown', formatRupiah(party.total || 0)];
        
        for (let i = 0; i < values.length; i++) {
          doc.rect(x, y, partyColWidths[i], lineHeight);
          const alignOpt = i === 0 ? { align: 'left' as const, baseline: 'middle' as const } : { align: 'right' as const, baseline: 'middle' as const };
          const textX = i === 0 ? x + 2 : x + partyColWidths[i] - 2;
          doc.text(values[i], textX, y + lineHeight / 2, alignOpt);
          x += partyColWidths[i];
        }
        
        y += lineHeight;
      });
      
      y += 15;
    } else {
      // No related parties available
      doc.setFontSize(12);
      doc.setFont('helvetica', 'italic');
      doc.text('Tidak ada data pihak terkait tersedia', margin, y);
      y += 15;
    }
    
    // Only add items if they exist
    if (reportData.items && reportData.items.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Item Teratas', margin, y);
      y += 15;
      
      // Items table
      doc.setFontSize(12);
      const itemColumns = ['Item', 'Jumlah', 'Total'];
      const itemColWidths = [(pageWidth - 2 * margin) * 0.5, (pageWidth - 2 * margin) * 0.2, (pageWidth - 2 * margin) * 0.3];
      
      // Draw header
      let x = margin;
      for (let i = 0; i < itemColumns.length; i++) {
        doc.rect(x, y, itemColWidths[i], lineHeight);
        doc.text(itemColumns[i], x + itemColWidths[i] / 2, y + lineHeight / 2, { align: 'center' as const, baseline: 'middle' as const });
        x += itemColWidths[i];
      }
      y += lineHeight;
      
      // Draw data rows
      doc.setFont("helvetica", "normal");
      reportData.items.slice(0, 5).forEach((item: any) => {
        if (y > doc.internal.pageSize.height - 20) {
          doc.addPage();
          y = 20;
        }
        
        x = margin;
        const values = [item.name || 'Unknown', (item.quantity || 0).toString(), formatRupiah(item.total || 0)];
        
        for (let i = 0; i < values.length; i++) {
          doc.rect(x, y, itemColWidths[i], lineHeight);
          const alignOpt = i === 0 ? { align: 'left' as const, baseline: 'middle' as const } : { align: 'right' as const, baseline: 'middle' as const };
          const textX = i === 0 ? x + 2 : x + itemColWidths[i] - 2;
          doc.text(values[i], textX, y + lineHeight / 2, alignOpt);
          x += itemColWidths[i];
        }
        
        y += lineHeight;
      });
    } else {
      // No items available
      doc.setFontSize(12);
      doc.setFont('helvetica', 'italic');
      doc.text('Tidak ada data item tersedia', margin, y);
    }
  }

  // Return the PDF as an array buffer
  return doc.output('arraybuffer');
} 