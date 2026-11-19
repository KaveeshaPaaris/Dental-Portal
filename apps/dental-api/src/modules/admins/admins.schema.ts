import { z } from 'zod';

/** Server-side password policy. Keep in sync with admin-dashboard/src/lib/passwordPolicy.ts */
export const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .max(72, 'Password must be at most 72 characters')
  .regex(/[a-z]/, 'Password must include a lowercase letter')
  .regex(/[A-Z]/, 'Password must include an uppercase letter')
  .regex(/[0-9]/, 'Password must include a number')
  .regex(/[^A-Za-z0-9]/, 'Password must include a symbol');

export const createAdminSchema = z
  .object({
    full_name: z.string().trim().min(2, 'Full name is required').max(100),
    email: z.string().trim().toLowerCase().email('Invalid email address').max(254),
    password: passwordSchema,
    role: z.enum(['ADMIN', 'SUPER_ADMIN']),
  })
  .strict()
  .refine((d) => !d.password.toLowerCase().includes(d.email.split('@')[0]), {
    message: 'Password must not contain the email name',
    path: ['password'],
  });

export type CreateAdminInput = z.infer<typeof createAdminSchema>;
