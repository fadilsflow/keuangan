import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { TransactionCreateSchema } from "./transaction.schema";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  try {
    const { orgId, userId } = await auth();

    if (!orgId) {
      return NextResponse.json(
        { error: "No organization selected" },
        { status: 403 }
      );
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
      const categoryId = searchParams.get("category");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    // Calculate pagination values
    const skip = (page - 1) * pageSize;

    const where: any = {
      organizationId: orgId,
    };

    if (type && type !== "all") where.type = type;
    if (categoryId && categoryId !== "all") where.categoryId = categoryId;
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }
    if (search) {
      where.OR = [
        { description: { contains: search } },
        { relatedParty: { name: { contains: search } } },
      ];
    }

    // Get total count for pagination
    const totalItems = await prisma.transaction.count({ where });

    // Calculate total pages
    const totalPages = Math.ceil(totalItems / pageSize);

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: {
        date: "desc",
      },
      include: {
        items: true,
        category: true,
        relatedParty: true,
      },
      skip,
      take: pageSize,
    });

    const formattedTransactions = transactions.map((transaction) => ({
      id: transaction.id,
      date: transaction.date,
      type: transaction.type,
      description: transaction.description,
      category: transaction.category.name,
      categoryId: transaction.categoryId,
      relatedParty: transaction.relatedParty.name,
      relatedPartyId: transaction.relatedPartyId,
      amountTotal: transaction.amountTotal,
      paymentImg: transaction.paymentImg,
      items: transaction.items.map((item) => ({
        id: item.id,
        name: item.name,
        itemPrice: item.itemPrice,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
      })),
    }));

    return NextResponse.json({
      data: formattedTransactions,
      meta: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize,
      },
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
    const { orgId, userId } = await auth();

    if (!orgId) {
      return NextResponse.json(
        { error: "No organization selected" },
        { status: 403 }
      );
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const dataWithIds = {
      ...body,
      organizationId: orgId,
      userId: userId,
    };

    const validationResult = TransactionCreateSchema.safeParse(dataWithIds);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { items, ...transactionData } = validationResult.data;

    const transaction = await prisma.transaction.create({
      data: {
        ...transactionData,
        items: {
          create: items.map((item) => ({
            name: item.name,
            itemPrice: item.itemPrice,
            quantity: item.quantity,
            totalPrice: item.itemPrice * item.quantity,
            masterItemId: item.masterItemId,
            organizationId: orgId,
            userId: userId,
          })),
        },
      },
      include: {
        items: true,
        category: true,
        relatedParty: true,
      },
    });

    return NextResponse.json(
      {
        message: "Transaction created",
        transaction: {
          id: transaction.id,
          date: transaction.date,
          type: transaction.type,
          description: transaction.description,
          category: transaction.category.name,
          categoryId: transaction.categoryId,
          relatedParty: transaction.relatedParty.name,
          relatedPartyId: transaction.relatedPartyId,
          amountTotal: transaction.amountTotal,
          items: transaction.items.map((item) => ({
            id: item.id,
            name: item.name,
            itemPrice: item.itemPrice,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
          })),
        },
      },
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
