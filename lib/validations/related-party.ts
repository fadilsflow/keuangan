import { z } from "zod";

export const RelatedPartySchema = z.object({
  name: z.string().min(1, "Nama pihak terkait harus diisi"),
  description: z.string().optional(),
  contactInfo: z.string().optional(),
  type: z.enum(["income", "expense"], {
    required_error: "Tipe harus dipilih",
    invalid_type_error: "Tipe harus 'income' atau 'expense'",
  }).default("expense"),
});

export const RelatedPartyCreateSchema = RelatedPartySchema.extend({
  organizationId: z.string().min(1, "Organization ID is required"),
  userId: z.string().min(1, "User ID is required"),
});

export const RelatedPartyUpdateSchema = RelatedPartySchema.partial();

export type RelatedPartyCreateInput = z.infer<typeof RelatedPartyCreateSchema>;
export type RelatedPartyUpdateInput = z.infer<typeof RelatedPartyUpdateSchema>;
export type RelatedPartyInput = z.infer<typeof RelatedPartySchema>; 