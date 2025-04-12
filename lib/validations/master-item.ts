import { z } from "zod";

export const MasterItemSchema = z.object({
  name: z.string().min(1, "Nama item tidak boleh kosong"),
  description: z.string().optional(),
  defaultPrice: z.number().nonnegative("Harga tidak boleh negatif"),
  type: z.enum(["income", "expense"], {
    required_error: "Tipe harus dipilih",
    invalid_type_error: "Tipe harus 'income' atau 'expense'",
  }).default("expense"),
});

export const MasterItemCreateSchema = MasterItemSchema.extend({
  organizationId: z.string().min(1, "Organization ID is required"),
  userId: z.string().min(1, "User ID is required"),
});

export const MasterItemUpdateSchema = MasterItemSchema.partial();

export type MasterItemCreateInput = z.infer<typeof MasterItemCreateSchema>;
export type MasterItemUpdateInput = z.infer<typeof MasterItemUpdateSchema>;

export type MasterItemInput = z.infer<typeof MasterItemSchema>; 