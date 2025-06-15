import { z } from "zod";

export const ItemSchema = z.object({
  name: z.string().min(1, "Nama item harus diisi"),
  itemPrice: z.number().positive("Harga item harus positif"),
  quantity: z.number().int().positive("Kuantitas harus bilangan bulat positif"),
  masterItemId: z.string().optional(),
});

export const TransactionCreateSchema = z.object({
  date: z.coerce
    .date()
    .min(new Date("2000-01-01"), "Tanggal terlalu lampau")
    .max(new Date("2100-12-31"), "Tanggal terlalu jauh ke depan"),
  description: z.string().min(1, "Deskripsi harus diisi"),
  categoryId: z.string().min(1, "Kategori harus diisi"),
  relatedPartyId: z.string().min(1, "Pihak terkait harus diisi"),
  amountTotal: z.number().positive("Total harus positif"),
  paymentImg: z.string().optional(),
  type: z.enum(["pemasukan", "pengeluaran"]).default("pengeluaran"),
  items: z.array(ItemSchema).min(1, "Minimal satu item harus diisi"),
  organizationId: z.string().min(1, "Organization ID is required"),
  userId: z.string().min(1, "User ID is required"),
});

export const TransactionUpdateSchema = z.object({
  date: z.coerce
    .date()
    .min(new Date("2000-01-01"), "Tanggal terlalu lampau")
    .max(new Date("2100-12-31"), "Tanggal terlalu jauh ke depan")
    .optional(),
  description: z.string().min(1, "Deskripsi harus diisi").optional(),
  categoryId: z.string().min(1, "Kategori harus diisi").optional(),
  relatedPartyId: z.string().min(1, "Pihak terkait harus diisi").optional(),
  amountTotal: z.number().positive("Total harus positif").optional(),
  paymentImg: z.string().optional(),
  type: z.enum(["pemasukan", "pengeluaran"]).optional(),
  organizationId: z.string().min(1, "Organization ID is required").optional(),
  userId: z.string().min(1, "User ID is required").optional(),
});

export const IdParamSchema = z.object({
  id: z.string().min(1, "ID is required"),
});
