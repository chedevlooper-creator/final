/**
 * Environment variables configuration
 * 
 * Direct access to environment variables with type safety
 * 
 * SECURITY NOTE: Hardcoded secrets are only for local development.
 * In production, environment variables MUST be set via proper deployment configuration.
 */

/**
 * Export environment variables
 * 
 * Usage:
 * ```typescript
 * import { env } from '@/lib/env'
 * 
 * const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
 * ```
 */
export const env = {
  // Supabase configuration
  NEXT_PUBLIC_SUPABASE_URL: process.env['NEXT_PUBLIC_SUPABASE_URL'] || '',

  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || '',

  // Service role key (server-side only) - MUST be set in production
  SUPABASE_SERVICE_ROLE_KEY: process.env['SUPABASE_SERVICE_ROLE_KEY'] || '',

  // Sentry configuration (optional)
  NEXT_PUBLIC_SENTRY_DSN: process.env['NEXT_PUBLIC_SENTRY_DSN'],

  NODE_ENV: process.env['NODE_ENV'] || 'development',
} as const

/**
 * Type-safe environment variables
 */
export type Env = typeof env
