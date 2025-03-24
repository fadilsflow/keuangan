import { z } from 'zod';

// Item Schema
export const ItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nama item wajib diisi"),
  itemPrice: z.number().positive("Harga item harus positif"),
  quantity: z.number().int().positive("Kuantitas harus berupa bilangan bulat positif"),
  totalPrice: z.number().optional() // Dihitung otomatis
});

// Transaction Schema
export const TransactionSchema = z.object({
  id: z.string().optional(),
  date: z.string().or(z.date()), // Menerima string atau Date object
  description: z.string().min(3, "Deskripsi minimal 3 karakter"),
  category: z.string().min(1, "Kategori wajib diisi"),
  relatedParty: z.string().min(1, "Pihak terkait wajib diisi"),
  paymentImg: z.string().optional(),
  type: z.enum(["income", "expense"]),
  items: z.array(ItemSchema).min(1, "Minimal satu item harus diisi")
});

// Type untuk request transaksi
export type TransactionRequest = z.infer<typeof TransactionSchema>;

// Type untuk response transaksi
export type TransactionResponse = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  date: Date;
  description: string;
  category: string;
  relatedParty: string;
  amountTotal: number;
  paymentImg: string;
  type: string;
  monthHistoryId: string | null;
  items: {
    id: string;
    name: string;
    itemPrice: number;
    quantity: number;
    totalPrice: number;
    transactionId: string;
  }[];
};

// Type untuk pagination response
export type PaginationResponse<T> = {
  data: T[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
};

// Type untuk response upload file
export type UploadResponse = {
  url: string;
  filename: string;
};