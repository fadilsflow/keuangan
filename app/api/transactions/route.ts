import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { TransactionCreateSchema } from "../schemas/transaction.schema";
import { TransactionService } from "../services/transaction.service";

const transactionService = new TransactionService(prisma);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const search = searchParams.get("search");

    // Build where clause
    const where: any = {};

    if (type && type !== "all") where.type = type;
    if (category && category !== "all") where.category = category;
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }
    if (search) {
      where.OR = [
        { description: { contains: search } },
        { relatedParty: { contains: search } },
      ];
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        items: {
          select: {
            id: true,
            name: true,
            itemPrice: true,
            quantity: true,
            totalPrice: true,
          }
        }
      }
    });

    return NextResponse.json({
      data: transactions,
      meta: {
        total: transactions.length
      }
    });
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validasi input
    const validationResult = TransactionCreateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const transaction = await transactionService.createTransaction(validationResult.data);

    return NextResponse.json(
      { message: "Transaction created", transaction },
      { status: 201 }
    );
  } catch (error) {
    console.error("Transaction creation error:", error);
    return NextResponse.json(
      { error: "Failed to create transaction", details: error },
      { status: 500 }
    );
  }
} 