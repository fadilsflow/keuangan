import { z } from "zod"

export const TransactionItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nama item harus diisi"),
  itemPrice: z.number().min(0, "Harga item tidak boleh negatif"),
  quantity: z.number().min(1, "Kuantitas minimal 1"),
  totalPrice: z.number().optional(),
  transactionId: z.string().optional()
})

export const TransactionCreateSchema = z.object({
  id: z.string().optional(),
  date: z.union([z.string(), z.date()]),
  description: z.string().min(1, "Deskripsi harus diisi"),
  category: z.string().min(1, "Kategori harus dipilih"),
  relatedParty: z.string().min(1, "Pihak terkait harus diisi"),
  amountTotal: z.number().min(0, "Total tidak boleh negatif"),
  type: z.enum(["pemasukan", "pengeluaran"]),
  paymentImg: z.string().optional(),
  monthHistoryId: z.string().optional(),
  items: z.array(TransactionItemSchema)
})

export type TransactionItem = z.infer<typeof TransactionItemSchema>
export type CreateTransactionDTO = z.infer<typeof TransactionCreateSchema> 