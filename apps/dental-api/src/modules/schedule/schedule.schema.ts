import { z } from 'zod';

export const createOverrideSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  morning_enabled: z.boolean(),
  evening_enabled: z.boolean(),
  custom_session_enabled: z.boolean(),
  custom_session_label: z.string().nullable().optional(),
  custom_session_start: z.string().nullable().optional(),
  custom_session_end: z.string().nullable().optional(),
  reason: z.string().nullable().optional(),
});

export type CreateOverrideInput = z.infer<typeof createOverrideSchema>;
