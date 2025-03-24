import { prisma } from "@/lib/prisma";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { TransactionService } from "../services/transaction.service";
import { TransactionCreateSchema } from "../schemas/transaction.schema";

export const runtime = "nodejs";

const app = new Hono().basePath("/api");
const transactionService = new TransactionService(prisma);

app.post("/transactions", async (c) => {
  try {
    const rawBody = await c.req.json();
    const validationResult = TransactionCreateSchema.safeParse(rawBody);

    if (!validationResult.success) {
      return c.json(
        {
          error: "Validation failed",
          details: validationResult.error.flatten(),
        },
        400
      );
    }

    const transaction = await transactionService.createTransaction(validationResult.data);
    return c.json({ message: "Transaction created", transaction }, 201);
  } catch (error) {
    console.error("Database Error:", error);
    return c.json(
      { error: "Failed to create transaction", details: error },
      500
    );
  }
});

// Tambahkan route handlers lainnya dengan pola yang sama

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
