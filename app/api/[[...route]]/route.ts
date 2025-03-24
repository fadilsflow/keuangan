import { prisma } from "@/lib/prisma";
import { Hono } from "hono";
import { handle } from "hono/vercel";
export const runtime = "nodejs";

const app = new Hono().basePath("/api");

app.get("/transactions", async (c) => {
  try {
    const transaction = await prisma.transaction.findMany({
      include: {
        items: true,
        monthHistory: true,
      },
    });
    return c.json(transaction);
  } catch (error) {
    return c.json({ error: "Gagal untuk menemukan transaksi" }, 500);
  }
});

app.post("/transactions", async (c) => {
  try {
    const body = await c.req.json();
    console.log("Request Body:", body); // Debugging

    // Validasi data
    if (!body.date || !body.description || !body.amountTotal || !body.items) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Buat transaksi baru
    const transaction = await prisma.transaction.create({
      data: {
        date: new Date(body.date),
        description: body.description,
        category: body.category,
        relatedParty: body.relatedParty,
        amountTotal: body.amountTotal,
        paymentImg: body.paymentImg || "",
        type: body.type || "income",

        items: {
          create: body.items.map((item: any) => ({
            name: item.name,
            itemPrice: item.itemPrice,
            quantity: item.quantity,
            totalPrice: item.itemPrice * item.quantity,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return c.json({ message: "Transaction created", transaction }, 201);
  } catch (error) {
    console.error("Database Error:", error);
    return c.json(
      { error: "Failed to create transaction", details: error },
      500
    );
  }
});

app.put("/transactions/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();

    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: {
        date: body.date ? new Date(body.date) : undefined,
        description: body.description,
        category: body.category,
        relatedParty: body.relatedParty,
        amountTotal: body.amountTotal,
        paymentImg: body.paymentImg,
        type: body.type,
      },
      include: { items: true },
    });

    return c.json({ message: "Transaction updated", updatedTransaction });
  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed to update transaction" }, 500);
  }
});
app.delete("/transactions/:id", async (c) => {
  try {
    const id = c.req.param("id");

    // Cek apakah transaksi ada sebelum menghapus
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existingTransaction) {
      return c.json({ error: "Transaction not found" }, 404);
    }

    // Hapus transaksi
    await prisma.transaction.delete({
      where: { id },
    });

    return c.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed to delete transaction" }, 500);
  }
});

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
