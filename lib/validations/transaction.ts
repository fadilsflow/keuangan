import { z } from "zod"

export const TransactionItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nama item harus diisi"),
  itemPrice: z.number().min(0, "Harga item tidak boleh negatif"),
  quantity: z.number().min(1, "Kuantitas minimal 1"),
  totalPrice: z.number().optional(),
  transactionId: z.string().optional(),
  masterItemId: z.string().optional()
})

export const TransactionCreateSchema = z.object({
  date: z.string().or(z.date()),
  description: z.string().min(1, "Deskripsi wajib diisi"),
  category: z.string().min(1, "Kategori wajib diisi"),
  relatedParty: z.string().min(1, "Pihak terkait wajib diisi"),
  type: z.enum(["pemasukan", "pengeluaran"]),
  amountTotal: z.number(),
  paymentImg: z.string().optional(),
  items: z.array(z.object({
    name: z.string().min(1, "Nama item wajib diisi"),
    itemPrice: z.number().min(0, "Harga tidak boleh negatif"),
    quantity: z.number().min(1, "Jumlah minimal 1"),
    totalPrice: z.number(),
    masterItemId: z.string().optional()
  }))
})

export type TransactionItem = z.infer<typeof TransactionItemSchema>
export type CreateTransactionDTO = z.infer<typeof TransactionCreateSchema> 