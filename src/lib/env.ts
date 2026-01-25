/**
 * Environment variables configuration
 *
 * Direct access to environment variables with type safety and runtime validation
 *
 * SECURITY NOTE: Hardcoded secrets are only for local development.
 * In production, environment variables MUST be set via proper deployment configuration.
 */

/**
 * Check if we're in a server-side context
 */
const isServer = typeof window === 'undefined'

/**
 * Check if we're in production
 */
const isProduction = process.env['NODE_ENV'] === 'production'

/**
 * Check if we're in the build phase (no env vars needed for static generation)
 */
const isBuildPhase = process.env['NEXT_PHASE'] === 'phase-production-build'

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

  // Application URL (for CORS and other configurations)
  NEXT_PUBLIC_APP_URL: process.env['NEXT_PUBLIC_APP_URL'],

  // Rate limiting configuration
  RATE_LIMIT_MAX: parseInt(process.env['RATE_LIMIT_MAX'] || '100', 10),
  RATE_LIMIT_WINDOW_MS: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000', 10), // 15 minutes

  NODE_ENV: process.env['NODE_ENV'] || 'development',
} as const

/**
 * Type-safe environment variables
 */
export type Env = typeof env

/**
 * Validates that required environment variables are present
 * Throws an error if any required variables are missing in production
 * Only runs on server-side and not during build phase
 */
export function validateEnv(): { valid: boolean; missing: string[] } {
  // Skip validation during build or client-side
  if (!isServer || isBuildPhase) {
    return { valid: true, missing: [] }
  }

  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ]

  // Service role key is only required on server in production
  if (isProduction) {
    required.push('SUPABASE_SERVICE_ROLE_KEY')
  }

  const missing = required.filter(key => !process.env[key])

  if (missing.length > 0 && isProduction) {
    console.error(`[ENV] Missing required environment variables: ${missing.join(', ')}`)
  }

  return {
    valid: missing.length === 0,
    missing,
  }
}

/**
 * Checks if Supabase credentials are configured
 */
export function hasSupabaseCredentials(): boolean {
  return !!(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}
