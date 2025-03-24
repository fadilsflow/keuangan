import { z } from "zod";

export const MonthHistorySchema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
});

export const YearHistorySchema = z.object({
  year: z.number().int().min(2000).max(2100),
}); 