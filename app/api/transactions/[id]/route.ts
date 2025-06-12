import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Transaction } from "@prisma/client";

// Extended type to include the added fields
interface ExtendedTransaction extends Transaction {
  organizationId: string;
  userId: string;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const transaction = (await prisma.transaction.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        items: true,
      },
    })) as unknown as ExtendedTransaction & { items: any[] };

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Verify that the transaction belongs to the user's organization
    if (transaction.organizationId !== orgId || transaction.userId !== userId) {
      return NextResponse.json(
        { error: "You do not have permission to access this transaction" },
        { status: 403 }
      );
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return NextResponse.json(
      { error: "Failed to fetch transaction" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify the transaction exists and belongs to the user's organization
    const existingTransaction = (await prisma.transaction.findUnique({
      where: { id: parseInt(id) },
    })) as unknown as ExtendedTransaction;

    if (!existingTransaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Check permission
    if (
      existingTransaction.organizationId !== orgId ||
      existingTransaction.userId !== userId
    ) {
      return NextResponse.json(
        { error: "You do not have permission to update this transaction" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Delete existing items
    await prisma.item.deleteMany({
      where: {
        transactionId: parseInt(id),
      },
    });

    // Update transaction and create new items with proper type casting
    const updateData = {
      date: new Date(body.date),
      description: body.description,
      category: body.category,
      relatedParty: body.relatedParty,
      amountTotal: body.amountTotal,
      type: body.type,
      paymentImg: body.paymentImg,
      items: {
        create: body.items.map((item: any) => ({
          name: item.name,
          itemPrice: Number(item.itemPrice),
          quantity: Number(item.quantity),
          totalPrice: Number(item.itemPrice) * Number(item.quantity),
          organizationId: existingTransaction.organizationId,
          userId: existingTransaction.userId,
        })),
      },
    } as any; // Use type assertion for the update data

    const transaction = await prisma.transaction.update({
      where: {
        id: parseInt(id),
      },
      data: updateData,
      include: {
        items: true,
      },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Error updating transaction:", error);
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify the transaction exists and belongs to the user's organization
    const existingTransaction = (await prisma.transaction.findUnique({
      where: { id: parseInt(id) },
    })) as unknown as ExtendedTransaction;

    if (!existingTransaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Check permission
    if (
      existingTransaction.organizationId !== orgId ||
      existingTransaction.userId !== userId
    ) {
      return NextResponse.json(
        { error: "You do not have permission to delete this transaction" },
        { status: 403 }
      );
    }

    // Delete related items first
    await prisma.item.deleteMany({
      where: { transactionId: parseInt(id) },
    });

    // Delete the transaction
    await prisma.transaction.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 }
    );
  }
}
