import { z } from 'zod';

/** Treat empty env strings as unset (common in `.env.local` templates). */
function emptyToUndefined(value: unknown): unknown {
  if (value === '' || value === undefined || value === null) return undefined;
  return value;
}

/**
 * Environment contract (SSOT for runtime config shape).
 * Public keys may be omitted locally — Supabase features stay disabled.
 * Service role must never be exposed to the browser.
 */
const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).optional(),
    VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional(),
    NEXT_PUBLIC_APP_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
    NEXT_PUBLIC_SUPABASE_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
    SUPABASE_SERVICE_ROLE_KEY: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
    CRON_SECRET: z.preprocess(emptyToUndefined, z.string().min(16).optional()),
  })
  .superRefine((data, ctx) => {
    const hasUrl = Boolean(data.NEXT_PUBLIC_SUPABASE_URL);
    const hasAnon = Boolean(data.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    if (hasUrl !== hasAnon) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must both be set or both omitted',
      });
    }
  });

const parsed = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  VERCEL_ENV: process.env.VERCEL_ENV,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  CRON_SECRET: process.env.CRON_SECRET,
});

if (!parsed.success) {
  throw new Error(`Invalid environment: ${parsed.error.message}`);
}

const data = parsed.data;

export const env = {
  nodeEnv: data.NODE_ENV ?? 'development',
  vercelEnv: data.VERCEL_ENV ?? null,
  appUrl: data.NEXT_PUBLIC_APP_URL ?? null,
  supabaseUrl: data.NEXT_PUBLIC_SUPABASE_URL ?? null,
  supabaseAnonKey: data.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? null,
  /** Server-only — never import this module into Client Components for this field. */
  supabaseServiceRoleKey: data.SUPABASE_SERVICE_ROLE_KEY ?? null,
  cronSecret: data.CRON_SECRET ?? null,
  isSupabaseConfigured: Boolean(
    data.NEXT_PUBLIC_SUPABASE_URL && data.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ),
  isProduction: data.NODE_ENV === 'production' || data.VERCEL_ENV === 'production',
};

export type AppEnv = typeof env;
