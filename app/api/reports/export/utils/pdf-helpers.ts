import jsPDF from "jspdf";
import { formatRupiah } from "@/lib/utils";

// Helper for drawing table headers
export function drawTableHeader(
  doc: jsPDF,
  columns: string[],
  colWidths: number[],
  x: number,
  y: number,
  lineHeight: number
): number {
  // Draw header cells
  for (let i = 0; i < columns.length; i++) {
    doc.rect(x, y, colWidths[i], lineHeight);
    doc.text(columns[i], x + colWidths[i] / 2, y + lineHeight / 2, { 
      align: 'center', 
      baseline: 'middle' 
    });
    x += colWidths[i];
  }
  return y + lineHeight;
}

// Helper for drawing data rows in a table
export function drawDataRows(
  doc: jsPDF,
  data: any[],
  valueExtractors: ((item: any) => any)[],
  colWidths: number[],
  margin: number,
  y: number,
  lineHeight: number,
  alignments: ('left' | 'right')[] = []
): number {
  let currentY = y;
  
  data.forEach((item) => {
    if (currentY > doc.internal.pageSize.height - 20) {
      doc.addPage();
      currentY = 20;
    }
    
    let x = margin;
    const values = valueExtractors.map(extractor => extractor(item));
    
    for (let i = 0; i < values.length; i++) {
      doc.rect(x, currentY, colWidths[i], lineHeight);
      const align = alignments[i] || (i === 0 ? 'left' : 'right');
      const textX = align === 'left' ? x + 2 : x + colWidths[i] - 2;
      doc.text(values[i], textX, currentY + lineHeight / 2, { 
        align: align, 
        baseline: 'middle' 
      });
      x += colWidths[i];
    }
    
    currentY += lineHeight;
  });
  
  return currentY;
}

// Helper for drawing section headers
export function drawSectionHeader(
  doc: jsPDF,
  title: string,
  y: number,
  pageWidth: number,
  fontSize: number = 14
): number {
  doc.setFontSize(fontSize);
  doc.setFont("helvetica", "bold");
  doc.text(title, pageWidth / 2, y, { align: 'center' });
  return y + (fontSize * 0.8); // Approximate height based on font size
}

// Helper for drawing empty data message
export function drawEmptyDataMessage(
  doc: jsPDF,
  message: string,
  colWidths: number[],
  x: number,
  y: number,
  lineHeight: number
): number {
  const totalWidth = colWidths.reduce((acc, width) => acc + width, 0);
  doc.rect(x, y, totalWidth, lineHeight);
  doc.text(message, x + 2, y + lineHeight / 2, { baseline: 'middle' });
  return y + lineHeight;
}

// Helper for drawing key-value information
export function drawKeyValue(
  doc: jsPDF,
  key: string,
  value: string,
  x: number,
  y: number,
  pageWidth: number,
  margin: number
): number {
  doc.text(key, x, y);
  doc.text(value, pageWidth - margin, y, { align: 'right' });
  return y + 10;
}

// Helper for drawing the document header
export function drawDocumentHeader(
  doc: jsPDF,
  orgName: string,
  title: string,
  period: string,
  pageWidth: number
): number {
  let y = 20;
  
  // Add organization name
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(orgName, pageWidth / 2, y, { align: 'center' });
  y += 12;

  // Add title
  doc.setFontSize(16);
  doc.text(title, pageWidth / 2, y, { align: 'center' });
  y += 15;

  // Add period
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(period, pageWidth / 2, y, { align: 'center' });
  y += 15;
  
  return y;
}

// Helper for drawing income/expense category table
export function drawCategoryTable(
  doc: jsPDF,
  data: any[],
  title: string,
  titleColumn: string,
  valueKey: string,
  pageWidth: number,
  margin: number,
  y: number,
  lineHeight: number
): number {
  // Section header
  y = drawSectionHeader(doc, title, y, pageWidth);
  y += 10;
  
  // Table header
  const columns = [titleColumn, 'Total'];
  const colWidths = [(pageWidth - 2 * margin) * 0.7, (pageWidth - 2 * margin) * 0.3];
  
  y = drawTableHeader(doc, columns, colWidths, margin, y, lineHeight);
  
  // Data rows
  doc.setFont("helvetica", "normal");
  if (data.length > 0) {
    const extractors = [
      (item: any) => item[titleColumn.toLowerCase()] || item.name || 'Unknown',
      (item: any) => formatRupiah(item[valueKey] || 0)
    ];
    
    y = drawDataRows(doc, data, extractors, colWidths, margin, y, lineHeight, ['left', 'right']);
  } else {
    // No data message
    y = drawEmptyDataMessage(doc, `Tidak ada data ${titleColumn.toLowerCase()}`, colWidths, margin, y, lineHeight);
  }
  
  return y + 10;
}

// Helper for drawing item table
export function drawItemTable(
  doc: jsPDF,
  items: any[],
  title: string,
  pageWidth: number,
  margin: number,
  y: number,
  lineHeight: number
): number {
  // Section header
  y = drawSectionHeader(doc, title, y, pageWidth);
  y += 10;
  
  // Table header
  const columns = ['Item', 'Jumlah', 'Total'];
  const colWidths = [
    (pageWidth - 2 * margin) * 0.5, 
    (pageWidth - 2 * margin) * 0.2, 
    (pageWidth - 2 * margin) * 0.3
  ];
  
  y = drawTableHeader(doc, columns, colWidths, margin, y, lineHeight);
  
  // Data rows
  doc.setFont("helvetica", "normal");
  if (items.length > 0) {
    const extractors = [
      (item: any) => item.itemName || item.name || 'Unknown',
      (item: any) => (item.quantity || 0).toString(),
      (item: any) => formatRupiah(item.totalAmount || item.total || 0)
    ];
    
    y = drawDataRows(doc, items, extractors, colWidths, margin, y, lineHeight, ['left', 'right', 'right']);
  } else {
    // No data message
    y = drawEmptyDataMessage(doc, "Tidak ada data item", colWidths, margin, y, lineHeight);
  }
  
  return y + 10;
}

// Helper for drawing summary section
export function drawSummarySection(
  doc: jsPDF,
  data: any,
  title: string,
  pageWidth: number,
  margin: number,
  y: number,
  lineHeight: number
): number {
  // Section header
  y = drawSectionHeader(doc, title, y, pageWidth);
  y += 15;
  
  // Add totals
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  y = drawKeyValue(doc, 'Total:', formatRupiah(data.total || 0), margin, y, pageWidth, margin);
  y = drawKeyValue(doc, 'Jumlah Transaksi:', (data.transactionCount || 0).toString(), margin, y, pageWidth, margin);
  y += 10;
  
  // Categories section
  if (data.categories && data.categories.length > 0) {
    y = drawCategoryTable(
      doc, 
      data.categories.slice(0, 5), 
      "Kategori Teratas", 
      "Kategori", 
      "total", 
      pageWidth, 
      margin, 
      y, 
      lineHeight
    );
  }
  
  // Related parties section
  if (data.relatedParties && data.relatedParties.length > 0) {
    y = drawCategoryTable(
      doc, 
      data.relatedParties.slice(0, 5), 
      "Pihak Terkait Teratas", 
      "Pihak Terkait", 
      "total", 
      pageWidth, 
      margin, 
      y, 
      lineHeight
    );
  }
  
  // Items section
  if (data.items && data.items.length > 0) {
    y = drawItemTable(
      doc, 
      data.items.slice(0, 5), 
      "Item Teratas", 
      pageWidth, 
      margin, 
      y, 
      lineHeight
    );
  }
  
  return y;
} 