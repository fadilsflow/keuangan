import { PrismaClient } from "@prisma/client";

export class HistoryService {
  constructor(private prisma: PrismaClient) {}

  async updateHistories(
    tx: PrismaClient,
    transactionDate: Date,
    amount: number,
    type: "income" | "expense",
    transactionId: string | null
  ) {
    const year = transactionDate.getFullYear();
    const month = transactionDate.getMonth() + 1;

    const yearHistory = await tx.yearHistory.upsert({
      where: { year },
      create: {
        year,
        totalIncome: type === "income" ? amount : 0,
        totalExpense: type === "expense" ? amount : 0
      },
      update: type === "income"
        ? { totalIncome: { increment: amount } }
        : { totalExpense: { increment: amount } }
    });

    const monthHistory = await tx.monthHistory.upsert({
      where: {
        year_month: { year, month }
      },
      create: {
        year,
        month,
        yearHistoryId: yearHistory.id,
        totalIncome: type === "income" ? amount : 0,
        totalExpense: type === "expense" ? amount : 0
      },
      update: {
        totalIncome: type === "income" 
          ? { increment: amount }
          : undefined,
        totalExpense: type === "expense"
          ? { increment: amount }
          : undefined,
        yearHistoryId: yearHistory.id
      }
    });

    if (transactionId) {
      await tx.transaction.update({
        where: { id: transactionId },
        data: { monthHistoryId: monthHistory.id }
      });
    }

    return monthHistory.id;
  }
} 