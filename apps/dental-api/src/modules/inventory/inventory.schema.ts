import { z } from 'zod';

const MAX_QTY = 100000;

const qty = (label: string) =>
  z
    .number({ invalid_type_error: `${label} must be a number` })
    .int(`${label} must be a whole number`)
    .min(0, `${label} cannot be negative`)
    .max(MAX_QTY, `${label} cannot exceed ${MAX_QTY}`);

const imageUrl = z
  .string()
  .url('Image URL is invalid')
  .max(2048)
  .refine((u) => /^https?:\/\//i.test(u), 'Image URL must start with http(s)://')
  .nullable();

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid inventory item ID'),
});

export const createItemSchema = z
  .object({
    name: z.string().trim().min(1, 'Item name is required').max(120),
    description: z.string().trim().max(500).nullable().optional(),
    unit: z.string().trim().min(1, 'Unit is required').max(30).default('pcs'),
    current_quantity: qty('Initial quantity').default(0),
    minimum_threshold: qty('Low stock threshold').default(10),
    image_url: imageUrl.optional(),
  })
  .strict();

// current_quantity is intentionally NOT editable here — it changes only via stock logs.
export const updateItemSchema = z
  .object({
    name: z.string().trim().min(1, 'Item name is required').max(120),
    description: z.string().trim().max(500).nullable(),
    unit: z.string().trim().min(1, 'Unit is required').max(30),
    minimum_threshold: qty('Low stock threshold'),
    image_url: imageUrl, // null clears the image
  })
  .partial()
  .strict()
  .refine((d) => Object.keys(d).length > 0, { message: 'No fields to update' });

export const stockChangeSchema = z
  .object({
    action: z.enum(['RESTOCK', 'USED', 'ADJUSTMENT', 'WRITE_OFF']),
    quantity_change: z
      .number({ invalid_type_error: 'Quantity must be a number' })
      .int('Quantity must be a whole number')
      .min(-MAX_QTY, `Quantity cannot exceed ${MAX_QTY}`)
      .max(MAX_QTY, `Quantity cannot exceed ${MAX_QTY}`),
    notes: z.string().trim().max(500).optional(),
  })
  .strict()
  .superRefine((d, ctx) => {
    const fail = (message: string) =>
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['quantity_change'], message });
    switch (d.action) {
      case 'RESTOCK':
        if (d.quantity_change <= 0) fail('RESTOCK quantity must be positive');
        break;
      case 'USED':
        if (d.quantity_change >= 0) fail('USED quantity must be negative');
        break;
      case 'WRITE_OFF':
        if (d.quantity_change >= 0) fail('WRITE_OFF quantity must be negative');
        break;
      case 'ADJUSTMENT':
        if (d.quantity_change === 0) fail('ADJUSTMENT quantity cannot be zero');
        break;
    }
  });

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type StockChangeInput = z.infer<typeof stockChangeSchema>;
