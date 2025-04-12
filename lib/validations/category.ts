import { z } from "zod";

export const CategorySchema = z.object({
  name: z.string().min(1, "Nama kategori harus diisi"),
  description: z.string().optional(),
  type: z.enum(["income", "expense"], {
    required_error: "Tipe harus dipilih",
    invalid_type_error: "Tipe harus 'income' atau 'expense'",
  }).default("expense"),
});

export const CategoryCreateSchema = CategorySchema.extend({
  organizationId: z.string().min(1, "Organization ID is required"),
  userId: z.string().min(1, "User ID is required"),
});

export const CategoryUpdateSchema = CategorySchema.partial();

export type CategoryCreateInput = z.infer<typeof CategoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof CategoryUpdateSchema>;
export type CategoryInput = z.infer<typeof CategorySchema>; 