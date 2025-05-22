import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import jsPDF from "jspdf";
import { formatRupiah } from "@/lib/utils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: transactionId } = await params;
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch transaction with items
    const transaction = await prisma.transaction.findUnique({
      where: {
        id: transactionId,
        organizationId: orgId,
      },
      include: {
        items: true,
      },
    });

    if (!transaction) {
      return new NextResponse("Transaction not found", { status: 404 });
      }

    // Generate PDF
    const doc = new jsPDF();
    let y = 20;

    // Add header
    doc.setFontSize(20);
    doc.text(transaction.type === "pemasukan" ? "INVOICE" : "KUITANSI", doc.internal.pageSize.width / 2, y, { align: "center" });
    y += 20;

    // Add transaction details
    doc.setFontSize(12);
    doc.text(`No: ${transaction.id}`, 20, y);
    doc.text(`Tanggal: ${format(new Date(transaction.date), "d MMMM yyyy", { locale: id })}`, doc.internal.pageSize.width - 20, y, { align: "right" });
    y += 10;
    doc.text(`Deskripsi: ${transaction.description}`, 20, y);
    y += 10;
    doc.text(`Pihak Terkait: ${transaction.relatedParty}`, 20, y);
    y += 10;
    doc.text(`Kategori: ${transaction.category}`, 20, y);
    y += 20;

    // Add items table
    const headers = ["Item", "Quantity", "Harga", "Total"];
    const margin = 20;
    const pageWidth = doc.internal.pageSize.width - 2 * margin;
    const colWidths = [pageWidth * 0.4, pageWidth * 0.2, pageWidth * 0.2, pageWidth * 0.2];

    // Draw table headers
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    let x = margin;
    headers.forEach((header, i) => {
      doc.rect(x, y - 5, colWidths[i], 10);
      doc.text(header, x + colWidths[i] / 2, y, { align: "center" });
      x += colWidths[i];
    });
    y += 10;

    // Draw items
    doc.setFont("helvetica", "normal");
    transaction.items.forEach((item) => {
      if (y > doc.internal.pageSize.height - 30) {
        doc.addPage();
        y = 20;
      }

      x = margin;
      const values = [
        item.name,
        item.quantity.toString(),
        formatRupiah(item.itemPrice),
        formatRupiah(item.totalPrice),
      ];

      values.forEach((value, i) => {
        doc.rect(x, y - 5, colWidths[i], 10);
        doc.text(value, x + colWidths[i] / 2, y, { align: "center" });
        x += colWidths[i];
      });
      y += 10;
    });

    // Add total
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Total:", doc.internal.pageSize.width - margin - colWidths[3], y);
    doc.text(formatRupiah(transaction.amountTotal), doc.internal.pageSize.width - margin, y, { align: "right" });

    
  
    // Return the PDF
    const pdfBuffer = doc.output("arraybuffer");
    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=transaction-${transaction.id}.pdf`,
      },
    });
  } catch (error) {
    console.error("Failed to generate invoice:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 