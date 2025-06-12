import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import jsPDF from "jspdf";
import { formatRupiah } from "@/lib/utils";

interface OrgMetadata {
  name?: string;
}

interface SessionClaims {
  org_metadata?: OrgMetadata;
  org_name?: string;
  org_slug?: string;
}

// Helper function to get organization name
async function getOrganizationName(): Promise<string> {
  const { sessionClaims } = await auth();
  const claims = sessionClaims as SessionClaims;

  // Check if we have org_metadata with name
  if (claims?.org_metadata?.name) {
    return claims.org_metadata.name;
  }

  // Fallback to org_name if available
  if (claims?.org_name) {
    return claims.org_name;
  }

  // Fallback to org_slug if available
  if (claims?.org_slug) {
    // Convert slug to display name (replace hyphens with spaces and capitalize each word)
    return String(claims.org_slug)
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  return "Organization";
}

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

    // Get organization name
    const orgName = await getOrganizationName();

    // Fetch transaction with items
    const transaction = await prisma.transaction.findUnique({
      where: {
        id: parseInt(transactionId),
        organizationId: orgId,
      },
      include: {
        items: true,
      },
    });

    if (!transaction) {
      return new NextResponse("Transaction not found", { status: 404 });
    }
    function capitalize(str: string) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
    // Generate PDF
    const doc = new jsPDF();
    let y = 30;
    const margin = 20;
    const pageWidth = doc.internal.pageSize.width;

    // Add header with organization name on left and INVOICE/KUITANSI on right
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");

    // Organization name on left
    doc.text(capitalize(orgName), margin, y);

    // INVOICE/KUITANSI on right
    const headerText = "INVOICE";
    doc.text(headerText, pageWidth - margin, y, { align: "right" });

    // Add full-width line below header
    y += 5;
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 20;

    // Add transaction details
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`No: INV-${transaction.id}`, margin, y);
    y += 10;
    doc.text(`Deskripsi: ${transaction.description}`, margin, y);
    y += 10;
    //make it capitalize
    doc.text(
      `${
        transaction.type === "pemasukan" ? "Konsumen" : "Supplier"
      } ${capitalize(transaction.relatedParty)}`,
      margin,
      y
    );
    y += 10;
    doc.text(`Kategori: ${capitalize(transaction.category)}`, margin, y);
    y += 20;

    // Add items table
    const headers = ["Item", "Quantity", "Harga", "Total"];
    const colWidths = [
      pageWidth * 0.4,
      pageWidth * 0.15,
      pageWidth * 0.15,
      pageWidth * 0.15,
    ];

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

    // Add total with better spacing
    y += 10;
    doc.setFont("helvetica", "bold");
    const totalLabelX = pageWidth - margin - colWidths[3] - 20; // Added more space between label and value
    const totalValueX = pageWidth - margin;

    doc.text("Total:", totalLabelX, y);
    doc.text(formatRupiah(transaction.amountTotal), totalValueX, y, {
      align: "right",
    });

    // Add signature section
    y += 40;
    const signatureWidth = 60;
    const signatureX = pageWidth - margin - signatureWidth;
    const currentDate = format(new Date(), "d MMMM yyyy", { locale: id });

    doc.setFont("helvetica", "normal");
    doc.text(`${currentDate}`, signatureX, y);
    y += 10;
    doc.text("Hormat Kami,", signatureX, y);
    y += 30;
    doc.line(signatureX, y, signatureX + signatureWidth, y); // Signature line
    y += 5;
    doc.text(
      capitalize(transaction.relatedParty),
      signatureX + signatureWidth / 2,
      y,
      {
        align: "center",
      }
    );

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
