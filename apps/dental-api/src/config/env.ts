import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Supabase
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  SUPABASE_JWT_SECRET: z.string().min(1, 'SUPABASE_JWT_SECRET is required'),

  // Resend
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),
  EMAIL_FROM: z.string().email('EMAIL_FROM must be a valid email'),
  EMAIL_FROM_NAME: z.string().default('Charming Dental Clinic'),
  REPLY_TO_EMAIL: z.string().email().optional().or(z.literal('').transform(() => undefined)),

  // Email OTP hashing key (optional - falls back to SUPABASE_JWT_SECRET)
  OTP_SECRET: z.string().min(32, 'OTP_SECRET must be at least 32 characters').optional().or(z.literal('').transform(() => undefined)),

  // CORS
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),

  // App URLs
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  ADMIN_URL: z.string().url().default('http://localhost:3000/admin'),

  // AI (Gemini)
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  EMBEDDING_MODEL: z.string().default('gemini-embedding-2'),
  CHAT_MODEL: z.string().default('gemini-2.5-flash'),
  SIMILARITY_THRESHOLD: z.coerce.number().min(0).max(1).default(0.5),
  MAX_RETRIEVAL_RESULTS: z.coerce.number().int().min(1).max(20).default(5),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
console.log(`[Config] Running with CHAT_MODEL: ${env.CHAT_MODEL}`);
export type Env = typeof env;
