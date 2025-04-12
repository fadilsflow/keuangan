import { PrismaClient } from "@prisma/client";
import { HistoryService } from "./history.service";
import type { CreateTransactionDTO } from "../types/transaction.types";

export class TransactionService {
  private historyService: HistoryService;

  constructor(private prisma: PrismaClient) {
    this.historyService = new HistoryService(prisma);
  }

  async createTransaction(data: CreateTransactionDTO) {
    return await this.prisma.$transaction(async (tx) => {
      try {
        // 1. Create transaction first
        const newTransaction = await tx.transaction.create({
          data: {
            date: new Date(data.date),
            description: data.description,
            category: data.category,
            relatedParty: data.relatedParty,
            amountTotal: data.amountTotal,
            paymentImg: data.paymentImg || "",
            type: data.type,
            organizationId: data.organizationId,
            userId: data.userId,
            items: {
              create: data.items.map((item) => ({
                name: item.name,
                itemPrice: item.itemPrice,
                quantity: item.quantity,
                totalPrice: item.itemPrice * item.quantity,
                organizationId: data.organizationId,
                userId: data.userId,
                ...(item.masterItemId && { masterItemId: item.masterItemId }),
              })),
            },
          },
          include: { items: true },
        });

        // 2. Update histories using the same transaction client
        await this.historyService.updateHistories(
          tx as PrismaClient  ,
          new Date(data.date),
          data.amountTotal,
          data.type as "income" | "expense",
          newTransaction.id
        );

        // 3. Return complete transaction data
        const result = await tx.transaction.findUnique({
          where: { id: newTransaction.id },
          include: {
            items: true,
            monthHistory: true,
          },
        });

        if (!result) {
          throw new Error("Transaction not found after creation");
        }

        return result;
      } catch (error) {
        console.error("Transaction creation error:", error);
        throw error;
      }
    });
  }

  // Tambahkan method lain untuk update dan delete
} 