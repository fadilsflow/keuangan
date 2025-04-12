import { z } from "zod";

export const TransactionItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  itemPrice: z.number().min(0, "Price must be non-negative"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  masterItemId: z.string().optional(),
  organizationId: z.string(),
  userId: z.string(),
});

export const TransactionCreateSchema = z.object({
  date: z.string(),
  type: z.enum(["pemasukan", "pengeluaran"]),
  description: z.string(),
  categoryId: z.string(),
  relatedPartyId: z.string(),
  amountTotal: z.number().min(0, "Total amount must be non-negative"),
  paymentImg: z.string().optional(),
  items: z.array(TransactionItemSchema),
  organizationId: z.string(),
  userId: z.string(),
}); 