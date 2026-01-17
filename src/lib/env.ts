import { z } from 'zod'

/**
 * Environment variables validation schema
 * 
 * This ensures all required environment variables are present and valid
 * at runtime. If any variable is missing or invalid, the app will fail
 * to start with a clear error message.
 */
const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url({ message: 'NEXT_PUBLIC_SUPABASE_URL must be a valid URL' }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, { message: 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required' }),
  
  // Environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
})

// Validate environment variables at runtime
// This will throw an error if any variable is missing or invalid
const validatedEnv = envSchema.safeParse(process.env)

if (!validatedEnv.success) {
  const errors = validatedEnv.error.errors
    .map(err => `${err.path.join('.')}: ${err.message}`)
    .join('\n')
  
  throw new Error(
    `❌ Invalid environment variables:\n${errors}\n\n` +
    `Please check your .env.local file and ensure all required variables are set.\n` +
    `See .env.example for reference.`
  )
}

/**
 * Export validated environment variables
 * 
 * Usage:
 * ```typescript
 * import { env } from '@/lib/env'
 * 
 * const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
 * ```
 */
export const env = validatedEnv.data

/**
 * Type-safe environment variables
 * 
 * This provides autocomplete and type checking for all environment variables
 */
export type Env = z.infer<typeof envSchema>
